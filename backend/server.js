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

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "seuemail@gmail.com",
    pass: process.env.SMTP_PASS || "suasenha",
  },
});

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
// LOGIN (COM INJEÇÃO DE WHITE LABEL)
// ==========================================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "E-mail não encontrado no sistema." });
    if (user.status === 'Bloqueado') return res.status(403).json({ error: "A sua conta encontra-se suspensa." });

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
  } catch (error) { 
    console.error("ERRO NO LOGIN:", error); 
    res.status(500).json({ error: "Erro ao fazer login." }); 
  }
});

// ROTAS DE RECUPERAÇÃO DE SENHA
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "E-mail não encontrado." });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); 

    await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetExpires } });

    const resetLink = `http://localhost:3000?token=${resetToken}`; 
    console.log("=== LINK DE RECUPERAÇÃO GERADO ===");
    console.log(resetLink); 
    
    try {
      await transporter.sendMail({
        from: '"EvoTrainer" <no-reply@evotrainer.com>',
        to: user.email,
        subject: "Recuperação de Palavra-Passe",
        html: `<p>Clique no link para redefinir: <a href="${resetLink}">${resetLink}</a></p>`
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

    res.json({ message: "Palavra-passe redefinida! Pode iniciar sessão." });
  } catch (error) { res.status(500).json({ error: "Erro interno." }); }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password, role, plano } = req.body;
  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: "Este e-mail já está registado." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashedPassword, role, plano, status: 'Ativo' } });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ message: "Conta criada com sucesso!", token, user: userWithoutPassword });
  } catch (error) { res.status(500).json({ error: "Erro ao criar conta." }); }
});

app.post('/api/setup-master', async (req, res) => {
  const { name, email, password, secret_key } = req.body;
  if (secret_key !== "evotrainer2026") return res.status(403).json({ error: "Chave secreta inválida." });
  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: "E-mail já em uso." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const master = await prisma.user.create({ data: { name, email, password: hashedPassword, role: 'SUPERADMIN', plano: 'DONO', status: 'Ativo' } });
    res.json({ message: "Conta do Dono (SuperAdmin) criada com sucesso!", master });
  } catch (error) { res.status(400).json({ error: "Erro ao criar Master." }); }
});

app.get('/api/superadmin/trainers', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const trainers = await prisma.user.findMany({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'desc' }, include: { _count: { select: { alunos: true } } } });
    res.json(trainers);
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.put('/api/superadmin/trainers/:id/plano', authenticateToken, isSuperAdmin, async (req, res) => {
  const { plano } = req.body;
  try {
    const updated = await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: { plano } });
    res.json({ message: `Plano atualizado para ${plano}`, user: updated });
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
  const { alunoId, split, frequencia, prompt } = req.body;
  try {
    const trainer = await prisma.user.findUnique({ where: { id: req.user.id } });
    const planoAtual = trainer.plano || 'GRATIS';
    const IA_LIMITS = { 'GRATIS': 0, 'START': 10, 'PRO': 40, 'ELITE': 9999 };
    const limitePermitido = IA_LIMITS[planoAtual];

    if (trainer.iaUsadaMes >= limitePermitido) {
      return res.status(403).json({ error: `Atingiu o limite de IA.` });
    }
    const aluno = await prisma.user.findUnique({ where: { id: parseInt(alunoId) } });
    if (!aluno || aluno.trainerId !== req.user.id) return res.status(404).json({ error: "Aluno não encontrado." });

    const systemPrompt = `Você é um Personal Trainer Master. DEVE RETORNAR JSON COM A ESTRUTURA: { "fichas": [ { "title": "...", "duration": "...", "exercises": [ { "name": "...", "sets": "...", "weight": "...", "isConjugado": false, "conjugadoCom": "" } ] } ] }`;
    const userPrompt = `Plano para o aluno ${aluno.name}. Divisão: ${split}. Foco: ${prompt}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], response_format: { type: "json_object" } })
    });

    const data = await response.json();
    const fichas = JSON.parse(data.choices[0].message.content).fichas;
    const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    for (let i = 0; i < parseInt(frequencia); i++) {
      const treinoData = fichas[i % fichas.length];
      const exercisesWithVideo = await Promise.all(treinoData.exercises.map(async (ex) => {
        let youtubeId = null;
        try {
          const ytResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(ex.name + ' execução')}&maxResults=1&type=video&key=${YOUTUBE_API_KEY}`);
          const ytData = await ytResponse.json();
          if (ytData.items && ytData.items.length > 0) youtubeId = ytData.items[0].id.videoId;
        } catch (err) {}
        return { name: ex.name, sets: ex.sets, weight: ex.weight || "", youtubeId, isConjugado: ex.isConjugado || false, conjugadoCom: ex.conjugadoCom || null };
      }));
      await prisma.workoutTemplate.create({ data: { title: treinoData.title, duration: treinoData.duration, userId: aluno.id, dayOfWeek: dias[i], exercises: { create: exercisesWithVideo } } });
    }

    await prisma.user.update({ where: { id: req.user.id }, data: { iaUsadaMes: trainer.iaUsadaMes + 1 } });
    res.json({ message: "Treino gerado!" });
  } catch (error) { res.status(500).json({ error: "Erro IA" }); }
});

app.get('/api/alunos', authenticateToken, isAdmin, async (req, res) => {
  try {
    const alunos = await prisma.user.findMany({ where: { role: 'STUDENT', trainerId: req.user.id }, orderBy: { createdAt: 'desc' }, include: { workouts: { orderBy: { id: 'asc' } }, _count: { select: { workouts: true } } } });
    res.json(alunos);
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.post('/api/alunos', authenticateToken, isAdmin, async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const trainerInfo = await prisma.user.findUnique({ where: { id: req.user.id }, include: { _count: { select: { alunos: true } } } });
    const limits = { 'GRATIS': 5, 'START': 20, 'PRO': 9999, 'ELITE': 9999 };
    const planoAtual = trainerInfo.plano || 'GRATIS';
    if (trainerInfo._count.alunos >= limits[planoAtual]) return res.status(403).json({ error: `Limite atingido.` });

    const hashedPassword = await bcrypt.hash(password || "123456", 10);
    const novo = await prisma.user.create({ data: { name, email, password: hashedPassword, phone, role: 'STUDENT', status: 'Novo', streak: 0, trainerId: req.user.id } });
    res.status(201).json(novo);
  } catch (error) { res.status(400).json({ error: "Erro" }); }
});

app.put('/api/alunos/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const aluno = await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: { status: req.body.status } });
    res.json(aluno);
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.delete('/api/alunos/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const alunoId = parseInt(req.params.id);
    await prisma.workoutHistory.deleteMany({ where: { userId: alunoId } });
    const treinos = await prisma.workoutTemplate.findMany({ where: { userId: alunoId } });
    for (const treino of treinos) await prisma.exercise.deleteMany({ where: { workoutId: treino.id } });
    await prisma.workoutTemplate.deleteMany({ where: { userId: alunoId } });
    await prisma.user.delete({ where: { id: alunoId } });
    res.json({ message: "Apagado!" });
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.put('/api/alunos/:id/perfil', authenticateToken, async (req, res) => {
  const targetUserId = parseInt(req.params.id);
  if (req.user.role !== 'ADMIN' && req.user.id !== targetUserId) return res.status(403).json({ error: "Acesso negado." });
  
  const { name, email, phone, age, weight, height, goal, notes, avatar, brandName, brandColor, brandLogo } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { name, email, phone, age, weight, height, goal, notes, avatar, brandName, brandColor, brandLogo }
    });
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) { res.status(500).json({ error: "Erro." }); }
});

app.put('/api/alunos/:id/senha', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword && user.password !== "") return res.status(401).json({ error: "Senha atual incorreta." });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: { password: hashedNewPassword } });
    res.json({ message: "Senha alterada!" });
  } catch (error) { res.status(500).json({ error: "Erro." }); }
});

app.post('/api/treinos', authenticateToken, isAdmin, async (req, res) => {
  try {
    const novoTreino = await prisma.workoutTemplate.create({ data: { title: req.body.title, duration: req.body.duration, userId: req.body.userId, dayOfWeek: req.body.dayOfWeek, exercises: { create: req.body.exercises } } });
    res.status(201).json({ message: "Treino criado!", treino: novoTreino });
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.put('/api/treinos/:workoutId', authenticateToken, isAdmin, async (req, res) => {
  try {
    await prisma.exercise.deleteMany({ where: { workoutId: parseInt(req.params.workoutId) } });
    const treino = await prisma.workoutTemplate.update({ where: { id: parseInt(req.params.workoutId) }, data: { title: req.body.title, duration: req.body.duration, dayOfWeek: req.body.dayOfWeek, exercises: { create: req.body.exercises } } });
    res.json({ message: "Atualizado!", treino });
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.delete('/api/treinos/:workoutId', authenticateToken, isAdmin, async (req, res) => {
  try {
    await prisma.exercise.deleteMany({ where: { workoutId: parseInt(req.params.workoutId) } });
    await prisma.workoutTemplate.delete({ where: { id: parseInt(req.params.workoutId) } });
    res.json({ message: "Apagado!" });
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.get('/api/treinos/aluno/:id', authenticateToken, async (req, res) => {
  try {
    const treinos = await prisma.workoutTemplate.findMany({ where: { userId: parseInt(req.params.id) }, include: { exercises: true }, orderBy: { id: 'asc' } });
    res.json(treinos);
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.post('/api/treinos/finalizar', authenticateToken, async (req, res) => {
  try {
    await prisma.workoutHistory.create({ data: { userId: req.body.userId, workoutName: req.body.workoutName } });
    const user = await prisma.user.update({ where: { id: req.body.userId }, data: { streak: { increment: 1 }, status: 'Ativo' } });
    res.json({ message: "Sucesso!", novaOfensiva: user.streak });
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.post('/api/webhooks/asaas', async (req, res) => {
  const { event, payment } = req.body;
  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    const userId = payment.externalReference; 
    const valorPago = Number(payment.value); 
    let novoPlano = 'PRO'; 
    if (valorPago === 30) novoPlano = 'START';
    else if (valorPago === 60) novoPlano = 'PRO';
    else if (valorPago === 100) novoPlano = 'ELITE';
    if (userId) { try { await prisma.user.update({ where: { id: parseInt(userId) }, data: { plano: novoPlano } }); } catch (error) {} }
  }
  res.status(200).json({ received: true });
});

app.listen(3001, () => console.log('🚀 Backend a correr na porta 3001'));