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

const JWT_SECRET = process.env.JWT_SECRET || "secreto-evotrainer-2026";
const MASTER_KEY = "evotrainer2026"; // Chave para criar sua conta de dono

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

const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPERADMIN') return res.status(403).json({ error: "Acesso exclusivo ao Master." });
  next();
};

const isAdminOrMaster = (req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') return res.status(403).json({ error: "Acesso restrito." });
  next();
};

// ==========================================
// 👑 ROTAS MASTER (SUPERADMIN)
// ==========================================

// Criar o primeiro SuperAdmin (Comando PowerShell)
app.post('/api/setup-master', async (req, res) => {
  const { name, email, password, secret_key } = req.body;
  if (secret_key !== MASTER_KEY) return res.status(403).json({ error: "Chave inválida." });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const master = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'SUPERADMIN', plano: 'ELITE', status: 'Ativo' }
    });
    res.json({ message: "SuperAdmin criado!", master: { name: master.name, email: master.email } });
  } catch (e) { res.status(400).json({ error: "E-mail já cadastrado." }); }
});

// Listar Personais para o Dashboard Master
app.get('/api/superadmin/trainers', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const trainers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      include: { _count: { select: { alunos: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(trainers);
  } catch (e) { res.status(500).json({ error: "Erro ao buscar trainers." }); }
});

// Master edita plano do Personal
app.put('/api/superadmin/trainers/:id/plano', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const updated = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { plano: req.body.plano }
    });
    res.json({ message: "Plano atualizado!", user: updated });
  } catch (e) { res.status(500).json({ error: "Erro" }); }
});

// Master cria Personal Manualmente
app.post('/api/superadmin/trainers', authenticateToken, isSuperAdmin, async (req, res) => {
  const { name, email, password, phone, plano } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const trainer = await prisma.user.create({
      data: { name, email, phone, plano, password: hashedPassword, role: 'ADMIN', status: 'Ativo' }
    });
    res.status(201).json(trainer);
  } catch (e) { res.status(400).json({ error: "Falha ao criar acesso." }); }
});

// ==========================================
// 🏋️ ROTAS PERSONAL (ADMIN)
// ==========================================

// Criar Aluno com Prontuário IA (Biomecânica)
app.post('/api/alunos', authenticateToken, isAdminOrMaster, async (req, res) => {
  const { name, email, phone, age, weight, height, goal, level, anamnese, restricoes } = req.body;
  try {
    const hashedPassword = await bcrypt.hash("123456", 10);
    const aluno = await prisma.user.create({
      data: {
        name, email, phone, age, weight, height, goal, level, anamnese, restricoes,
        password: hashedPassword,
        role: 'STUDENT',
        trainerId: req.user.id,
        status: 'Ativo'
      }
    });
    res.status(201).json(aluno);
  } catch (e) { res.status(400).json({ error: "Erro ao cadastrar aluno." }); }
});

app.get('/api/alunos', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    const alunos = await prisma.user.findMany({
      where: { trainerId: req.user.id },
      include: { workouts: { include: { exercises: true } }, _count: { select: { workouts: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(alunos);
  } catch (e) { res.status(500).json({ error: "Erro ao carregar alunos." }); }
});

// ==========================================
// 🔐 SEGURANÇA E RECUPERAÇÃO
// ==========================================

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid && user.password !== "") return res.status(401).json({ error: "Senha inválida." });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userNoPass } = user;
    res.json({ token, user: userNoPass });
  } catch (e) { res.status(500).json({ error: "Erro interno." }); }
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "E-mail não cadastrado." });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); 

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetExpires }
    });

    const link = `https://evotrainer.com.br?token=${resetToken}`;
    await transporter.sendMail({
      from: `"Suporte EvoTrainer" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Recuperação de Acesso",
      html: `<p>Clique para resetar sua senha: <a href="${link}">${link}</a></p>`
    });

    res.json({ message: "Verifique seu e-mail!" });
  } catch (e) { res.status(500).json({ error: "Erro no envio." }); }
});

app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetExpires: { gt: new Date() } }
    });
    if (!user) return res.status(400).json({ error: "Token inválido ou expirado." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetExpires: null }
    });
    res.json({ message: "Senha atualizada!" });
  } catch (e) { res.status(500).json({ error: "Erro." }); }
});

// Rota para IA gravar treinos (Ponte Claude MCP)
app.post('/api/treinos', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    const { title, duration, dayOfWeek, exercises, userId } = req.body;
    const treino = await prisma.workoutTemplate.create({
      data: {
        title, duration, dayOfWeek, userId,
        exercises: { create: exercises }
      }
    });
    res.status(201).json(treino);
  } catch (e) { res.status(500).json({ error: "Erro ao salvar ficha." }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 EvoTrainer Core Online: ${PORT}`));