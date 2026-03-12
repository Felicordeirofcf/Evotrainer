const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); 

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secreto-apenas-para-desenvolvimento";

// ==========================================
// CONFIGURAÇÃO DE E-MAIL (GMAIL)
// ==========================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ==========================================
// INTEGRAÇÃO EVOLUTION API (WHATSAPP)
// ==========================================
const enviarWhatsAppBoasVindas = async (telefone, nomePersonal) => {
  try {
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!evolutionUrl || !instanceName || !apiKey || !telefone) return;

    let number = telefone.replace(/\D/g, '');
    if (!number.startsWith('55')) number = '55' + number;

    const mensagem = `Olá, *${nomePersonal.split(' ')[0]}*! 🚀\n\nBem-vindo(a) ao *EvoTrainer*! Sou o assistente virtual do CEO e vi que acabou de criar a sua conta.\n\nPara começar a escalar a sua consultoria, o seu primeiro passo é aceder ao painel e adicionar o seu primeiro aluno na aba 'Alunos'.\nDepois, use a Inteligência Artificial para gerar o treino em 10 segundos.\n\nQualquer dúvida, é só responder a esta mensagem. Bora esmagar! 🔥`;

    await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: number,
        options: { delay: 2500, presence: 'composing' },
        textMessage: { text: mensagem }
      })
    });
    console.log(`[EVOLUTION] Mensagem de boas-vindas enviada para ${telefone}`);
  } catch (error) {
    console.error("[EVOLUTION] Erro ao enviar WhatsApp:", error.message);
  }
};

// ==========================================
// MIDDLEWARES DE SEGURANÇA
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (!token) return res.status(401).json({ error: "Acesso negado." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Sessão expirada." });
    req.user = user; 
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Acesso restrito." });
  next();
};

const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPERADMIN') return res.status(403).json({ error: "Acesso exclusivo ao dono do sistema." });
  next();
};

// ==========================================
// 🚀 NOVAS ROTAS: CONFIGURAÇÕES E OFERTAS (FIX 404)
// ==========================================
app.get('/api/config', async (req, res) => {
  try {
    let config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    if (!config) {
      // Cria a configuração inicial se não existir
      config = await prisma.systemConfig.create({
        data: { 
          id: 1, 
          startLink: "https://www.asaas.com/c/gppqjpyhag2jw0c9", 
          proLink: "https://www.asaas.com/c/6np0bp37c91vfla6", 
          eliteLink: "https://www.asaas.com/c/sql5glydf5g3gvxs" 
        }
      });
    }
    res.json(config);
  } catch (error) { res.status(500).json({ error: "Erro ao buscar configurações" }); }
});

app.put('/api/config', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const config = await prisma.systemConfig.update({
      where: { id: 1 },
      data: req.body
    });
    res.json({ message: "Ofertas e Preços Atualizados!", config });
  } catch (error) { res.status(500).json({ error: "Erro ao salvar configurações" }); }
});

// ==========================================
// ROTA WHITE LABEL (PÚBLICA PARA LOGIN)
// ==========================================
app.get('/api/brand/:trainerId', async (req, res) => {
  const trainerId = parseInt(req.params.trainerId);
  try {
    const trainer = await prisma.user.findUnique({ where: { id: trainerId } });
    if (!trainer) return res.status(404).json({ error: "Treinador não encontrado." });
    if (trainer.plano !== 'ELITE') {
      return res.json({ name: "EvoTrainer", color: "#2563eb", logo: null });
    }
    res.json({
      name: trainer.brandName || trainer.name,
      color: trainer.brandColor || "#2563eb",
      logo: trainer.brandLogo || null
    });
  } catch (e) { res.status(500).json({ error: "Erro interno." }); }
});

// ==========================================
// LOGIN E AUTENTICAÇÃO
// ==========================================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "E-mail não encontrado." });
    if (user.status === 'Bloqueado') return res.status(403).json({ error: "Conta suspensa." });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword && user.password !== "") return res.status(401).json({ error: "Senha incorreta." });

    let userBrand = null;
    if (user.role === 'STUDENT' && user.trainerId) {
      const trainer = await prisma.user.findUnique({ where: { id: user.trainerId } });
      if (trainer && trainer.plano === 'ELITE') {
        userBrand = { name: trainer.brandName, color: trainer.brandColor, logo: trainer.brandLogo };
      }
    } else if (user.role === 'ADMIN' && user.plano === 'ELITE') {
      userBrand = { name: user.brandName, color: user.brandColor, logo: user.brandLogo };
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword, brand: userBrand });
  } catch (error) { res.status(500).json({ error: "Erro no servidor." }); }
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "E-mail não encontrado." });
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); 
    await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetExpires } });
    const resetLink = process.env.NODE_ENV === 'production' ? `https://app.evotrainer.com?token=${resetToken}` : `http://localhost:3000?token=${resetToken}`;
    try {
      await transporter.sendMail({
        from: `"EvoTrainer Suporte" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "EvoTrainer - Recuperação de Palavra-Passe",
        html: `<p>Clique no link para redefinir: <a href="${resetLink}">Recuperar Acesso</a></p>`
      });
    } catch (e) {}
    res.json({ message: "Se o e-mail existir, receberá um link de recuperação." });
  } catch (error) { res.status(500).json({ error: "Erro interno." }); }
});

app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await prisma.user.findFirst({ where: { resetToken: token, resetExpires: { gt: new Date() } } });
    if (!user) return res.status(400).json({ error: "O link expirou ou é inválido." });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword, resetToken: null, resetExpires: null } });
    res.json({ message: "Palavra-passe redefinida!" });
  } catch (error) { res.status(500).json({ error: "Erro." }); }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password, phone, role, plano } = req.body;
  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: "E-mail já registado." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ 
      data: { name, email, password: hashedPassword, phone, role, plano, status: 'Ativo' } 
    });
    
    if (role === 'ADMIN') {
      try {
        const primeiroNome = name.split(' ')[0];
        const waText = encodeURIComponent(`Olá, ${primeiroNome}! Vi que você acabou de criar sua conta no EvoTrainer. Como posso te ajudar a escalar sua consultoria hoje?`);
        const waLink = `https://wa.me/${phone ? phone.replace(/\D/g, '') : ''}?text=${waText}`;
        await transporter.sendMail({
          from: `"EvoTrainer Alertas" <${process.env.SMTP_USER}>`,
          to: process.env.SMTP_USER,
          subject: "🎉 NOVO CLIENTE REGISTADO!",
          html: `<p>Novo Personal: ${name} (${email})</p><a href="${waLink}">Chamar no WhatsApp</a>`
        });
        enviarWhatsAppBoasVindas(phone, name);
      } catch (e) {}
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ message: "Conta criada com sucesso!", token, user: userWithoutPassword });
  } catch (error) { res.status(500).json({ error: "Erro ao criar conta." }); }
});

app.post('/api/setup-master', async (req, res) => {
  const { name, email, password, phone, secret_key } = req.body;
  if (secret_key !== "evotrainer2026") return res.status(403).json({ error: "Chave inválida." });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const master = await prisma.user.create({ data: { name, email, password: hashedPassword, phone, role: 'SUPERADMIN', plano: 'DONO', status: 'Ativo' } });
    res.json({ message: "Master criado!", master });
  } catch (error) { res.status(400).json({ error: "Erro." }); }
});

// ==========================================
// ROTAS DE GESTÃO E TREINOS
// ==========================================

app.get('/api/superadmin/trainers', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const trainers = await prisma.user.findMany({ where: { role: 'ADMIN' }, include: { _count: { select: { alunos: true } } } });
    res.json(trainers);
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.put('/api/superadmin/trainers/:id/plano', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const updated = await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: { plano: req.body.plano } });
    res.json({ message: `Plano atualizado!`, user: updated });
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.delete('/api/superadmin/trainers/:id', authenticateToken, isSuperAdmin, async (req, res) => {
  const trainerId = parseInt(req.params.id);
  try {
    const students = await prisma.user.findMany({ where: { trainerId } });
    const studentIds = students.map(s => s.id);
    if (studentIds.length > 0) {
       await prisma.workoutHistory.deleteMany({ where: { userId: { in: studentIds } } });
       const treinos = await prisma.workoutTemplate.findMany({ where: { userId: { in: studentIds } } });
       const treinoIds = treinos.map(t => t.id);
       if(treinoIds.length > 0) await prisma.exercise.deleteMany({ where: { workoutId: { in: treinoIds } } });
       await prisma.workoutTemplate.deleteMany({ where: { userId: { in: studentIds } } });
       await prisma.user.deleteMany({ where: { id: { in: studentIds } } }); 
    }
    await prisma.user.delete({ where: { id: trainerId } });
    res.json({ message: "Apagado!" });
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.post('/api/ai/gerar-treino', authenticateToken, isAdmin, async (req, res) => {
  const { alunoId, split, frequencia, prompt, volume, metodologia } = req.body;
  try {
    const trainer = await prisma.user.findUnique({ where: { id: req.user.id } });
    const IA_LIMITS = { 'GRATIS': 0, 'START': 10, 'PRO': 40, 'ELITE': 9999 };
    if (trainer.iaUsadaMes >= (IA_LIMITS[trainer.plano || 'GRATIS'] || 0)) {
      return res.status(403).json({ error: `Atingiu o limite de IA do plano.` });
    }
    const aluno = await prisma.user.findUnique({ where: { id: parseInt(alunoId) } });
    if (!aluno || aluno.trainerId !== req.user.id) return res.status(404).json({ error: "Aluno não encontrado." });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ 
        model: 'gpt-4o-mini', 
        messages: [{ role: 'system', content: 'Personal Trainer Especialista...' }, { role: 'user', content: `Crie treino JSON para ${aluno.name}...` }], 
        response_format: { type: "json_object" }
      })
    });
    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    
    for (const ficha of content.fichas) {
      await prisma.workoutTemplate.create({ 
        data: { title: ficha.title, duration: ficha.duration, userId: aluno.id, exercises: { create: ficha.exercises } } 
      });
    }
    await prisma.user.update({ where: { id: req.user.id }, data: { iaUsadaMes: trainer.iaUsadaMes + 1 } });
    res.json({ message: "Sucesso!" });
  } catch (error) { res.status(500).json({ error: "Erro na IA." }); }
});

// ROTAS DE ALUNOS
app.get('/api/alunos', authenticateToken, isAdmin, async (req, res) => {
  try {
    const alunos = await prisma.user.findMany({ 
      where: { role: 'STUDENT', trainerId: req.user.id }, 
      include: { workouts: true, history: { orderBy: { completedAt: 'desc' }, take: 1 }, _count: { select: { workouts: true } } } 
    });
    res.json(alunos);
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.post('/api/alunos', authenticateToken, isAdmin, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password || "123456", 10);
    const novo = await prisma.user.create({ data: { ...req.body, password: hashedPassword, role: 'STUDENT', trainerId: req.user.id } });
    res.status(201).json(novo);
  } catch (error) { res.status(400).json({ error: "Erro ao criar aluno." }); }
});

// WEBHOOK ASAAS (DINÂMICO)
app.post('/api/webhooks/asaas', async (req, res) => {
  const { event, payment } = req.body;
  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    const userId = payment.externalReference; 
    const valorPago = Number(payment.value); 
    try {
      const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
      let novoPlano = 'GRATIS';
      if (valorPago >= Number(config.elitePrice)) novoPlano = 'ELITE';
      else if (valorPago >= Number(config.proPrice)) novoPlano = 'PRO';
      else if (valorPago >= Number(config.startPrice)) novoPlano = 'START';
      if (userId) await prisma.user.update({ where: { id: parseInt(userId) }, data: { plano: novoPlano } });
    } catch (e) {}
  }
  res.status(200).json({ received: true });
});

app.listen(3001, () => console.log('🚀 Backend EvoTrainer Rodando na porta 3001'));