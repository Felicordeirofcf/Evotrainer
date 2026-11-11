const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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

    if (payload && payload.data && typeof payload.data === 'string') {
      console.log("🔓 [ASAAS] Envelope seguro detectado (token). Abrindo...");
      try {
        payload = JSON.parse(payload.data);
      } catch(e) {
        console.log("⚠️ [ASAAS] Falha ao converter payload.data em JSON.");
      }
    }

    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch (e) {}
    }

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

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: process.env.SMTP_PORT || 465,
        secure: true, 
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
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

    res.status(201).json({ message: 'Conta criada!', user: { id: novoPersonal.id, email: novoPersonal.email } });
  } catch (e) { res.status(500).json({ error: 'Erro interno.' }); }
});

app.post('/api/recover-password', async (req, res) => {
  res.json({ message: 'Se o e-mail constar na base, as instruções foram enviadas.' });
});

// ==========================================
// 🧠 EVOINTELLIGENCE™ OMNIFORMA ELITE
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

    // 🔥 PROMPT SUPER PROFISSIONAL OMNIFORMA ELITE COM DIRETRIZ DE GÊNERO 🔥
    const systemPrompt = `Vocę é o EvoIntelligence™ Core, Diretor Técnico de Alto Rendimento. Sua missāo é gerar UM ÚNICO PROTOCOLO DE TREINO COMPLETO (planilha única) contendo todos os dias de treino da semana.

👤 ALUNO: ${aluno.name} | Sexo: ${aluno.gender || 'Não informado'} | Idade: ${aluno.age || 'N/A'} | Objetivo: ${aluno.goal || 'Saúde'} | Nível: ${aluno.level} | Frequência: ${frequencia} dias | Fase: ${ciclo}
Prontuário/Restrições: ${aluno.anamnese || 'Nenhuma'}

### 🧬 DIRETRIZES DE GÊNERO E BIOMECÂNICA (MUITO IMPORTANTE)
- Se o sexo for FEMININO (ou o nome indicar feminino): Exceto se o comando do Personal pedir o contrário, a divisão de treino DEVE ter ênfase clara em Membros Inferiores (foco absoluto em Glúteos, Posteriores e Quadríceps). O volume de Membros Superiores deve ser focado em tonificação e postura, sem exageros em peito ou braços pesados.
- Se o sexo for MASCULINO: Distribuição clássica focada em hipertrofia global, com ênfase em Membros Superiores (Peitoral, Dorsal, Ombros, Braços) e volume proporcional e pesado de pernas.

### ⚠️ REGRA DE VOLUME (ANTI-PREGUIÇA)
Você DEVE prescrever entre 6 e 9 exercícios para CADA DIA de treino. Se a frequência for de ${frequencia} dias, o total de exercícios no JSON deve ser de aproximadamente ${frequencia * 7} exercícios. Não resuma e não entregue menos que isso.

### 🎥 NOMENCLATURA SEO PARA YOUTUBE (OBRIGATÓRIO)
NUNCA use gírias (ex: "Puxador", "Voador", "Posterior de coxa").
Você deve EXCLUSIVAMENTE usar os nomes biomecânicos oficiais em Português do Brasil para garantir resultados exatos no YouTube.
EXEMPLOS CORRETOS: "Puxada Frontal na Polia Alta", "Crucifixo Invertido na Máquina", "Cadeira Flexora", "Agachamento Livre com Barra".

### 📦 FORMATO JSON (RETORNE APENAS O JSON)
{
  "protocolo": {
    "title": "Protocolo Elite - Fase: ${ciclo}",
    "dias": [
      {
        "nome_dia": "Treino A - Dorsal e Bíceps",
        "exercicios": [
          {
            "name": "Nomenclatura Técnica e Correta (SEO)",
            "sets": "Séries",
            "reps": "Repetições",
            "weight_or_intensity": "Carga ou RIR/Borg",
            "rest": "Descanso",
            "technical_tip": "Dica avançada e segura focada na biomecânica e nas restrições"
          }
        ]
      }
    ]
  }
}`;

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ 
        model: 'gpt-4o-mini', 
        messages: [
          { role: 'system', content: systemPrompt }, 
          { role: 'user', content: comandoPersonal }
        ], 
        response_format: { type: 'json_object' },
        temperature: 0.6
      }),
    });

    const aiData = await aiRes.json();
    if (!aiRes.ok) return res.status(500).json({ error: 'Falha na Engine IA.' });

    const rawContent = aiData?.choices?.[0]?.message?.content;
    if (!rawContent) return res.status(500).json({ error: 'Resposta inválida da Engine IA.' });

    const result = JSON.parse(rawContent);

    // Achatar (Flatten) todos os dias em uma única Array de Exercícios
    const todosExercicios = [];
    if (result.protocolo?.dias) {
      result.protocolo.dias.forEach(dia => {
        if (dia.exercicios) {
          dia.exercicios.forEach(ex => {
            todosExercicios.push({
              ficha: dia.nome_dia || 'Geral', // Salva a qual dia ele pertence
              name: ex.name,
              sets: String(ex.sets || ''),
              reps: String(ex.reps || ''),
              weight: String(ex.weight_or_intensity || ex.weight || ''), 
              rest: String(ex.rest || ''),
              technical_tip: String(ex.technical_tip || '')
            });
          });
        }
      });
    }

    if (todosExercicios.length === 0) return res.status(500).json({ error: 'Erro de parse da IA.' });

    // Cria UMA planilha e insere todos os exercícios
    const novoTreino = await prisma.workoutTemplate.create({
      data: { 
        title: result.protocolo.title || `Protocolo Completo`, 
        userId: aluno.id, 
        duration: `${semanas} Semanas`, 
        exercises: { create: todosExercicios } 
      },
      include: { exercises: true }
    });

    await prisma.user.update({ where: { id: req.user.id }, data: { iaUsadaMes: { increment: 1 } } });
    res.json({ message: 'Periodização salva!', treinos: [novoTreino] });
  } catch (e) { 
    console.error('🔥 Erro na Engine:', e);
    res.status(500).json({ error: 'Falha na Engine IA.' }); 
  }
});

app.delete('/api/treinos/:id', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    await prisma.workoutTemplate.delete({ where: { id: parseInt(req.params.id, 10) } });
    res.json({ message: 'Ficha removida.' });
  } catch (e) { res.status(500).json({ error: 'Erro.' }); }
});

// --- GESTÃO DE ALUNOS ---
app.post('/api/alunos', authenticateToken, isAdminOrMaster, async (req, res) => {
  const { name, email, phone, age, gender, goal, weight, height, level, anamnese, price } = req.body;
  try {
    const emailNormalizado = normalizeEmail(email);
    const emailExists = await prisma.user.findFirst({ where: { email: { equals: emailNormalizado, mode: 'insensitive' } } });
    if (emailExists) return res.status(400).json({ error: 'E-mail duplicado.' });

    const hashed = await bcrypt.hash('123456', 10);
    const novo = await prisma.user.create({
      data: { 
        name, 
        email: emailNormalizado, 
        phone: String(phone || '').trim(), 
        age: age ? String(age) : null,
        gender: gender || null,
        goal: goal || null,
        weight, 
        height, 
        level, 
        anamnese, 
        price, 
        password: hashed, 
        role: 'STUDENT', 
        trainerId: req.user.id, 
        status: 'Ativo' 
      },
    });
    res.status(201).json(novo);
  } catch (e) { res.status(400).json({ error: 'Erro ao criar aluno.' }); }
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

// --- ROTA DE EDIÇÃO DE PLANILHA ---
app.put('/api/treinos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, duration, exercises } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID do treino não fornecido.' });
    }

    const treinoAtualizado = await prisma.workoutTemplate.update({
      where: { 
        id: parseInt(id, 10) 
      },
      data: {
        title,
        duration,
        exercises: {
          deleteMany: {}, 
          create: exercises.map(ex => ({
            ficha: ex.ficha || 'Treino Geral',
            name: ex.name,
            sets: ex.sets || '',
            reps: ex.reps || '',
            weight: ex.weight || ex.weight_or_intensity || '',
            rest: ex.rest || '',
            technical_tip: ex.technical_tip || '',
            youtubeId: ex.youtubeId || null
          }))
        }
      },
      include: {
        exercises: true
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

// ==========================================
// 🛒 LOJA DE PLANILHAS (Mercado Pago + Pix)
// ==========================================
const crypto = require('crypto');
const MP_API = 'https://api.mercadopago.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.evotrainer.com.br';
const MAX_DOWNLOADS = 5;
const DOWNLOAD_DAYS = 30;

const publicProduct = (p) => ({
  id: p.id, title: p.title, description: p.description,
  priceCents: p.priceCents, coverUrl: p.coverUrl,
});

async function sendDownloadEmail(order, product) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const link = `${process.env.API_URL || ''}/api/download/${order.downloadToken}`;
  const esc = (t) => String(t).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  await transporter.sendMail({
    from: '"Equipe EvoTrainer" <adminevotrainer@evotrainer.com.br>',
    to: order.buyerEmail,
    subject: `Seu download: ${product.title}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#2563eb">EVOTRAINER</h2>
      <p>Olá, <strong>${esc(order.buyerName.split(' ')[0])}</strong>! Pagamento confirmado. 🎉</p>
      <p>Sua planilha <strong>${esc(product.title)}</strong> está pronta:</p>
      <p><a href="${link}" style="background:#2563eb;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold">BAIXAR PLANILHA</a></p>
      <p style="color:#64748b;font-size:13px">O link vale por ${DOWNLOAD_DAYS} dias e até ${MAX_DOWNLOADS} downloads.</p></div>`,
  });
}

// Confirma o pagamento direto na API do MP (nunca confia só no corpo do webhook)
async function settleMpPayment(mpPaymentId) {
  const r = await fetch(`${MP_API}/v1/payments/${encodeURIComponent(mpPaymentId)}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  });
  if (!r.ok) return { ok: false, reason: `mp_${r.status}` };
  const pay = await r.json();
  const order = await prisma.order.findUnique({
    where: { mpPaymentId: String(pay.id) }, include: { product: true },
  });
  if (!order) return { ok: false, reason: 'order_not_found' };
  if (pay.status === 'approved' && order.status !== 'PAID') {
    if (Math.round(Number(pay.transaction_amount) * 100) !== order.amountCents) {
      return { ok: false, reason: 'amount_mismatch' };
    }
    // updateMany condicional evita e-mail duplicado em webhooks repetidos
    const upd = await prisma.order.updateMany({
      where: { id: order.id, status: { not: 'PAID' } },
      data: { status: 'PAID', paidAt: new Date() },
    });
    if (upd.count === 1) {
      try { await sendDownloadEmail(order, order.product); }
      catch (e) { console.error('⚠️ Falha ao enviar e-mail de download:', e); }
    }
    return { ok: true, status: 'PAID' };
  }
  if (['cancelled', 'rejected', 'expired'].includes(pay.status) && order.status === 'PENDING') {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
    return { ok: true, status: 'CANCELLED' };
  }
  return { ok: true, status: order.status };
}

// --- Vitrine pública ---
app.get('/api/produtos', async (req, res) => {
  try {
    const list = await prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });
    res.json(list.map(publicProduct));
  } catch (e) { res.status(500).json({ error: 'Erro ao listar produtos.' }); }
});

app.get('/api/produtos/:id', async (req, res) => {
  try {
    const p = await prisma.product.findUnique({ where: { id: parseInt(req.params.id, 10) || 0 } });
    if (!p || !p.active) return res.status(404).json({ error: 'Produto não encontrado.' });
    res.json(publicProduct(p));
  } catch (e) { res.status(500).json({ error: 'Erro interno.' }); }
});

// --- Admin (SUPERADMIN): CRUD de produtos ---
app.get('/api/admin/produtos', authenticateToken, isSuperAdmin, async (req, res) => {
  res.json(await prisma.product.findMany({ orderBy: { createdAt: 'desc' } }));
});

app.post('/api/admin/produtos', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const { title, description, priceCents, coverUrl, fileUrl, active } = req.body;
    const price = parseInt(priceCents, 10);
    if (!title || !fileUrl || !Number.isInteger(price) || price < 100) {
      return res.status(400).json({ error: 'Informe título, fileUrl e priceCents (mínimo 100).' });
    }
    if (!/^https:\/\//i.test(fileUrl)) return res.status(400).json({ error: 'fileUrl deve ser https.' });
    const p = await prisma.product.create({
      data: { title, description, priceCents: price, coverUrl, fileUrl, active: active !== false },
    });
    res.status(201).json(p);
  } catch (e) { res.status(500).json({ error: 'Erro ao criar produto.' }); }
});

app.put('/api/admin/produtos/:id', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const { title, description, priceCents, coverUrl, fileUrl, active } = req.body;
    const data = { title, description, coverUrl, fileUrl, active };
    if (priceCents !== undefined) data.priceCents = parseInt(priceCents, 10);
    if (fileUrl && !/^https:\/\//i.test(fileUrl)) return res.status(400).json({ error: 'fileUrl deve ser https.' });
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
    res.json(await prisma.product.update({ where: { id: parseInt(req.params.id, 10) }, data }));
  } catch (e) { res.status(500).json({ error: 'Erro ao atualizar produto.' }); }
});

app.get('/api/admin/pedidos', authenticateToken, isSuperAdmin, async (req, res) => {
  const list = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }, take: 200,
    select: { id: true, buyerName: true, buyerEmail: true, amountCents: true, status: true, paidAt: true, createdAt: true, product: { select: { title: true } } },
  });
  res.json(list);
});

// --- Checkout: cria pagamento Pix (compra como convidado) ---
app.post('/api/checkout', async (req, res) => {
  try {
    if (!process.env.MP_ACCESS_TOKEN) return res.status(500).json({ error: 'Pagamento indisponível.' });
    const { productId, name, email, cpf } = req.body;
    const doc = String(cpf || '').replace(/\D/g, '');
    const mail = normalizeEmail(email);
    if (!name || !/^\S+@\S+\.\S+$/.test(mail) || doc.length !== 11) {
      return res.status(400).json({ error: 'Informe nome, e-mail válido e CPF (11 dígitos).' });
    }
    const product = await prisma.product.findUnique({ where: { id: parseInt(productId, 10) || 0 } });
    if (!product || !product.active) return res.status(404).json({ error: 'Produto não encontrado.' });

    const order = await prisma.order.create({
      data: {
        productId: product.id, buyerName: String(name).trim(), buyerEmail: mail, buyerCpf: doc,
        amountCents: product.priceCents, downloadToken: crypto.randomBytes(32).toString('hex'),
      },
    });

    const [first, ...rest] = String(name).trim().split(/\s+/);
    const mpRes = await fetch(`${MP_API}/v1/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `order-${order.id}`,
      },
      body: JSON.stringify({
        transaction_amount: product.priceCents / 100,
        description: product.title.slice(0, 200),
        payment_method_id: 'pix',
        external_reference: String(order.id),
        notification_url: `${process.env.API_URL || ''}/api/webhook/mercadopago`,
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString().replace('Z', '-00:00'),
        payer: { email: mail, first_name: first, last_name: rest.join(' ') || first, identification: { type: 'CPF', number: doc } },
      }),
    });
    const pay = await mpRes.json();
    if (!mpRes.ok) {
      console.error('🔥 MP checkout:', mpRes.status, JSON.stringify(pay));
      await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
      return res.status(502).json({ error: 'Não foi possível gerar o Pix. Tente novamente.' });
    }
    const td = pay.point_of_interaction?.transaction_data || {};
    await prisma.order.update({
      where: { id: order.id },
      data: { mpPaymentId: String(pay.id), pixQrCode: td.qr_code, pixQrBase64: td.qr_code_base64 },
    });
    res.status(201).json({
      orderId: order.id, accessKey: order.downloadToken,
      pixCopiaECola: td.qr_code, pixQrBase64: td.qr_code_base64, amountCents: order.amountCents,
    });
  } catch (e) {
    console.error('🔥 /api/checkout:', e);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// Polling da tela de espera (autorizado pela chave do pedido)
app.get('/api/pedidos/:id/status', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: parseInt(req.params.id, 10) || 0 } });
    const key = String(req.query.key || '');
    if (!order || key.length !== order.downloadToken.length ||
        !crypto.timingSafeEqual(Buffer.from(key), Buffer.from(order.downloadToken))) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }
    if (order.status === 'PENDING' && order.mpPaymentId && process.env.MP_ACCESS_TOKEN) {
      await settleMpPayment(order.mpPaymentId).catch(() => {});
      const fresh = await prisma.order.findUnique({ where: { id: order.id } });
      return res.json({ status: fresh.status });
    }
    res.json({ status: order.status });
  } catch (e) { res.status(500).json({ error: 'Erro interno.' }); }
});

// --- Webhook Mercado Pago (valida x-signature quando MP_WEBHOOK_SECRET existe) ---
app.post('/api/webhook/mercadopago', async (req, res) => {
  try {
    const dataId = String(req.query['data.id'] || req.body?.data?.id || '');
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (secret) {
      const sig = String(req.headers['x-signature'] || '');
      const ts = /ts=([^,]+)/.exec(sig)?.[1];
      const v1 = /v1=([^,]+)/.exec(sig)?.[1];
      const manifest = `id:${dataId.toLowerCase()};request-id:${req.headers['x-request-id'] || ''};ts:${ts};`;
      const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
      if (!ts || !v1 || v1.length !== expected.length ||
          !crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected))) {
        return res.status(401).json({ error: 'assinatura inválida' });
      }
    }
    const type = req.query.type || req.body?.type;
    if (dataId && (type === 'payment' || !type)) await settleMpPayment(dataId);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('🔥 webhook MP:', e);
    res.status(500).json({ error: 'retry' }); // MP reenvia em caso de erro
  }
});

// --- Entrega: valida token e redireciona para o arquivo ---
app.get('/api/download/:token', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { downloadToken: String(req.params.token) }, include: { product: true },
    });
    if (!order || order.status !== 'PAID') return res.status(404).send('Link inválido.');
    if (Date.now() - new Date(order.paidAt).getTime() > DOWNLOAD_DAYS * 86400000 || order.downloadCount >= MAX_DOWNLOADS) {
      return res.status(410).send('Link expirado. Fale com o suporte.');
    }
    await prisma.order.update({ where: { id: order.id }, data: { downloadCount: { increment: 1 } } });
    res.redirect(302, order.product.fileUrl);
  } catch (e) { res.status(500).send('Erro interno.'); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => { console.log(`🚀 EvoCore operante na porta ${PORT}`); });