const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const YOUTUBE_API_KEY = "AIzaSyAzUFb4SbFTC96uhJ7uqiO6yQ5KdRPLcgg";
const JWT_SECRET = "treino-ai-super-secreto-123"; 

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

// ==========================================
// LOGIN E AUTENTICAÇÃO
// ==========================================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "E-mail não encontrado no sistema." });
    if (user.status === 'Bloqueado') return res.status(403).json({ error: "A sua conta encontra-se suspensa." });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword && user.password !== "") return res.status(401).json({ error: "Senha incorreta." });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ token, user: userWithoutPassword });
  } catch (error) { res.status(500).json({ error: "Erro ao fazer login." }); }
});

app.post('/api/setup-admin', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'ADMIN', status: 'Ativo' }
    });
    res.json({ message: "Conta Admin criada com sucesso!", admin });
  } catch (error) { res.status(400).json({ error: "Erro ao criar Admin." }); }
});

// ==========================================
// ROTAS DE ALUNOS 
// ==========================================
app.get('/api/alunos', authenticateToken, isAdmin, async (req, res) => {
  try {
    const alunos = await prisma.user.findMany({ 
      where: { role: 'STUDENT' }, 
      orderBy: { createdAt: 'desc' },
      include: { workouts: { orderBy: { id: 'asc' } }, _count: { select: { workouts: true } } }
    });
    res.json(alunos);
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.post('/api/alunos', authenticateToken, isAdmin, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const passToHash = password || "123456";
    const hashedPassword = await bcrypt.hash(passToHash, 10);

    const novo = await prisma.user.create({ 
        data: { name, email, password: hashedPassword, role: 'STUDENT', status: 'Novo', streak: 0 } 
    });
    res.status(201).json(novo);
  } catch (error) { res.status(400).json({ error: "Erro ao criar aluno" }); }
});

app.put('/api/alunos/:id/status', authenticateToken, isAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    const aluno = await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: { status } });
    res.json(aluno);
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

// NOVO: ROTA PARA EXCLUIR O ALUNO COMPLETAMENTE
app.delete('/api/alunos/:id', authenticateToken, isAdmin, async (req, res) => {
  const alunoId = parseInt(req.params.id);
  try {
    // 1. Apagar histórico de treinos do aluno
    await prisma.workoutHistory.deleteMany({ where: { userId: alunoId } });
    
    // 2. Apagar exercícios dos treinos do aluno
    const treinos = await prisma.workoutTemplate.findMany({ where: { userId: alunoId } });
    for (const treino of treinos) {
      await prisma.exercise.deleteMany({ where: { workoutId: treino.id } });
    }

    // 3. Apagar os treinos base do aluno
    await prisma.workoutTemplate.deleteMany({ where: { userId: alunoId } });

    // 4. Finalmente, apagar o próprio aluno
    await prisma.user.delete({ where: { id: alunoId } });

    res.json({ message: "Aluno excluído com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir aluno." });
  }
});

// ==========================================
// PERFIL DO ALUNO
// ==========================================
app.put('/api/alunos/:id/perfil', authenticateToken, async (req, res) => {
  const targetUserId = parseInt(req.params.id);
  if (req.user.role !== 'ADMIN' && req.user.id !== targetUserId) return res.status(403).json({ error: "Acesso negado." });

  const { name, email, phone, age, weight, height, goal, notes } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { name, email, phone, age, weight, height, goal, notes }
    });
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) { res.status(500).json({ error: "Erro." }); }
});

app.put('/api/alunos/:id/senha', authenticateToken, async (req, res) => {
  const targetUserId = parseInt(req.params.id);
  if (req.user.id !== targetUserId) return res.status(403).json({ error: "Acesso negado." });

  const { currentPassword, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword && user.password !== "") return res.status(401).json({ error: "A senha atual está incorreta." });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: targetUserId }, data: { password: hashedNewPassword } });
    res.json({ message: "Senha alterada!" });
  } catch (error) { res.status(500).json({ error: "Erro." }); }
});

// ==========================================
// ROTAS DE TREINOS 
// ==========================================
app.post('/api/treinos', authenticateToken, isAdmin, async (req, res) => {
  const { title, duration, exercises, userId, dayOfWeek } = req.body; 
  try {
    const exercisesWithVideo = await Promise.all(exercises.map(async (ex) => {
      let youtubeId = null;
      try {
        const termoBusca = encodeURIComponent(`${ex.name} exercicio musculacao execucao`);
        const ytResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${termoBusca}&maxResults=1&type=video&videoEmbeddable=true&key=${YOUTUBE_API_KEY}`);
        const ytData = await ytResponse.json();
        if (ytData.items && ytData.items.length > 0) youtubeId = ytData.items[0].id.videoId;
      } catch (err) {}

      return { 
        name: ex.name, sets: ex.sets, weight: ex.weight || "", youtubeId, 
        isConjugado: ex.isConjugado || false, conjugadoCom: ex.conjugadoCom || null 
      };
    }));

    const novoTreino = await prisma.workoutTemplate.create({
      data: { title, duration, userId, dayOfWeek: dayOfWeek || "Segunda", exercises: { create: exercisesWithVideo } }
    });
    res.status(201).json({ message: "Treino criado!", treino: novoTreino });
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.put('/api/treinos/:workoutId', authenticateToken, isAdmin, async (req, res) => {
  const workoutId = parseInt(req.params.workoutId);
  const { title, duration, exercises, dayOfWeek } = req.body; 
  try {
    await prisma.exercise.deleteMany({ where: { workoutId: workoutId } });
    const exercisesWithVideo = await Promise.all(exercises.map(async (ex) => {
      let youtubeId = ex.youtubeId || null; 
      try {
        const termoBusca = encodeURIComponent(`${ex.name} exercicio musculacao execucao`);
        const ytResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${termoBusca}&maxResults=1&type=video&videoEmbeddable=true&key=${YOUTUBE_API_KEY}`);
        const ytData = await ytResponse.json();
        if (ytData.items && ytData.items.length > 0) youtubeId = ytData.items[0].id.videoId;
      } catch (err) {}
      return { 
        name: ex.name, sets: ex.sets, weight: ex.weight || "", youtubeId,
        isConjugado: ex.isConjugado || false, conjugadoCom: ex.conjugadoCom || null 
      };
    }));

    const treino = await prisma.workoutTemplate.update({
      where: { id: workoutId },
      data: { title, duration, dayOfWeek, exercises: { create: exercisesWithVideo } }
    });
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
  const targetUserId = parseInt(req.params.id);
  if (req.user.role !== 'ADMIN' && req.user.id !== targetUserId) return res.status(403).json({ error: "Acesso negado." });

  try {
    const treinos = await prisma.workoutTemplate.findMany({ where: { userId: targetUserId }, include: { exercises: true }, orderBy: { id: 'asc' } });
    res.json(treinos);
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.post('/api/treinos/finalizar', authenticateToken, async (req, res) => {
  const { userId, workoutName } = req.body;
  if (req.user.role !== 'ADMIN' && req.user.id !== userId) return res.status(403).json({ error: "Acesso negado." });

  try {
    await prisma.workoutHistory.create({ data: { userId, workoutName } });
    const user = await prisma.user.update({ where: { id: userId }, data: { streak: { increment: 1 }, status: 'Ativo' } });
    res.json({ message: "Treino finalizado com sucesso! 🔥", novaOfensiva: user.streak });
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.listen(3001, () => console.log('🚀 Backend rodando na porta 3001'));