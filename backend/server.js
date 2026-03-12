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
// 🚀 ROTAS DE CONFIGURAÇÃO E PROMOÇÕES
// ==========================================
app.get('/api/config', async (req, res) => {
  try {
    let config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    if (!config) {
      config = await prisma.systemConfig.create({
        data: { 
          id: 1, 
          startPrice: "30",
          startLink: "https://www.asaas.com/c/gppqjpyhag2jw0c9", 
          proPrice: "60",
          proLink: "https://www.asaas.com/c/6np0bp37c91vfla6", 
          elitePrice: "100",
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
// ROTA WHITE LABEL E LOGIN
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
    res.status(500).json({ error: "Erro ao fazer login." }); 
  }
});

// ==========================================
// ROTAS DE REGISTO E SENHA
// ==========================================
app.post('/api/register', async (req, res) => {
  const { name, email, password, phone, role, plano } = req.body;
  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: "Este e-mail já está registado." });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ 
      data: { name, email, password: hashedPassword, phone, role, plano, status: 'Ativo' } 
    });
    
    // ENVIAR E-MAIL DE ALERTA PARA O DONO DO SISTEMA E WHATSAPP
    if (role === 'ADMIN') {
      try {
        const primeiroNome = name.split(' ')[0];
        const waText = encodeURIComponent(`Olá, ${primeiroNome}! Vi que você acabou de criar sua conta no EvoTrainer. Como posso te ajudar hoje?`);
        const waLink = `https://wa.me/${phone ? phone.replace(/\D/g, '') : ''}?text=${waText}`;

        await transporter.sendMail({
          from: `"EvoTrainer Alertas" <${process.env.SMTP_USER}>`,
          to: process.env.SMTP_USER,
          subject: "🎉 NOVO CLIENTE REGISTADO - EvoTrainer!",
          html: `<p><strong>Nome:</strong> ${name}</p><p><strong>E-mail:</strong> ${email}</p><p><strong>WhatsApp:</strong> ${phone || 'Não fornecido'}</p><a href="${waLink}">Chamar no WhatsApp</a>`
        });
        
        // Envia mensagem via Evolution API (se configurada)
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
  if (secret_key !== "evotrainer2026") return res.status(403).json({ error: "Chave secreta inválida." });
  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: "E-mail já em uso." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const master = await prisma.user.create({ data: { name, email, password: hashedPassword, phone, role: 'SUPERADMIN', plano: 'DONO', status: 'Ativo' } });
    res.json({ message: "Conta do Dono (SuperAdmin) criada com sucesso!", master });
  } catch (error) { res.status(400).json({ error: "Erro ao criar Master." }); }
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "E-mail não encontrado." });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); 
    await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetExpires } });

    const resetLink = process.env.NODE_ENV === 'production' 
      ? `https://app.evotrainer.com?token=${resetToken}` 
      : `http://localhost:3000?token=${resetToken}`;
    
    try {
      await transporter.sendMail({
        from: `"EvoTrainer Suporte" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "EvoTrainer - Recuperação de Palavra-Passe",
        html: `<p>Clique no botão abaixo para definir uma nova palavra-passe:</p><a href="${resetLink}">Recuperar Acesso</a>`
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

// ==========================================
// PAINEL SUPERADMIN
// ==========================================
app.get('/api/superadmin/trainers', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const trainers = await prisma.user.findMany({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'desc' }, include: { _count: { select: { alunos: true } } } });
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

// ==========================================
// GESTÃO DE ALUNOS
// ==========================================
app.get('/api/alunos', authenticateToken, isAdmin, async (req, res) => {
  try {
    const alunos = await prisma.user.findMany({ 
      where: { role: 'STUDENT', trainerId: req.user.id }, 
      orderBy: { createdAt: 'desc' }, 
      include: { 
        workouts: { orderBy: { id: 'asc' } }, 
        history: { orderBy: { completedAt: 'desc' }, take: 1 },
        _count: { select: { workouts: true } } 
      } 
    });
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
  } catch (error) { res.status(400).json({ error: "Erro ao criar aluno" }); }
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
  try {
    const updatedUser = await prisma.user.update({ where: { id: targetUserId }, data: req.body });
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

// ==========================================
// GESTÃO DE TREINOS E IA
// ==========================================
app.post('/api/ai/gerar-treino', authenticateToken, isAdmin, async (req, res) => {
  const { alunoId, split, frequencia, prompt, volume, metodologia } = req.body;
  try {
    const trainer = await prisma.user.findUnique({ where: { id: req.user.id } });
    const planoAtual = trainer.plano || 'GRATIS';
    const IA_LIMITS = { 'GRATIS': 0, 'START': 10, 'PRO': 40, 'ELITE': 9999 };

    if (trainer.iaUsadaMes >= (IA_LIMITS[planoAtual] || 0)) {
      return res.status(403).json({ error: `Atingiu o limite de IA do plano ${planoAtual}.` });
    }
    
    const aluno = await prisma.user.findUnique({ where: { id: parseInt(alunoId) } });
    if (!aluno || aluno.trainerId !== req.user.id) return res.status(404).json({ error: "Aluno não encontrado." });

    if (!OPENAI_API_KEY) return res.status(500).json({ error: "Chave da OpenAI não configurada." });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ 
        model: 'gpt-4o-mini', 
        messages: [
          { role: 'system', content: `Crie treinos em JSON: {"fichas": [{"title": "Treino A", "duration": "60 min", "exercises": [{"name": "Supino", "sets": "4x10", "weight": "Moderado", "isConjugado": false, "conjugadoCom": ""}]}]}` }, 
          { role: 'user', content: `Aluno: ${aluno.name}. Divisão: ${split}. Dias: ${frequencia}. Volume: ${volume} ex. Foco: ${prompt}` }
        ], 
        response_format: { type: "json_object" },
        temperature: 0.6
      })
    });

    const data = await response.json();
    const fichas = JSON.parse(data.choices[0].message.content).fichas;
    const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    for (let i = 0; i < parseInt(frequencia); i++) {
      const treinoData = fichas[i % fichas.length];
      
      const exercisesWithVideo = await Promise.all(treinoData.exercises.map(async (ex) => {
        let youtubeId = null;
        try {
          if (YOUTUBE_API_KEY) {
            const ytResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(ex.name + ' execução musculação')}&maxResults=1&type=video&key=${YOUTUBE_API_KEY}`);
            const ytData = await ytResponse.json();
            if (ytData.items && ytData.items.length > 0) youtubeId = ytData.items[0].id.videoId;
          }
        } catch (err) {}
        return { name: ex.name, sets: ex.sets, weight: ex.weight, youtubeId, isConjugado: ex.isConjugado || false, conjugadoCom: ex.conjugadoCom || null };
      }));

      await prisma.workoutTemplate.create({ 
        data: { title: treinoData.title, duration: treinoData.duration, userId: aluno.id, dayOfWeek: dias[i], exercises: { create: exercisesWithVideo } } 
      });
    }

    await prisma.user.update({ where: { id: req.user.id }, data: { iaUsadaMes: trainer.iaUsadaMes + 1 } });
    res.json({ message: "Treino gerado com sucesso!" });
  } catch (error) { res.status(500).json({ error: "Falha na IA." }); }
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

// ESTA ROTA RESOLVE O SEU ERRO 404 NO DELETE DE TREINOS!
app.delete('/api/treinos/:workoutId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const workoutId = parseInt(req.params.workoutId);
    
    const treino = await prisma.workoutTemplate.findUnique({ where: { id: workoutId } });
    if (treino && treino.userId) {
      await prisma.workoutHistory.deleteMany({ 
        where: { userId: treino.userId, workoutName: treino.title } 
      });
    }

    await prisma.exercise.deleteMany({ where: { workoutId: workoutId } });
    await prisma.workoutTemplate.delete({ where: { id: workoutId } });
    
    res.json({ message: "Ficha e feedbacks apagados!" });
  } catch (error) { 
    console.error("Erro ao apagar treino:", error);
    res.status(500).json({ error: "Erro ao apagar a ficha de treino." }); 
  }
});

app.get('/api/treinos/aluno/:id', authenticateToken, async (req, res) => {
  try {
    const treinos = await prisma.workoutTemplate.findMany({ where: { userId: parseInt(req.params.id) }, include: { exercises: true }, orderBy: { id: 'asc' } });
    res.json(treinos);
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.post('/api/treinos/finalizar', authenticateToken, async (req, res) => {
  try {
    const history = await prisma.workoutHistory.create({ data: { userId: req.body.userId, workoutName: req.body.workoutName } });
    const user = await prisma.user.update({ where: { id: req.body.userId }, data: { streak: { increment: 1 }, status: 'Ativo' } });
    res.json({ message: "Sucesso!", novaOfensiva: user.streak, historyId: history.id });
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.post('/api/treinos/feedback', authenticateToken, async (req, res) => {
  try {
    await prisma.workoutHistory.update({
      where: { id: req.body.historyId },
      data: { rating: req.body.rating, comment: req.body.comment }
    });
    res.json({ message: "Feedback salvo com sucesso!" });
  } catch (error) { res.status(500).json({ error: "Erro ao salvar feedback" }); }
});

// ==========================================
// 💸 WEBHOOK ASAAS (SINCRONIZADO)
// ==========================================
app.post('/api/webhooks/asaas', async (req, res) => {
  const { event, payment } = req.body;
  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    const userId = payment.externalReference; 
    const valorPago = Number(payment.value); 
    try {
      const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
      let novoPlano = 'GRATIS'; 
      if (valorPago === Number(config?.elitePrice || 100)) novoPlano = 'ELITE';
      else if (valorPago === Number(config?.proPrice || 60)) novoPlano = 'PRO';
      else if (valorPago === Number(config?.startPrice || 30)) novoPlano = 'START';
      
      if (userId && novoPlano !== 'GRATIS') { 
        await prisma.user.update({ where: { id: parseInt(userId) }, data: { plano: novoPlano } }); 
      }
    } catch (e) { console.error("[ASAAS] Erro no webhook:", e); }
  }
  res.status(200).json({ received: true });
});

// A LIGAÇÃO DA PORTA CORRETA PARA O RENDER!
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Backend EvoTrainer a correr na porta ${PORT}`));