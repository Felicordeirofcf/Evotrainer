const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); 

const JWT_SECRET = process.env.JWT_SECRET || "secreto-evotrainer-2026";
const MASTER_KEY = "evotrainer2026";

// Middlewares de Segurança
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (!token) return res.status(401).json({ error: "Sessão expirada." });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido." });
    req.user = user; next();
  });
};

const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPERADMIN') return res.status(403).json({ error: "Acesso Master negado." });
  next();
};

const isAdminOrMaster = (req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') return res.status(403).json({ error: "Restrito." });
  next();
};

// --- ROTA BUSCA POR NOME (Para EvoIntelligence™ / Claude MCP) ---
app.get('/api/alunos/busca/:nome', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    const { nome } = req.params;
    const aluno = await prisma.user.findFirst({
      where: { trainerId: req.user.id, name: { contains: nome, mode: 'insensitive' } },
      select: { id: true, name: true, goal: true, level: true, anamnese: true, phone: true }
    });
    if (!aluno) return res.status(404).json({ error: "Atleta não encontrado." });
    res.json(aluno);
  } catch (e) { res.status(500).json({ error: "Erro na busca." }); }
});

// --- ROTA DE PERFIL (Senha e Segurança) ---
app.put('/api/perfil/senha', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user.password) {
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return res.status(401).json({ error: "Senha atual incorreta." });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: "Senha atualizada com sucesso!" });
  } catch (e) { res.status(500).json({ error: "Erro no processamento." }); }
});

// --- GESTÃO MASTER (SUPERADMIN) ---
app.get('/api/superadmin/trainers', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const trainers = await prisma.user.findMany({
      where: { role: 'ADMIN' }, include: { _count: { select: { alunos: true } } }, orderBy: { createdAt: 'desc' }
    });
    res.json(trainers);
  } catch (e) { res.status(500).json({ error: "Erro." }); }
});

app.put('/api/superadmin/trainers/:id/plano', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const updated = await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: { plano: req.body.plano } });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: "Erro ao mudar plano." }); }
});

app.post('/api/superadmin/trainers', authenticateToken, isSuperAdmin, async (req, res) => {
  const { name, email, password, phone, plano } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const trainer = await prisma.user.create({
      data: { name, email, phone, plano, password: hashedPassword, role: 'ADMIN', status: 'Ativo' }
    });
    res.status(201).json(trainer);
  } catch (e) { res.status(400).json({ error: "Dados inválidos ou e-mail já existe." }); }
});

// --- GESTÃO COACH (PERSONAL) ---
app.post('/api/alunos', authenticateToken, isAdminOrMaster, async (req, res) => {
  const { name, email, phone, weight, height, level, anamnese } = req.body;
  try {
    const hashed = await bcrypt.hash("123456", 10); // Senha padrão aluno
    const novo = await prisma.user.create({
      data: { name, email, phone, weight, height, level, anamnese, password: hashed, role: 'STUDENT', trainerId: req.user.id, status: 'Ativo' }
    });
    res.status(201).json(novo);
  } catch (e) { res.status(400).json({ error: "E-mail já cadastrado no banco." }); }
});

app.get('/api/alunos', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    const alunos = await prisma.user.findMany({
      where: { trainerId: req.user.id }, include: { workouts: true, _count: { select: { workouts: true } } }, orderBy: { name: 'asc' }
    });
    res.json(alunos);
  } catch (e) { res.status(500).json({ error: "Erro ao carregar lista." }); }
});

// --- AUTENTICAÇÃO ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "E-mail não encontrado." });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid && user.password !== "") return res.status(401).json({ error: "Senha inválida." });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ error: "Erro interno." }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 EvoTrainer Core rodando na porta ${PORT}`));