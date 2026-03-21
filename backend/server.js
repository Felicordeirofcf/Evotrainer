const express = require('express');
const cors = require('cors');
const querystring = require('querystring');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();

app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-evotrainer-2026';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// ==========================
// HELPERS
// ==========================
const normalizeEmail = (value = '') => String(value).trim().toLowerCase();
const normalizePhone = (value = '') => String(value).replace(/\D/g, '');
const normalizeCpfCnpj = (value = '') => String(value).replace(/\D/g, '');

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const isNumericString = (value) => /^\d+$/.test(String(value || '').trim());

const isCpfOrCnpjValidLength = (value) => {
  const doc = normalizeCpfCnpj(value);
  return doc.length === 11 || doc.length === 14;
};

// ==========================
// AUTH
// ==========================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Sessão expirada.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido.' });
    req.user = user;
    next();
  });
};

const isSuperAdmin = (req, res, next) => {
  if (req.user?.role !== 'SUPERADMIN') {
    return res.status(403).json({ error: 'Acesso Master negado.' });
  }
  next();
};

const isAdminOrMaster = (req, res, next) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPERADMIN') {
    return res.status(403).json({ error: 'Restrito.' });
  }
  next();
};

// ==========================
// WEBHOOK PARSER HELPERS
// ==========================
function setDeep(target, path, value) {
  const normalized = String(path).replace(/\]/g, '');
  const parts = normalized.split('[').filter(Boolean);

  let current = target;

  for (let i = 0; i < parts.length; i += 1) {
    const key = parts[i];

    if (i === parts.length - 1) {
      current[key] = value;
      return;
    }

    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }

    current = current[key];
  }
}

function parseUrlEncodedBody(rawBody = '') {
  const parsedFlat = querystring.parse(rawBody);
  const result = {};

  for (const [key, value] of Object.entries(parsedFlat)) {
    if (key.includes('[')) {
      setDeep(result, key, value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

function extractPayload(req) {
  const rawBody = typeof req.body === 'string' ? req.body : '';
  if (!rawBody) return {};

  const contentType = String(req.headers['content-type'] || '').toLowerCase();

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(rawBody);
    } catch {
      return {};
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return parseUrlEncodedBody(rawBody);
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return {};
  }
}

function inferWebhookEvent(payload) {
  if (payload && typeof payload === 'object' && payload.event) {
    return String(payload.event).toUpperCase();
  }

  const payment =
    payload?.payment && typeof payload.payment === 'object'
      ? payload.payment
      : payload || {};

  const status = String(payment?.status || payload?.status || '').toUpperCase();

  if (status === 'RECEIVED') return 'PAYMENT_RECEIVED';
  if (status === 'CONFIRMED') return 'PAYMENT_CONFIRMED';
  if (status === 'CREATED') return 'PAYMENT_CREATED';

  return null;
}

function extractPaymentObject(payload) {
  if (payload?.payment && typeof payload.payment === 'object') {
    return payload.payment;
  }
  return payload || {};
}

// ==========================
// USER LOOKUP HELPERS
// ==========================
async function findUserByReference(externalReference) {
  if (!externalReference) return null;

  const ref = String(externalReference).trim();

  if (isNumericString(ref)) {
    const byId = await prisma.user.findUnique({
      where: { id: parseInt(ref, 10) },
    });
    if (byId) return byId;
  }

  const refEmail = normalizeEmail(ref);
  if (refEmail) {
    const byEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: refEmail,
          mode: 'insensitive',
        },
      },
    });
    if (byEmail) return byEmail;
  }

  return null;
}

async function findUserByEmail(email) {
  const emailNormalizado = normalizeEmail(email);
  if (!emailNormalizado) return null;

  return prisma.user.findFirst({
    where: {
      email: {
        equals: emailNormalizado,
        mode: 'insensitive',
      },
    },
  });
}

async function findUserByPhone(phone) {
  const phoneNormalizado = normalizePhone(phone);
  if (!phoneNormalizado) return null;

  const candidatos = await prisma.user.findMany({
    where: {
      phone: { not: null },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      plano: true,
    },
  });

  return candidatos.find((u) => normalizePhone(u.phone || '') === phoneNormalizado) || null;
}

async function liberarPlanoPro(user, origem = 'webhook') {
  const vencimento = addDays(new Date(), 30);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      plano: 'PRO',
      iaUsadaMes: 0,
      planExpiresAt: vencimento,
    },
    select: {
      id: true,
      name: true,
      email: true,
      plano: true,
      planExpiresAt: true,
    },
  });

  console.log(`✅ [ASAAS] Plano PRO liberado via ${origem}:`, {
    id: updated.id,
    email: updated.email,
    plano: updated.plano,
    planExpiresAt: updated.planExpiresAt,
  });

  return updated;
}

// ==========================
// PROCESSAMENTO WEBHOOK
// ==========================
async function processAsaasWebhook(payload) {
  const payment = extractPaymentObject(payload);
  const event = inferWebhookEvent(payload);
  const paymentId = payment?.id || payload?.id || null;
  const customerId = payment?.customer || payload?.customer || null;

  const externalReference =
    payment?.externalReference ||
    payload?.externalReference ||
    payload?.paymentLink?.externalReference ||
    null;

  console.log('🔔 [ASAAS] Evento recebido:', event);
  console.log('🧾 [ASAAS] payment.id:', paymentId || 'sem payment.id');
  console.log('👤 [ASAAS] customerId:', customerId || 'sem customerId');
  console.log('🏷️ [ASAAS] externalReference:', externalReference || 'sem externalReference');

  const eventosAceitos = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'];

  if (!eventosAceitos.includes(event)) {
    console.log('ℹ️ [ASAAS] Evento ignorado:', event);
    return { ok: true, reason: 'ignored_event', event };
  }

  let user = null;

  if (externalReference) {
    user = await findUserByReference(externalReference);

    if (user) {
      const updated = await liberarPlanoPro(user, 'externalReference');
      return {
        ok: true,
        reason: 'updated_by_external_reference',
        userId: updated.id,
        email: updated.email,
        plano: updated.plano,
      };
    }

    console.log('⚠️ [ASAAS] externalReference não encontrou usuário.');
  }

  const emailNoPayload = normalizeEmail(payment?.customerEmail || payload?.customerEmail || '');
  const phoneNoPayload = normalizePhone(payment?.customerPhone || payload?.customerPhone || '');

  if (emailNoPayload) {
    user = await findUserByEmail(emailNoPayload);
    if (user) {
      const updated = await liberarPlanoPro(user, 'email_payload');
      return {
        ok: true,
        reason: 'updated_by_email_payload',
        userId: updated.id,
        email: updated.email,
        plano: updated.plano,
      };
    }
  }

  if (phoneNoPayload) {
    user = await findUserByPhone(phoneNoPayload);
    if (user) {
      const updated = await liberarPlanoPro(user, 'phone_payload');
      return {
        ok: true,
        reason: 'updated_by_phone_payload',
        userId: updated.id,
        email: updated.email,
        plano: updated.plano,
      };
    }
  }

  if (!customerId) {
    console.log('⚠️ [ASAAS] customerId ausente no payload.');
    return {
      ok: false,
      reason: 'customer_missing',
      event,
      paymentId,
      externalReference,
    };
  }

  if (!process.env.ASAAS_API_KEY) {
    console.log('❌ [ASAAS] ASAAS_API_KEY não configurada.');
    return { ok: false, reason: 'asaas_key_missing' };
  }

  let customerData = null;

  try {
    const asaasRes = await fetch(`https://api.asaas.com/v3/customers/${customerId}`, {
      method: 'GET',
      headers: {
        access_token: process.env.ASAAS_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const raw = await asaasRes.text();

    console.log('📡 [ASAAS] status customer fetch:', asaasRes.status);

    if (!asaasRes.ok) {
      console.log('❌ [ASAAS] Falha ao consultar cliente no Asaas:', raw);
      return { ok: false, reason: 'asaas_customer_fetch_failed', status: asaasRes.status };
    }

    try {
      customerData = JSON.parse(raw);
    } catch {
      console.log('❌ [ASAAS] Resposta inválida do Asaas:', raw);
      return { ok: false, reason: 'asaas_invalid_json' };
    }
  } catch (err) {
    console.error('🔥 [ASAAS] Erro ao consultar API do Asaas:', err);
    return { ok: false, reason: 'asaas_fetch_exception', error: err.message };
  }

  const emailPagador = normalizeEmail(customerData?.email || '');
  const phonePagador = normalizePhone(customerData?.mobilePhone || customerData?.phone || '');

  console.log('📧 [ASAAS] emailPagador:', emailPagador || 'sem email');
  console.log('📱 [ASAAS] phonePagador:', phonePagador || 'sem telefone');

  if (emailPagador) {
    user = await findUserByEmail(emailPagador);
    if (user) {
      const updated = await liberarPlanoPro(user, 'email');
      return {
        ok: true,
        reason: 'updated_by_email',
        userId: updated.id,
        email: updated.email,
        plano: updated.plano,
      };
    }
  }

  if (phonePagador) {
    user = await findUserByPhone(phonePagador);
    if (user) {
      const updated = await liberarPlanoPro(user, 'phone');
      return {
        ok: true,
        reason: 'updated_by_phone',
        userId: updated.id,
        email: updated.email,
        plano: updated.plano,
      };
    }
  }

  console.log('⚠️ [ASAAS] Nenhum usuário encontrado para este pagamento.', {
    emailPagador: emailPagador || null,
    phonePagador: phonePagador || null,
    externalReference: externalReference || null,
    paymentId: paymentId || null,
  });

  return {
    ok: false,
    reason: 'user_not_found',
    emailPagador: emailPagador || null,
    phonePagador: phonePagador || null,
    externalReference: externalReference || null,
    paymentId: paymentId || null,
  };
}

// ==========================
// WEBHOOK ASAAS
// IMPORTANTE: antes do express.json global
// ==========================
app.post(
  ['/api/webhook/asaas', '/api/webhooks/asaas'],
  express.text({ type: '*/*', limit: '2mb' }),
  async (req, res) => {
    try {
      console.log('📥 [ASAAS] headers:', {
        contentType: req.headers['content-type'],
        userAgent: req.headers['user-agent'],
        webhookToken: req.headers['asaas-access-token'] ? 'presente' : 'ausente',
      });

      if (process.env.ASAAS_WEBHOOK_TOKEN) {
        const tokenRecebido = req.headers['asaas-access-token'];
        if (tokenRecebido !== process.env.ASAAS_WEBHOOK_TOKEN) {
          console.error('❌ [ASAAS] Token do webhook inválido.');
          return res.status(200).json({
            status: 'ignored',
            reason: 'invalid_webhook_token',
          });
        }
      }

      const payload = extractPayload(req);

      console.log('📥 [ASAAS] raw body length:', typeof req.body === 'string' ? req.body.length : 0);
      console.log('📥 [ASAAS] payload keys:', payload && typeof payload === 'object' ? Object.keys(payload) : []);
      console.log('📥 [ASAAS] payload.event:', payload?.event || null);

      const result = await processAsaasWebhook(payload);

      console.log('📦 [ASAAS] Resultado do processamento:', result);

      return res.status(200).json({
        status: 'processed',
        result,
      });
    } catch (e) {
      console.error('🔥 [ASAAS] Erro crítico no webhook:', e);
      return res.status(200).json({
        status: 'error_handled',
        error: e.message || 'Erro interno no webhook.',
      });
    }
  }
);

// ==========================
// PARSERS GERAIS
// ==========================
app.use(express.json({ limit: '15mb', type: ['application/json', 'application/*+json'] }));
app.use(express.urlencoded({ extended: true }));

// ==========================
// HEALTH
// ==========================
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// ==========================
// CRIAR COBRANÇA ASAAS
// ==========================
app.post('/api/asaas/criar-cobranca', authenticateToken, async (req, res) => {
  try {
    if (!process.env.ASAAS_API_KEY) {
      return res.status(500).json({ error: 'ASAAS_API_KEY não configurada.' });
    }

    const { cpfCnpj } = req.body;
    const documento = normalizeCpfCnpj(cpfCnpj);

    if (!isCpfOrCnpjValidLength(documento)) {
      return res.status(400).json({ error: 'Informe um CPF ou CNPJ válido para gerar a cobrança.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        plano: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const nome = String(user.name || 'Cliente EvoTrainer').trim();
    const email = normalizeEmail(user.email || '');
    const celular = String(user.phone || '').trim();

    console.log('🧾 [ASAAS] Criando cobrança para:', {
      id: user.id,
      nome,
      email,
      phone: celular,
      documento,
      plano: user.plano,
    });

    let customerId = null;

    const searchCustomerRes = await fetch(
      `https://api.asaas.com/v3/customers?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          access_token: process.env.ASAAS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const searchCustomerData = await searchCustomerRes.json();

    if (searchCustomerRes.ok && Array.isArray(searchCustomerData.data) && searchCustomerData.data.length > 0) {
      customerId = searchCustomerData.data[0].id;
      console.log('👤 [ASAAS] Customer existente encontrado:', customerId);

      const updatePayload = {
        name: nome,
        email,
        cpfCnpj: documento,
        externalReference: String(user.id),
      };

      if (celular) updatePayload.mobilePhone = celular;

      const updateCustomerRes = await fetch(`https://api.asaas.com/v3/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          access_token: process.env.ASAAS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      const updateCustomerData = await updateCustomerRes.json();

      if (!updateCustomerRes.ok) {
        console.error('🔥 [ASAAS] Erro ao atualizar customer:', updateCustomerData);
        return res.status(500).json({
          error: updateCustomerData?.errors?.[0]?.description || updateCustomerData?.message || 'Erro ao atualizar cliente no Asaas.',
          details: updateCustomerData,
        });
      }
    } else {
      const customerPayload = {
        name: nome,
        email,
        cpfCnpj: documento,
        externalReference: String(user.id),
      };

      if (celular) customerPayload.mobilePhone = celular;

      const customerRes = await fetch('https://api.asaas.com/v3/customers', {
        method: 'POST',
        headers: {
          access_token: process.env.ASAAS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerPayload),
      });

      const customerData = await customerRes.json();

      if (!customerRes.ok) {
        console.error('🔥 [ASAAS] Erro ao criar customer:', customerData);
        return res.status(500).json({
          error: customerData?.errors?.[0]?.description || customerData?.message || 'Erro ao criar cliente no Asaas.',
          details: customerData,
        });
      }

      customerId = customerData.id;
      console.log('👤 [ASAAS] Customer criado:', customerId);
    }

    const dueDate = addDays(new Date(), 1).toISOString().slice(0, 10);

    const paymentPayload = {
      customer: customerId,
      billingType: 'PIX',
      value: 39.9,
      dueDate,
      description: 'Plano PRO EvoTrainer',
      externalReference: String(user.id),
    };

    const paymentRes = await fetch('https://api.asaas.com/v3/payments', {
      method: 'POST',
      headers: {
        access_token: process.env.ASAAS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload),
    });

    const paymentData = await paymentRes.json();

    if (!paymentRes.ok) {
      console.error('🔥 [ASAAS] Erro ao criar cobrança:', paymentData);
      return res.status(500).json({
        error: paymentData?.errors?.[0]?.description || paymentData?.message || 'Erro ao criar cobrança.',
        details: paymentData,
      });
    }

    console.log('✅ [ASAAS] Cobrança criada com sucesso:', {
      paymentId: paymentData.id,
      customer: customerId,
      invoiceUrl: paymentData.invoiceUrl,
      externalReference: paymentPayload.externalReference,
    });

    return res.json({
      paymentId: paymentData.id,
      checkoutUrl: paymentData.invoiceUrl || null,
      invoiceUrl: paymentData.invoiceUrl || null,
    });
  } catch (e) {
    console.error('🔥 /api/asaas/criar-cobranca:', e);
    return res.status(500).json({
      error: e.message || 'Erro interno ao criar cobrança.',
    });
  }
});

// ==========================
// DADOS DO USUÁRIO
// ==========================
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plano: true,
        iaUsadaMes: true,
        planExpiresAt: true,
        phone: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    res.json(user);
  } catch (e) {
    console.error('🔥 /api/me:', e);
    res.status(500).json({ error: 'Erro ao buscar dados.' });
  }
});

// ==========================
// REGISTRO
// ==========================
app.post('/api/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const emailNormalizado = normalizeEmail(email);
    const phoneNormalizado = String(phone || '').trim();

    if (!name || !emailNormalizado || !password) {
      return res.status(400).json({ error: 'Dados obrigatórios ausentes.' });
    }

    const userExists = await prisma.user.findFirst({
      where: {
        email: {
          equals: emailNormalizado,
          mode: 'insensitive',
        },
      },
    });

    if (userExists) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const novoPersonal = await prisma.user.create({
      data: {
        name,
        email: emailNormalizado,
        phone: phoneNormalizado,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'Ativo',
        plano: 'GRATIS',
      },
    });

    res.status(201).json({
      message: 'Conta criada!',
      user: {
        id: novoPersonal.id,
        email: novoPersonal.email,
      },
    });
  } catch (e) {
    console.error('🔥 /api/register:', e);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

app.post('/api/recover-password', async (req, res) => {
  res.json({ message: 'Se o e-mail constar na base, as instruções foram enviadas.' });
});

// ==========================
// IA
// ==========================
app.post('/api/ai/gerar-autonomo', authenticateToken, isAdminOrMaster, async (req, res) => {
  const { alunoId, comandoPersonal, frequencia, ciclo, semanas } = req.body;

  try {
    const personal = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!personal) return res.status(404).json({ error: 'Usuário não encontrado.' });

    if (
      personal.role !== 'SUPERADMIN' &&
      personal.plano === 'GRATIS' &&
      personal.iaUsadaMes >= 5
    ) {
      return res.status(403).json({ error: 'Limite de 5 treinos atingido. Faça o upgrade!' });
    }

    const aluno = await prisma.user.findUnique({ where: { id: parseInt(alunoId, 10) } });
    if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado.' });

    const systemPrompt = `Você é a Engine EvoIntelligence™ de Elite especializada em biomecânica.
TAREFA: Gere EXATAMENTE ${frequencia} fichas de treino diferentes (Ficha A, B, C...).
DADOS: Aluno ${aluno.name}, Nível ${aluno.level}. Prontuário: ${aluno.anamnese || 'Sem restrições'}.
FORMATO JSON OBRIGATÓRIO: {"planilha": [{"title": "Ficha A - ...", "exercises": [{"name": "...", "sets": "...", "weight": "...", "youtubeId": ""}]}]}`;

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: comandoPersonal },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const aiData = await aiRes.json();

    if (!aiRes.ok) {
      console.error('🔥 OpenAI:', aiData);
      return res.status(500).json({ error: 'Falha na Engine IA.' });
    }

    const rawContent = aiData?.choices?.[0]?.message?.content;
    if (!rawContent) {
      console.error('🔥 OpenAI sem conteúdo:', aiData);
      return res.status(500).json({ error: 'Resposta inválida da Engine IA.' });
    }

    const result = JSON.parse(rawContent);
    if (!Array.isArray(result.planilha)) {
      return res.status(500).json({ error: 'Formato inválido retornado pela IA.' });
    }

    const treinosSalvos = [];

    for (const ficha of result.planilha) {
      const novoTreino = await prisma.workoutTemplate.create({
        data: {
          title: ficha.title,
          userId: aluno.id,
          duration: `${semanas} Semanas`,
          exercises: {
            create: Array.isArray(ficha.exercises) ? ficha.exercises : [],
          },
        },
      });
      treinosSalvos.push(novoTreino);
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { iaUsadaMes: { increment: 1 } },
    });

    res.json({ message: 'Periodização salva!', treinos: treinosSalvos });
  } catch (e) {
    console.error('🔥 /api/ai/gerar-autonomo:', e);
    res.status(500).json({ error: 'Falha na Engine IA.' });
  }
});

app.delete('/api/treinos/:id', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    await prisma.workoutTemplate.delete({
      where: { id: parseInt(req.params.id, 10) },
    });
    res.json({ message: 'Ficha removida.' });
  } catch (e) {
    console.error('🔥 DELETE /api/treinos/:id:', e);
    res.status(500).json({ error: 'Erro.' });
  }
});

// ==========================
// GESTÃO DE ALUNOS
// ==========================
app.post('/api/alunos', authenticateToken, isAdminOrMaster, async (req, res) => {
  const { name, email, phone, weight, height, level, anamnese, price } = req.body;

  try {
    const emailNormalizado = normalizeEmail(email);

    const emailExists = await prisma.user.findFirst({
      where: {
        email: {
          equals: emailNormalizado,
          mode: 'insensitive',
        },
      },
    });

    if (emailExists) {
      return res.status(400).json({ error: 'E-mail duplicado.' });
    }

    const hashed = await bcrypt.hash('123456', 10);

    const novo = await prisma.user.create({
      data: {
        name,
        email: emailNormalizado,
        phone: String(phone || '').trim(),
        weight,
        height,
        level,
        anamnese,
        price,
        password: hashed,
        role: 'STUDENT',
        trainerId: req.user.id,
        status: 'Ativo',
      },
    });

    res.status(201).json(novo);
  } catch (e) {
    console.error('🔥 POST /api/alunos:', e);
    res.status(400).json({ error: 'E-mail duplicado.' });
  }
});

app.get('/api/alunos', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    const alunos = await prisma.user.findMany({
      where: { trainerId: req.user.id },
      include: {
        workouts: { include: { exercises: true } },
        _count: { select: { workouts: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json(alunos);
  } catch (e) {
    console.error('🔥 GET /api/alunos:', e);
    res.status(500).json({ error: 'Erro.' });
  }
});

app.put('/api/alunos/:id', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.email) {
      data.email = normalizeEmail(data.email);
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(req.params.id, 10) },
      data,
    });

    res.json(updated);
  } catch (e) {
    console.error('🔥 PUT /api/alunos/:id:', e);
    res.status(500).json({ error: 'Erro.' });
  }
});

app.delete('/api/alunos/:id', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(req.params.id, 10) },
    });
    res.json({ message: 'Removido.' });
  } catch (e) {
    console.error('🔥 DELETE /api/alunos/:id:', e);
    res.status(500).json({ error: 'Erro.' });
  }
});

// ==========================
// GESTÃO MASTER
// ==========================
app.get('/api/superadmin/trainers', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const trainers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      include: { _count: { select: { alunos: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(trainers);
  } catch (e) {
    console.error('🔥 GET /api/superadmin/trainers:', e);
    res.status(500).json({ error: 'Erro.' });
  }
});

app.put('/api/superadmin/trainers/:id/plano', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const { plano } = req.body;

    const dataUpdate = { plano };

    if (plano === 'PRO') {
      dataUpdate.planExpiresAt = addDays(new Date(), 30);
      dataUpdate.iaUsadaMes = 0;
    } else {
      dataUpdate.planExpiresAt = null;
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(req.params.id, 10) },
      data: dataUpdate,
    });

    res.json(updated);
  } catch (e) {
    console.error('🔥 PUT /api/superadmin/trainers/:id/plano:', e);
    res.status(500).json({ error: 'Erro.' });
  }
});

app.put('/api/superadmin/trainers/:id', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const updated = await prisma.user.update({
      where: { id: parseInt(req.params.id, 10) },
      data: {
        name: req.body.name,
        email: req.body.email ? normalizeEmail(req.body.email) : undefined,
        phone: req.body.phone,
      },
    });

    res.json(updated);
  } catch (e) {
    console.error('🔥 PUT /api/superadmin/trainers/:id:', e);
    res.status(500).json({ error: 'Erro.' });
  }
});

app.delete('/api/superadmin/trainers/:id', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(req.params.id, 10) },
    });
    res.json({ message: 'Personal Removido!' });
  } catch (e) {
    console.error('🔥 DELETE /api/superadmin/trainers/:id:', e);
    res.status(500).json({ error: 'Erro ao remover personal.' });
  }
});

// ==========================
// LOGIN & SEGURANÇA
// ==========================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const emailNormalizado = normalizeEmail(email);

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: emailNormalizado,
          mode: 'insensitive',
        },
      },
    });

    if (!user) return res.status(404).json({ error: 'Conta não encontrada.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid && user.password !== '') {
      return res.status(401).json({ error: 'Senha inválida.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plano: user.plano,
        iaUsadaMes: user.iaUsadaMes,
        planExpiresAt: user.planExpiresAt,
      },
    });
  } catch (e) {
    console.error('🔥 /api/login:', e);
    res.status(500).json({ error: 'Erro interno no login.' });
  }
});

app.put('/api/perfil/senha', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Senha atual incorreta.' });

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed },
    });

    res.json({ message: 'Senha alterada!' });
  } catch (e) {
    console.error('🔥 PUT /api/perfil/senha:', e);
    res.status(500).json({ error: 'Erro.' });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 EvoCore operante na porta ${PORT}`);
});