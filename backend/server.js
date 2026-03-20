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
      headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
      body: JSON.stringify({
        number: number,
        options: { delay: 2500, presence: 'composing' },
        textMessage: { text: mensagem }
      })
    });
  } catch (error) { console.error("[EVOLUTION] Erro", error.message); }
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
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') return res.status(403).json({ error: "Acesso restrito." });
  next();
};

const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPERADMIN') return res.status(403).json({ error: "Acesso exclusivo ao Master." });
  next();
};

// ==========================================
// 🚀 ROTAS MASTER (SUPERADMIN) - GESTÃO DO SaaS
// ==========================================

// Dashboard Master: Estatísticas Globais
app.get('/api/superadmin/stats', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
      const totalTrainers = await prisma.user.count({ where: { role: 'ADMIN' } });
      const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
      const trainersPorPlano = await prisma.user.groupBy({
        by: ['plano'],
        where: { role: 'ADMIN' },
        _count: true
      });
      
      // Cálculo de faturamento aproximado (exemplo)
      const faturamentoTotal = trainersPorPlano.reduce((acc, curr) => {
         if (curr.plano === 'START') return acc + (curr._count * 30);
         if (curr.plano === 'PRO') return acc + (curr._count * 60);
         if (curr.plano === 'ELITE') return acc + (curr._count * 100);
         return acc;
      }, 0);

      res.json({ totalTrainers, totalStudents, faturamentoTotal, trainersPorPlano });
    } catch (e) { res.status(500).json({ error: "Erro ao carregar métricas master." }); }
});

app.get('/api/superadmin/trainers', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const trainers = await prisma.user.findMany({ 
      where: { role: 'ADMIN' }, 
      orderBy: { createdAt: 'desc' }, 
      include: { _count: { select: { alunos: true } } } 
    });
    res.json(trainers);
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

// ==========================================
// 🏋️ ROTAS PERSONAL (ADMIN) - GESTÃO DA CONSULTORIA
// ==========================================

// Dashboard Personal: Estatísticas da Consultoria
app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        const alunoCount = await prisma.user.count({ where: { trainerId: req.user.id } });
        const treinosNoBanco = await prisma.workoutTemplate.count({
            where: { user: { trainerId: req.user.id } }
        });
        const treinosMes = await prisma.workoutHistory.count({
            where: { user: { trainerId: req.user.id } }
        });

        res.json({ alunoCount, treinosNoBanco, treinosMes });
    } catch (e) { res.status(500).json({ error: "Erro ao carregar dashboard." }); }
});

app.get('/api/alunos', authenticateToken, isAdmin, async (req, res) => {
  try {
    const alunos = await prisma.user.findMany({ 
      where: { role: 'STUDENT', trainerId: req.user.id }, 
      orderBy: { createdAt: 'desc' }, 
      include: { 
        workouts: { include: { exercises: true } }, 
        history: { orderBy: { completedAt: 'desc' }, take: 1 }, 
        _count: { select: { workouts: true } } 
      } 
    });
    res.json(alunos);
  } catch (error) { res.status(500).json({ error: "Erro ao buscar alunos." }); }
});

// ==========================================
// 🧠 MÁGICO DE IA (OPENAI GPT-4o-mini)
// ==========================================
app.post('/api/ai/gerar-treino', authenticateToken, isAdmin, async (req, res) => {
  const { alunoId, split, frequencia, prompt, metodologia, localTreino } = req.body;
  try {
    const trainer = await prisma.user.findUnique({ where: { id: req.user.id } });
    const limits = { 'GRATIS': 0, 'START': 10, 'PRO': 40, 'ELITE': 9999 };
    
    if (trainer.iaUsadaMes >= (limits[trainer.plano] || 0)) {
      return res.status(403).json({ error: "Limite de IA atingido para o seu plano." });
    }

    const aluno = await prisma.user.findUnique({ where: { id: parseInt(alunoId) } });

    const systemPrompt = `Você é um Personal Trainer de Elite. Monte um treino em JSON.
    Regras: 
    1. Retorne APENAS o JSON. 
    2. Estrutura: {"fichas": [{"title": "Treino A", "duration": "60 min", "exercises": [{"name": "Puxada Alta", "sets": "3x12", "weight": "Moderado"}]}]}`;

    const userPrompt = `Aluno: ${aluno.name}. Objetivo: ${prompt}. Local: ${localTreino}. Frequência: ${frequencia}. Metodologia: ${metodologia}.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ 
        model: 'gpt-4o-mini', 
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], 
        response_format: { type: "json_object" }
      })
    });

    const aiData = await response.json();
    const content = JSON.parse(aiData.choices[0].message.content);

    // Salva automaticamente no banco de dados para o aluno
    for (const ficha of content.fichas) {
      await prisma.workoutTemplate.create({
        data: {
          title: ficha.title,
          duration: ficha.duration,
          userId: aluno.id,
          dayOfWeek: "Segunda", // Placeholder
          exercises: { create: ficha.exercises }
        }
      });
    }

    await prisma.user.update({ where: { id: req.user.id }, data: { iaUsadaMes: { increment: 1 } } });
    res.json({ message: "Treinos gerados e salvos no banco!" });

  } catch (error) { res.status(500).json({ error: "Falha na IA." }); }
});

// ==========================================
// AUTENTICAÇÃO E CONFIG
// ==========================================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "E-mail não encontrado." });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Senha incorreta." });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) { res.status(500).json({ error: "Erro interno." }); }
});

// Inicialização
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Backend EvoTrainer Rodando: ${PORT}`));