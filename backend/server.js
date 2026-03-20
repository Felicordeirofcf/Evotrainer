const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' })); 

const JWT_SECRET = process.env.JWT_SECRET || "secreto-evotrainer-2026";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// --- MIDDLEWARES ---
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

// --- EVOINTELLIGENCE™: GERAÇÃO AUTÔNOMA ---
app.post('/api/ai/gerar-autonomo', authenticateToken, isAdminOrMaster, async (req, res) => {
  const { alunoId, comandoPersonal } = req.body;
  try {
    const aluno = await prisma.user.findUnique({ where: { id: parseInt(alunoId) } });
    if (!aluno) return res.status(404).json({ error: "Atleta não encontrado." });

    const systemPrompt = `Você é a Engine EvoIntelligence™, especialista em biomecânica. 
    Monte um treino em JSON para o aluno ${aluno.name}. 
    Nível: ${aluno.level}. Prontuário: ${aluno.anamnese || 'Sem restrições'}.
    Responda APENAS o JSON no formato: {"title": "Nome do Treino", "exercises": [{"name": "Exercicio", "sets": "3x12", "weight": "Moderado", "youtubeId": ""}]}`;

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: comandoPersonal }],
        response_format: { type: "json_object" }
      })
    });

    const aiData = await aiRes.json();
    const treinoJson = JSON.parse(aiData.choices[0].message.content);

    const novoTreino = await prisma.workoutTemplate.create({
      data: {
        title: treinoJson.title,
        userId: aluno.id,
        duration: "60 min",
        exercises: { create: treinoJson.exercises }
      }
    });

    res.json({ message: "Protocolo salvo no banco!", treino: novoTreino });
  } catch (e) { res.status(500).json({ error: "Falha na Engine EvoIntelligence." }); }
});

// --- GESTÃO DE ACESSO ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid && user.password !== "") return res.status(401).json({ error: "Senha inválida." });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ error: "Erro interno." }); }
});

app.put('/api/perfil/senha', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Senha atual incorreta." });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: "Segurança atualizada!" });
  } catch (e) { res.status(500).json({ error: "Erro ao processar." }); }
});

// --- GESTÃO DE ATLETAS (COACH) ---
app.post('/api/alunos', authenticateToken, isAdminOrMaster, async (req, res) => {
  const { name, email, phone, weight, height, level, anamnese } = req.body;
  try {
    const hashed = await bcrypt.hash("123456", 10);
    const novo = await prisma.user.create({
      data: { name, email, phone, weight, height, level, anamnese, password: hashed, role: 'STUDENT', trainerId: req.user.id, status: 'Ativo' }
    });
    res.status(201).json(novo);
  } catch (e) { res.status(400).json({ error: "E-mail já existe." }); }
});

app.get('/api/alunos', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    const alunos = await prisma.user.findMany({
      where: { trainerId: req.user.id }, include: { workouts: true, _count: { select: { workouts: true } } }, orderBy: { name: 'asc' }
    });
    res.json(alunos);
  } catch (e) { res.status(500).json({ error: "Erro ao buscar lista." }); }
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
  } catch (e) { res.status(500).json({ error: "Erro." }); }
});

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 EvoTrainer Core em: ${PORT}`));