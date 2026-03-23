const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // <-- ADICIONADO AQUI

const prisma = new PrismaClient();
const app = express();

app.use(cors());

// --- LEITURA PADRÃO E UNIVERSAL ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-evotrainer-2026';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const normalizeEmail = (value = '') => String(value).trim().toLowerCase();
const normalizePhone = (value = '') => String(value).replace(/\D/g, '');
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};
const isNumericString = (value) => /^\d+$/.test(String(value || '').trim());

// --- MIDDLEWARES DE SEGURANÇA ---
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

// ==========================================
// HELPERS ASAAS E SISTEMA
// ==========================================
async function findUserByReference(externalReference) {
  if (!externalReference) return null;
  const ref = String(externalReference).trim();

  if (isNumericString(ref)) {
    const byId = await prisma.user.findUnique({
      where: { id: parseInt(ref, 10) },
    });
    if (byId) return byId;
  }

  const emailRef = normalizeEmail(ref);
  if (emailRef) {
    const byEmail = await prisma.user.findFirst({
      where: { email: { equals: emailRef, mode: 'insensitive' } },
    });
    if (byEmail) return byEmail;
  }
  return null;
}

async function findUserByEmail(email) {
  const emailNormalizado = normalizeEmail(email);
  if (!emailNormalizado) return null;

  return prisma.user.findFirst({
    where: { email: { equals: emailNormalizado, mode: 'insensitive' } },
  });
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

  console.log(`✅ [ASAAS] SUCESSO ABSOLUTO! Plano PRO liberado via ${origem} para o usuário: ${updated.email}`);
  return updated;
}

async function processAsaasWebhook(payload) {
  const event = payload?.event || null;
  const payment = payload?.payment || {};
  const customerId = payment?.customer || null;
  const externalReference = payment?.externalReference || payload?.externalReference || null;

  console.log(`🔔 [ASAAS] Processando Evento: ${event}`);

  const eventosAceitos = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'];
  if (!eventosAceitos.includes(event)) {
    console.log(`ℹ️ [ASAAS] O evento '${event}' não aciona a liberação. Ignorando.`);
    return { ok: true, reason: 'ignored_event_not_payment' };
  }

  let user = null;

  // 1. Prioridade Máxima: Identificação Exata (ID)
  if (externalReference) {
    user = await findUserByReference(externalReference);
    if (user) {
      await liberarPlanoPro(user, 'externalReference (ID)');
      return { ok: true, reason: 'success_by_reference', email: user.email };
    }
  }

  // 2. Busca pelo e-mail se o ID falhar
  if (customerId && process.env.ASAAS_API_KEY) {
    try {
      console.log(`🔍 [ASAAS] Buscando e-mail do cliente: ${customerId}`);
      const res = await fetch(`https://api.asaas.com/v3/customers/${customerId}`, {
        method: 'GET',
        headers: { access_token: process.env.ASAAS_API_KEY, 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const customerData = await res.json();
        const emailPagador = normalizeEmail(customerData.email);

        if (emailPagador) {
          user = await findUserByEmail(emailPagador);
          if (user) {
            await liberarPlanoPro(user, 'email da api');
            return { ok: true, reason: 'success_by_email', email: user.email };
          }
        }
      }
    } catch (err) {
      console.error("🔥 [ASAAS] Erro na chamada da API Asaas:", err);
    }
  }

  console.log('⚠️ [ASAAS] Nenhum usuário correspondente encontrado no banco de dados para este pagamento.');
  return { ok: false, reason: 'user_not_found' };
}

// ==========================================
// 💸 WEBHOOK ASAAS (A INTERCEPTAÇÃO SUPREMA)
// ==========================================
app.post(['/api/webhook/asaas', '/api/webhooks/asaas'], async (req, res) => {
  try {
    let payload = req.body;
    console.log("📥 [ASAAS RAW] Payload recebido. Desempacotando...");

    // Se o Asaas mandou o objeto seguro envelopado no "data"
    if (payload && payload.data && typeof payload.data === 'string') {
      console.log("🔓 [ASAAS] Envelope seguro detectado (token). Abrindo...");
      try {
        payload = JSON.parse(payload.data);
      } catch(e) {
        console.log("⚠️ [ASAAS] Falha ao converter payload.data em JSON.");
      }
    }

    // Se veio como string pura
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch (e) {}
    }

    // Se o Asaas mandou URL Encoded que virou uma chave gigante
    if (payload && typeof payload === 'object' && !payload.event && Object.keys(payload).length > 0) {
      const keys = Object.keys(payload);
      if (keys.length === 1 && keys[0].includes('"event"')) {
        try {
          payload = JSON.parse(keys[0]);
          console.log("🛠️ [ASAAS] JSON desempacotado da chave form-urlencoded com sucesso!");
        } catch (e) {}
      }
    }

    if (!payload || !payload.event) {
      console.log('⚠️ [ASAAS] Impossível processar: Payload final sem chave "event". Ignorando.');
      return res.status(200).json({ status: "ignored_payload_no_event" }); 
    }

    const result = await processAsaasWebhook(payload);
    return res.status(200).json({ status: "processed", details: result });

  } catch (e) {
    console.error('🔥 [ASAAS] Erro crítico no Webhook:', e);
    return res.status(200).json({ status: "error_handled" });
  }
});

// ==========================================
// 💳 CRIAR COBRANÇA ASAAS PARA O USUÁRIO LOGADO
// ==========================================
app.post('/api/asaas/criar-cobranca', authenticateToken, async (req, res) => {
  try {
    if (!process.env.ASAAS_API_KEY) {
      return res.status(500).json({ error: 'ASAAS_API_KEY não configurada.' });
    }

    const { cpfCnpj } = req.body;
    const documento = String(cpfCnpj || '').replace(/\D/g, '');

    if (!documento) return res.status(400).json({ error: 'Informe CPF ou CNPJ.' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, plano: true },
    });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const nome = String(user.name || 'Cliente EvoTrainer').trim();
    const email = normalizeEmail(user.email || '');

    let customerId = null;

    const searchCustomerRes = await fetch(`https://api.asaas.com/v3/customers?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: { access_token: process.env.ASAAS_API_KEY, 'Content-Type': 'application/json' },
    });

    const searchCustomerData = await searchCustomerRes.json();

    if (searchCustomerRes.ok && Array.isArray(searchCustomerData.data) && searchCustomerData.data.length > 0) {
      customerId = searchCustomerData.data[0].id;
      
      await fetch(`https://api.asaas.com/v3/customers/${customerId}`, {
        method: 'PUT',
        headers: { access_token: process.env.ASAAS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nome, cpfCnpj: documento, externalReference: String(user.id) }),
      });
    } else {
      const customerRes = await fetch('https://api.asaas.com/v3/customers', {
        method: 'POST',
        headers: { access_token: process.env.ASAAS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nome, email, cpfCnpj: documento, externalReference: String(user.id) }),
      });

      const customerData = await customerRes.json();
      if (!customerRes.ok) return res.status(500).json({ error: 'Erro ao criar cliente no Asaas.' });
      customerId = customerData.id;
    }

    const dueDate = addDays(new Date(), 1).toISOString().slice(0, 10);
    const paymentPayload = {
      customer: customerId,
      billingType: 'PIX',
      value: 39.90,
      dueDate,
      description: 'Plano PRO EvoTrainer',
      externalReference: String(user.id),
    };

    const paymentRes = await fetch('https://api.asaas.com/v3/payments', {
      method: 'POST',
      headers: { access_token: process.env.ASAAS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentPayload),
    });

    const paymentData = await paymentRes.json();
    if (!paymentRes.ok) return res.status(500).json({ error: 'Erro ao criar cobrança.' });

    return res.json({ paymentId: paymentData.id, checkoutUrl: paymentData.invoiceUrl });
  } catch (e) {
    console.error('🔥 /api/asaas/criar-cobranca:', e);
    return res.status(500).json({ error: 'Erro interno ao criar cobrança.' });
  }
});

// --- ROTA STATUS DO PAGAMENTO ---
app.get('/api/asaas/status-pagamento/:paymentId', authenticateToken, async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    const response = await fetch(`https://api.asaas.com/v3/payments/${paymentId}`, {
      method: 'GET',
      headers: { access_token: process.env.ASAAS_API_KEY }
    });
    
    if(response.ok) {
      const data = await response.json();
      res.json({ status: data.status });
    } else {
      res.status(404).json({ error: 'Pagamento não encontrado' });
    }
  } catch(e) {
    res.status(500).json({ error: 'Erro' });
  }
});

// --- DADOS DO USUÁRIO EM TEMPO REAL ---
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, plano: true, iaUsadaMes: true, planExpiresAt: true, phone: true },
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (e) { res.status(500).json({ error: 'Erro ao buscar dados.' }); }
});

// --- ROTA PÚBLICA DE REGISTRO E E-MAIL ---
app.post('/api/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const emailNormalizado = normalizeEmail(email);
    const phoneNormalizado = String(phone || '').trim();

    if (!name || !emailNormalizado || !password) return res.status(400).json({ error: 'Dados obrigatórios ausentes.' });

    const userExists = await prisma.user.findFirst({ where: { email: { equals: emailNormalizado, mode: 'insensitive' } } });
    if (userExists) return res.status(400).json({ error: 'E-mail já cadastrado.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const novoPersonal = await prisma.user.create({
      data: { name, email: emailNormalizado, phone: phoneNormalizado, password: hashedPassword, role: 'ADMIN', status: 'Ativo', plano: 'GRATIS' },
    });

    // --- DISPARO DE E-MAIL DE BOAS-VINDAS ---
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: process.env.SMTP_PORT || 465,
        secure: true, 
        auth: {
          user: process.env.SMTP_USER, // adminevotrainer@evotrainer.com.br
          pass: process.env.SMTP_PASS, // A senha do email
        },
      });

      const primeiroNome = name.split(' ')[0];

      await transporter.sendMail({
        from: '"Equipe EvoTrainer" <adminevotrainer@evotrainer.com.br>',
        to: emailNormalizado,
        subject: "Bem-vindo ao EvoTrainer! 🚀 Sua conta foi ativada.",
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #2563eb; font-style: italic; font-weight: 900; margin: 0; font-size: 28px; text-transform: uppercase;">EVOTRAINER</h2>
              <p style="color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 2px; margin-top: 5px;">Periodização de Elite</p>
            </div>
            
            <p style="color: #1e293b; font-size: 16px;">Fala <strong>${primeiroNome}</strong>! Tudo bem?</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Sua conta de Personal Trainer foi criada com sucesso e seu ambiente já está liberado. Estamos muito felizes em ter você com a gente!</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Com nossa plataforma, você vai abandonar as planilhas manuais, gerar treinos com Inteligência Artificial Biomecânica e escalar o seu faturamento.</p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://evotrainer.com.br" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Acessar Meu Painel</a>
            </div>
            
            <p style="color: #475569; font-size: 14px;">Ficou com alguma dúvida ou tem alguma sugestão de melhoria? Responda este e-mail! Queremos construir o sistema ideal para você. 🛠️</p>
            <p style="color: #1e293b; font-weight: bold; margin-top: 30px;">Bora esmagar! 💪</p>
          </div>
        `
      });
      console.log(`✉️ E-mail de boas-vindas enviado para: ${emailNormalizado}`);
    } catch (mailError) {
      console.error('⚠️ Falha ao enviar e-mail de boas-vindas:', mailError);
    }
    // ----------------------------------------

    res.status(201).json({ message: 'Conta criada!', user: { id: novoPersonal.id, email: novoPersonal.email } });
  } catch (e) { res.status(500).json({ error: 'Erro interno.' }); }
});

app.post('/api/recover-password', async (req, res) => {
  res.json({ message: 'Se o e-mail constar na base, as instruções foram enviadas.' });
});

// ==========================================
// 🧠 EVOINTELLIGENCE™
// ==========================================
app.post('/api/ai/gerar-autonomo', authenticateToken, isAdminOrMaster, async (req, res) => {
  const { alunoId, comandoPersonal, frequencia, ciclo, semanas } = req.body;
  try {
    const personal = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!personal) return res.status(404).json({ error: 'Usuário não encontrado.' });
    if (personal.role !== 'SUPERADMIN' && personal.plano === 'GRATIS' && personal.iaUsadaMes >= 5) {
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
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: comandoPersonal }], response_format: { type: 'json_object' } }),
    });

    const aiData = await aiRes.json();
    if (!aiRes.ok) return res.status(500).json({ error: 'Falha na Engine IA.' });

    const rawContent = aiData?.choices?.[0]?.message?.content;
    if (!rawContent) return res.status(500).json({ error: 'Resposta inválida da Engine IA.' });

    const result = JSON.parse(rawContent);
    if (!Array.isArray(result.planilha)) return res.status(500).json({ error: 'Formato inválido retornado pela IA.' });

    const treinosSalvos = [];
    for (const ficha of result.planilha) {
      const novoTreino = await prisma.workoutTemplate.create({
        data: { title: ficha.title, userId: aluno.id, duration: `${semanas} Semanas`, exercises: { create: Array.isArray(ficha.exercises) ? ficha.exercises : [] } },
      });
      treinosSalvos.push(novoTreino);
    }

    await prisma.user.update({ where: { id: req.user.id }, data: { iaUsadaMes: { increment: 1 } } });
    res.json({ message: 'Periodização salva!', treinos: treinosSalvos });
  } catch (e) { res.status(500).json({ error: 'Falha na Engine IA.' }); }
});

app.delete('/api/treinos/:id', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    await prisma.workoutTemplate.delete({ where: { id: parseInt(req.params.id, 10) } });
    res.json({ message: 'Ficha removida.' });
  } catch (e) { res.status(500).json({ error: 'Erro.' }); }
});

// --- GESTÃO DE ALUNOS ---
app.post('/api/alunos', authenticateToken, isAdminOrMaster, async (req, res) => {
  const { name, email, phone, weight, height, level, anamnese, price } = req.body;
  try {
    const emailNormalizado = normalizeEmail(email);
    const emailExists = await prisma.user.findFirst({ where: { email: { equals: emailNormalizado, mode: 'insensitive' } } });
    if (emailExists) return res.status(400).json({ error: 'E-mail duplicado.' });

    const hashed = await bcrypt.hash('123456', 10);
    const novo = await prisma.user.create({
      data: { name, email: emailNormalizado, phone: String(phone || '').trim(), weight, height, level, anamnese, price, password: hashed, role: 'STUDENT', trainerId: req.user.id, status: 'Ativo' },
    });
    res.status(201).json(novo);
  } catch (e) { res.status(400).json({ error: 'E-mail duplicado.' }); }
});

app.get('/api/alunos', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    const alunos = await prisma.user.findMany({
      where: { trainerId: req.user.id },
      include: { workouts: { include: { exercises: true } }, _count: { select: { workouts: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(alunos);
  } catch (e) { res.status(500).json({ error: 'Erro.' }); }
});

app.put('/api/alunos/:id', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.email) data.email = normalizeEmail(data.email);
    const updated = await prisma.user.update({ where: { id: parseInt(req.params.id, 10) }, data });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Erro.' }); }
});

app.delete('/api/alunos/:id', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id, 10) } });
    res.json({ message: 'Removido.' });
  } catch (e) { res.status(500).json({ error: 'Erro.' }); }
});

// --- GESTÃO MASTER ---
app.get('/api/superadmin/trainers', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const trainers = await prisma.user.findMany({
      where: { role: 'ADMIN' }, include: { _count: { select: { alunos: true } } }, orderBy: { createdAt: 'desc' },
    });
    res.json(trainers);
  } catch (e) { res.status(500).json({ error: 'Erro.' }); }
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
    const updated = await prisma.user.update({ where: { id: parseInt(req.params.id, 10) }, data: dataUpdate });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Erro.' }); }
});

app.put('/api/superadmin/trainers/:id', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const updated = await prisma.user.update({
      where: { id: parseInt(req.params.id, 10) },
      data: { name: req.body.name, email: req.body.email ? normalizeEmail(req.body.email) : undefined, phone: req.body.phone },
    });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Erro.' }); }
});

app.delete('/api/superadmin/trainers/:id', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id, 10) } });
    res.json({ message: 'Personal Removido!' });
  } catch (e) { res.status(500).json({ error: 'Erro ao remover personal.' }); }
});

// --- LOGIN & SEGURANÇA ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const emailNormalizado = normalizeEmail(email);
    const user = await prisma.user.findFirst({ where: { email: { equals: emailNormalizado, mode: 'insensitive' } } });
    if (!user) return res.status(404).json({ error: 'Conta não encontrada.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid && user.password !== '') return res.status(401).json({ error: 'Senha inválida.' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, plano: user.plano, iaUsadaMes: user.iaUsadaMes, planExpiresAt: user.planExpiresAt } });
  } catch (e) { res.status(500).json({ error: 'Erro interno no login.' }); }
});

app.put('/api/perfil/senha', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Senha atual incorreta.' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: 'Senha alterada!' });
  } catch (e) { 
    res.status(500).json({ error: 'Erro.' }); 
  }
}); 

// --- ROTA DE EDIÇÃO DE PLANILHA (AGORA LIVRE E CORRIGIDA PARA O PRISMA) ---
app.put('/api/treinos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, duration, exercises } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID do treino não fornecido.' });
    }

    // Atualiza a ficha no banco de dados usando workoutTemplate
    const treinoAtualizado = await prisma.workoutTemplate.update({
      where: { 
        id: parseInt(id, 10) 
      },
      data: {
        title,
        duration,
        // Limpa os exercícios antigos da ficha e salva os novos editados
        exercises: {
          deleteMany: {}, 
          create: exercises.map(ex => ({
            name: ex.name,
            sets: ex.sets,
            weight: ex.weight,
            youtubeId: ex.youtubeId || null
          }))
        }
      },
      include: {
        exercises: true // Retorna os exercícios novos para o frontend
      }
    });

    res.status(200).json({ 
      message: 'Planilha atualizada com sucesso!', 
      treino: treinoAtualizado 
    });

  } catch (error) {
    console.error('Erro ao atualizar treino:', error);
    res.status(500).json({ error: 'Erro interno ao salvar as alterações da ficha.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => { console.log(`🚀 EvoCore operante na porta ${PORT}`); });