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
// INTEGRAÇÃO EVOLUTION API (WHATSAPP PARA O DONO)
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
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Acesso restrito." });
  next();
};

const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPERADMIN') return res.status(403).json({ error: "Acesso exclusivo." });
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
        data: { id: 1, startPrice: "30", startLink: "", proPrice: "60", proLink: "", elitePrice: "100", eliteLink: "" }
      });
    }
    res.json(config);
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.put('/api/config', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const config = await prisma.systemConfig.update({ where: { id: 1 }, data: req.body });
    res.json({ message: "Atualizado!", config });
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

// ==========================================
// ROTA WHITE LABEL & LOGIN
// ==========================================
app.get('/api/brand/:trainerId', async (req, res) => {
  try {
    const trainer = await prisma.user.findUnique({ where: { id: parseInt(req.params.trainerId) } });
    if (!trainer) return res.status(404).json({ error: "Não encontrado." });
    if (trainer.plano !== 'ELITE') return res.json({ name: "EvoTrainer", color: "#2563eb", logo: null });
    res.json({ name: trainer.brandName || trainer.name, color: trainer.brandColor || "#2563eb", logo: trainer.brandLogo || null });
  } catch (e) { res.status(500).json({ error: "Erro" }); }
});

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
      if (trainer && trainer.plano === 'ELITE') userBrand = { name: trainer.brandName, color: trainer.brandColor, logo: trainer.brandLogo };
    } else if (user.role === 'ADMIN' && user.plano === 'ELITE') {
      userBrand = { name: user.brandName, color: user.brandColor, logo: user.brandLogo };
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword, brand: userBrand });
  } catch (error) { res.status(500).json({ error: "Erro." }); }
});

// ==========================================
// REGISTO DE PERSONAL E E-MAILS
// ==========================================
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
      const pNome = name.split(' ')[0];
      const waLink = `https://wa.me/${phone ? phone.replace(/\D/g, '') : ''}?text=Olá, ${pNome}! Vi que criou conta no EvoTrainer.`;
      try {
        await transporter.sendMail({
          from: `"EvoTrainer Alertas" <${process.env.SMTP_USER}>`,
          to: process.env.SMTP_USER,
          subject: "🎉 NOVO PERSONAL REGISTADO!",
          html: `<p>Novo Personal: ${name} (${email})</p><a href="${waLink}">Chamar no WhatsApp</a>`
        });
      } catch (e) {}

      try {
        await transporter.sendMail({
          from: `"EvoTrainer" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Bem-vindo ao seu novo painel de gestão! 🚀",
          html: `
            <div style="font-family: Arial; padding: 20px; background: #0f172a; color: #fff; border-radius: 12px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3b82f6;">Olá, ${pNome}! Tudo pronto para escalar.</h2>
              <p style="color: #cbd5e1;">A sua conta de Personal Trainer foi criada com sucesso.</p>
              <p style="color: #cbd5e1;">O seu próximo passo é aceder ao sistema, cadastrar o seu primeiro aluno e testar o nosso Mágico de IA.</p>
              <a href="https://evotrainer.com.br" style="display:inline-block; padding: 15px 25px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Acessar Meu Painel</a>
            </div>
          `
        });
      } catch (e) {}

      enviarWhatsAppBoasVindas(phone, name);
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
// ⚠️ E-MAIL DE RECUPERAÇÃO DE SENHA (CORRIGIDO E LOGADO)
// ==========================================
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "E-mail não encontrado." });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); 
    await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetExpires } });

    const resetLink = `https://evotrainer.com.br?token=${resetToken}`;
    
    try {
      await transporter.sendMail({
        from: `"EvoTrainer Suporte" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Recuperação de Palavra-Passe - EvoTrainer",
        html: `
          <div style="font-family: Arial; padding: 20px; background: #f8fafc; color: #0f172a; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0;">
            <h2 style="color: #2563eb;">EvoTrainer</h2>
            <p>Recebemos um pedido para recuperar a palavra-passe da sua conta.</p>
            <p>Clique no botão abaixo para criar uma nova senha de acesso seguro:</p>
            <a href="${resetLink}" style="display:inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Recuperar Minha Conta</a>
            <p style="color: #64748b; font-size: 11px; margin-top: 30px;">Se não pediu esta recuperação, ignore este e-mail. O link expira em 1 hora.</p>
          </div>
        `
      });
      console.log(`[SMTP] E-mail de recuperação enviado com sucesso para: ${user.email}`);
    } catch (e) {
      console.error("[ERRO SMTP] Falha gravíssima ao enviar e-mail de recuperação:", e);
    }

    res.json({ message: "Se o e-mail existir, receberá um link de recuperação." });
  } catch (error) { 
    console.error("[ERRO ROTA] Falha na rota forgot-password:", error);
    res.status(500).json({ error: "Erro interno no servidor." }); 
  }
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
// GESTÃO DE ALUNOS E TREINOS
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

app.get('/api/alunos', authenticateToken, isAdmin, async (req, res) => {
  try {
    const alunos = await prisma.user.findMany({ 
      where: { role: 'STUDENT', trainerId: req.user.id }, 
      orderBy: { createdAt: 'desc' }, 
      include: { workouts: { orderBy: { id: 'asc' } }, history: { orderBy: { completedAt: 'desc' }, take: 1 }, _count: { select: { workouts: true } } } 
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

    const plainPassword = password || "123456";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const novo = await prisma.user.create({ data: { name, email, password: hashedPassword, phone, role: 'STUDENT', status: 'Novo', streak: 0, trainerId: req.user.id } });
    
    try {
      const nomeApp = trainerInfo.plano === 'ELITE' && trainerInfo.brandName ? trainerInfo.brandName : 'EvoTrainer';
      const linkApp = trainerInfo.plano === 'ELITE' ? `https://evotrainer.com.br/?t=${trainerInfo.id}` : `https://evotrainer.com.br`;

      await transporter.sendMail({
        from: `"${nomeApp} via EvoTrainer" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "📲 A sua app de treinos está pronta!",
        html: `
          <div style="font-family: Arial; padding: 20px; background: #f8fafc; color: #0f172a; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0;">
            <h2 style="color: #2563eb;">Olá, ${name.split(' ')[0]}!</h2>
            <p>O seu treinador <strong>${trainerInfo.name}</strong> acaba de configurar o seu acesso à aplicação de treinos.</p>
            <div style="background: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <p style="margin: 5px 0;"><strong>Acesso:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Senha Inicial:</strong> ${plainPassword}</p>
            </div>
            <p>Aceda ao link abaixo (pode instalar no ecrã principal do seu telemóvel para acesso rápido):</p>
            <a href="${linkApp}" style="display:inline-block; padding: 15px 25px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Abrir Aplicação</a>
          </div>
        `
      });
    } catch (emailErr) { console.error("Erro email aluno", emailErr); }

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

app.post('/api/ai/gerar-treino', authenticateToken, isAdmin, async (req, res) => {
  const { alunoId, split, frequencia, prompt, volume, metodologia } = req.body;
  try {
    const trainer = await prisma.user.findUnique({ where: { id: req.user.id } });
    const IA_LIMITS = { 'GRATIS': 0, 'START': 10, 'PRO': 40, 'ELITE': 9999 };
    if (trainer.iaUsadaMes >= (IA_LIMITS[trainer.plano || 'GRATIS'] || 0)) {
      return res.status(403).json({ error: `Atingiu o limite de IA do seu plano.` });
    }
    const aluno = await prisma.user.findUnique({ where: { id: parseInt(alunoId) } });
    if (!aluno || aluno.trainerId !== req.user.id) return res.status(404).json({ error: "Aluno não encontrado." });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ 
        model: 'gpt-4o-mini', 
        messages: [{ role: 'system', content: 'Crie treinos JSON estruturados...' }, { role: 'user', content: `Treino para ${aluno.name}...` }], 
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
    const workoutId = parseInt(req.params.workoutId);
    const treino = await prisma.workoutTemplate.findUnique({ where: { id: workoutId } });
    if (treino && treino.userId) {
      await prisma.workoutHistory.deleteMany({ where: { userId: treino.userId, workoutName: treino.title } });
    }
    await prisma.exercise.deleteMany({ where: { workoutId: workoutId } });
    await prisma.workoutTemplate.delete({ where: { id: workoutId } });
    res.json({ message: "Ficha apagada!" });
  } catch (error) { res.status(500).json({ error: "Erro ao apagar a ficha." }); }
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Backend EvoTrainer a correr na porta ${PORT}`));