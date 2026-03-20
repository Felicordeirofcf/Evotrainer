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

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secreto-apenas-para-desenvolvimento";
const MASTER_KEY = "evotrainer2026"; // Chave para criar o primeiro SuperAdmin

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
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
    return res.status(403).json({ error: "Acesso restrito a treinadores." });
  }
  next();
};

const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPERADMIN') {
    return res.status(403).json({ error: "Acesso exclusivo ao Master." });
  }
  next();
};

// ==========================================
// 👑 ROTAS MASTER (SUPERADMIN)
// ==========================================

// Criar o primeiro SuperAdmin (Master)
app.post('/api/setup-master', async (req, res) => {
  const { name, email, password, secret_key } = req.body;
  if (secret_key !== MASTER_KEY) return res.status(403).json({ error: "Chave mestre inválida." });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const master = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'SUPERADMIN', plano: 'ELITE', status: 'Ativo' }
    });
    res.json({ message: "SuperAdmin criado com sucesso!", master: { name: master.name, email: master.email } });
  } catch (e) { res.status(400).json({ error: "E-mail já cadastrado." }); }
});

// Listar todos os Personais
app.get('/api/superadmin/trainers', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const trainers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      include: { _count: { select: { alunos: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(trainers);
  } catch (e) { res.status(500).json({ error: "Erro ao buscar personais." }); }
});

// Criar Personal Manualmente (Por você, o Master)
app.post('/api/superadmin/trainers', authenticateToken, isSuperAdmin, async (req, res) => {
  const { name, email, password, phone, plano } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const trainer = await prisma.user.create({
      data: { name, email, phone, plano, password: hashedPassword, role: 'ADMIN', status: 'Ativo' }
    });
    res.status(201).json(trainer);
  } catch (e) { res.status(400).json({ error: "Erro ao criar personal." }); }
});

// Editar Plano do Personal
app.put('/api/superadmin/trainers/:id/plano', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const updated = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { plano: req.body.plano }
    });
    res.json({ message: "Plano atualizado!", user: updated });
  } catch (e) { res.status(500).json({ error: "Erro ao atualizar plano." }); }
});

// ==========================================
// 🏋️ ROTAS PERSONAL (ADMIN)
// ==========================================

// Criar Aluno com Prontuário Completo (Contexto para IA)
app.post('/api/alunos', authenticateToken, isAdmin, async (req, res) => {
  const { name, email, password, phone, age, weight, height, goal, level, anamnese, restricoes } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password || "123456", 10);
    const novoAluno = await prisma.user.create({
      data: {
        name, email, phone, age, weight, height, goal, level, anamnese, restricoes,
        password: hashedPassword,
        role: 'STUDENT',
        trainerId: req.user.id,
        status: 'Ativo'
      }
    });
    res.status(201).json(novoAluno);
  } catch (e) { res.status(400).json({ error: "Erro ao criar aluno. E-mail duplicado?" }); }
});

// Listar Alunos do Personal logado
app.get('/api/alunos', authenticateToken, isAdmin, async (req, res) => {
  try {
    const alunos = await prisma.user.findMany({
      where: { trainerId: req.user.id },
      include: { _count: { select: { workouts: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(alunos);
  } catch (e) { res.status(500).json({ error: "Erro ao buscar alunos." }); }
});

// ==========================================
// 🔐 AUTENTICAÇÃO
// ==========================================

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
    if (user.status === 'Bloqueado') return res.status(403).json({ error: "Conta suspensa." });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword && user.password !== "") return res.status(401).json({ error: "Senha incorreta." });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (error) { res.status(500).json({ error: "Erro interno no servidor." }); }
});

// Rota de teste
app.get('/api/health', (req, res) => res.json({ status: "OK", timestamp: new Date() }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 EvoTrainer Server rodando na porta ${PORT}`));