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
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.SMTP_USER, // Coloque o seu e-mail Gmail no .env do Render
    pass: process.env.SMTP_PASS, // Coloque a Senha de App de 16 dígitos no .env do Render
  },
});

// ==========================================
// INTEGRAÇÃO EVOLUTION API (WHATSAPP)
// ==========================================
const enviarWhatsAppBoasVindas = async (telefone, nomePersonal) => {
  try {
    const evolutionUrl = process.env.EVOLUTION_API_URL; // ex: https://sua-api-evolution.com
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME; // ex: EvoBot
    const apiKey = process.env.EVOLUTION_API_KEY; // Chave global da Evolution

    // Se as variáveis não estiverem configuradas, não faz nada (evita dar erro se ainda não tiver a Evolution ativa)
    if (!evolutionUrl || !instanceName || !apiKey || !telefone) return;

    // Limpar o número (manter só os dígitos)
    let number = telefone.replace(/\D/g, '');
    if (!number.startsWith('55')) number = '55' + number; // Assume Brasil se não tiver DDI

    const mensagem = `Olá, *${nomePersonal.split(' ')[0]}*! 🚀\n\nBem-vindo(a) ao *EvoTrainer*! Sou o assistente virtual do CEO e vi que acabou de criar a sua conta.\n\nPara começar a escalar a sua consultoria, o seu primeiro passo é aceder ao painel e adicionar o seu primeiro aluno na aba 'Alunos'.\nDepois, use a Inteligência Artificial para gerar o treino em 10 segundos.\n\nQualquer dúvida, é só responder a esta mensagem. Bora esmagar! 🔥`;

    await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: number,
        options: { delay: 2500, presence: 'composing' }, // Fica "a escrever..." por 2.5s para parecer humano
        textMessage: { text: mensagem }
      })
    });
    console.log(`[EVOLUTION] Mensagem de boas-vindas enviada para ${telefone}`);
  } catch (error) {
    console.error("[EVOLUTION] Erro ao enviar WhatsApp:", error.message);
  }
};

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

// ROTAS DE RECUPERAÇÃO DE SENHA (COM GMAIL)
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "E-mail não encontrado." });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); 

    await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetExpires } });

    // Troque pelo domínio real do seu App em produção
    const resetLink = process.env.NODE_ENV === 'production' 
      ? `https://app.evotrainer.com?token=${resetToken}` 
      : `http://localhost:3000?token=${resetToken}`;
    
    try {
      await transporter.sendMail({
        from: `"EvoTrainer Suporte" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "EvoTrainer - Recuperação de Palavra-Passe",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background: #020617; color: white; border-radius: 10px;">
            <h2 style="color: #3b82f6;">EvoTrainer</h2>
            <p>Recebemos um pedido para recuperar a palavra-passe da sua conta.</p>
            <p>Clique no botão abaixo para definir uma nova palavra-passe:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; font-weight: bold; border-radius: 6px; margin: 20px 0;">Recuperar Acesso</a>
            <p style="color: #94a3b8; font-size: 12px;">Se não fez este pedido, ignore este e-mail.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error("Erro ao enviar e-mail. Verifique SMTP_USER e SMTP_PASS.", emailError);
    }

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

// REGISTO DE PERSONAL TRAINER (AGORA COM AVISO POR E-MAIL E LINK WHATSAPP PRONTO)
app.post('/api/register', async (req, res) => {
  const { name, email, password, phone, role, plano } = req.body;
  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: "Este e-mail já está registado." });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ 
      data: { name, email, password: hashedPassword, phone, role, plano, status: 'Ativo' } 
    });
    
    // ENVIAR E-MAIL DE ALERTA PARA O DONO DO SISTEMA
    if (role === 'ADMIN') {
      try {
        const primeiroNome = name.split(' ')[0];
        const waText = encodeURIComponent(`Olá, ${primeiroNome}! Vi que você acabou de criar sua conta no EvoTrainer. Como posso te ajudar a escalar sua consultoria hoje?`);
        const waLink = `https://wa.me/${phone ? phone.replace(/\D/g, '') : ''}?text=${waText}`;

        await transporter.sendMail({
          from: `"EvoTrainer Alertas" <${process.env.SMTP_USER}>`,
          to: process.env.SMTP_USER, // Envia para o próprio e-mail configurado (o seu)
          subject: "🎉 NOVO CLIENTE REGISTADO - EvoTrainer!",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8fafc; color: #0f172a; border-radius: 8px;">
              <h2 style="color: #2563eb; margin-top: 0;">Temos um novo Personal Trainer!</h2>
              <p style="font-size: 16px;">Acabou de ser criada uma nova conta no sistema. Entre em contacto para fazer o onboarding!</p>
              <div style="background: #ffffff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
                <p><strong>👤 Nome:</strong> ${name}</p>
                <p><strong>📧 E-mail:</strong> ${email}</p>
                <p><strong>📱 WhatsApp:</strong> ${phone || 'Não fornecido'}</p>
              </div>
              <p style="margin-top: 20px;">
                <a href="${waLink}" style="background: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Chamar no WhatsApp
                </a>
              </p>
            </div>
          `
        });
        console.log(`[ALERTA] Email de novo registo enviado para ${process.env.SMTP_USER}`);
      } catch (emailError) {
        console.error("[ERRO] Falha ao enviar aviso de novo registo:", emailError);
      }
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ message: "Conta criada com sucesso!", token, user: userWithoutPassword });
  } catch (error) { res.status(500).json({ error: "Erro ao criar conta." }); }
});

// CRIAR CONTA MASTER
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

// ==========================================
// RESTO DAS ROTAS (MANUTENÇÃO, IA, TREINOS)
// ==========================================

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

// TREINO INTELIGENTE IA
app.post('/api/ai/gerar-treino', authenticateToken, isAdmin, async (req, res) => {
  const { alunoId, split, frequencia, prompt, volume, metodologia } = req.body;
  try {
    const trainer = await prisma.user.findUnique({ where: { id: req.user.id } });
    const planoAtual = trainer.plano || 'GRATIS';
    const IA_LIMITS = { 'GRATIS': 0, 'START': 10, 'PRO': 40, 'ELITE': 9999 };
    const limitePermitido = IA_LIMITS[planoAtual] || 0;

    if (trainer.iaUsadaMes >= limitePermitido) {
      return res.status(403).json({ error: `Atingiu o limite de IA do plano ${planoAtual}.` });
    }
    
    const aluno = await prisma.user.findUnique({ where: { id: parseInt(alunoId) } });
    if (!aluno || aluno.trainerId !== req.user.id) return res.status(404).json({ error: "Aluno não encontrado." });

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "Chave da OpenAI não está configurada no backend." });
    }

    const systemPrompt = `Você é um Personal Trainer de Elite, Especialista em Fisiologia do Exercício, Cinesiologia, Biomecânica e Periodização. Sua missão é montar fichas de treino que entregam resultados reais e seguros no "chão de fábrica" das academias.

DIRETRIZES TÉCNICAS OBRIGATÓRIAS:
1. Nomenclatura Comercial: Use APENAS os nomes tradicionais e populares dos exercícios no Brasil (ex: "Supino Reto com Halteres", "Cadeira Extensora", "Remada Curvada", "Tríceps Testa", "Elevação Pélvica"). NÃO use jargões anatômicos confusos.
2. Controle de Intensidade e Carga: No campo "sets", especifique séries, repetições, RIR (Repetições na Reserva) ou RPE. No campo "weight", sugira a dinâmica de carga e o tempo de intervalo anatômico exato.
3. Segurança Biomecânica: Se houver restrição clínica ou dor descrita, adapte os exercícios para preservar as articulações afetadas.
4. Conjugados (Bi-sets): Marque 'isConjugado: true' APENAS quando a metodologia instruir a fazer Bi-sets/Super-sets e preencha 'conjugadoCom' com o nome exato do parceiro.

FORMATO DE SAÍDA ESTRITO (RETORNE APENAS JSON VÁLIDO, SEM MARKDOWN OU OUTRO TEXTO):
{
  "fichas": [
    {
      "title": "Treino A - [Foco Muscular]",
      "duration": "Ex: 60 min",
      "exercises": [
        {
          "name": "Nome Comercial do Exercício",
          "sets": "Ex: 3x 8-12 (RIR 1-2)",
          "weight": "Ex: Progressão | 90s",
          "isConjugado": false,
          "conjugadoCom": ""
        }
      ]
    }
  ]
}`;

    const userPrompt = `Monte o treinamento para o aluno ${aluno.name}.

PARÂMETROS ESTRUTURAIS DO TREINO:
- Divisão Solicitada: ${split} (Crie exatamente a quantidade de fichas necessárias para este ciclo, ex: 3 fichas para ABC).
- Frequência na Semana: ${frequencia} dias.
- Volume por Ficha: Exatamente ${volume || 7} exercícios por cada dia de treino.
- Metodologia/Técnica Principal: ${metodologia || 'Tradicional'}. Aplique esta técnica em exercícios base ou isoladores de cada ficha, adaptando a prescrição de séries e repetições de acordo com a regra da metodologia.

PERFIL E CONTEXTO CLÍNICO:
${prompt}

Crie o JSON rigorosamente dentro destes parâmetros e respeitando o volume exato de exercícios.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ 
        model: 'gpt-4o-mini', 
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], 
        response_format: { type: "json_object" },
        temperature: 0.6
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: `Erro na OpenAI: ${data.error.message}` });
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ error: "Resposta inesperada da IA." });
    }

    let conteudoIA;
    try {
      conteudoIA = JSON.parse(data.choices[0].message.content);
    } catch (parseErr) {
      return res.status(500).json({ error: "A IA não retornou um formato de dados válido (JSON)." });
    }

    const fichas = conteudoIA.fichas;
    if (!fichas || !Array.isArray(fichas) || fichas.length === 0) {
       return res.status(500).json({ error: "A IA não conseguiu criar nenhuma ficha de treino." });
    }

    const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    for (let i = 0; i < parseInt(frequencia); i++) {
      const treinoData = fichas[i % fichas.length];
      
      const exercisesWithVideo = await Promise.all(treinoData.exercises.map(async (ex) => {
        let youtubeId = null;
        try {
          if (YOUTUBE_API_KEY) {
            const termoBusca = encodeURIComponent(`${ex.name} execução correta musculação`);
            const ytResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${termoBusca}&maxResults=1&type=video&key=${YOUTUBE_API_KEY}`);
            const ytData = await ytResponse.json();
            if (ytData.items && ytData.items.length > 0) youtubeId = ytData.items[0].id.videoId;
          }
        } catch (err) {}
        
        return { 
          name: ex.name || "Exercício", 
          sets: ex.sets || "3x10", 
          weight: ex.weight || "Moderada", 
          youtubeId, 
          isConjugado: ex.isConjugado || false, 
          conjugadoCom: ex.conjugadoCom || null 
        };
      }));

      await prisma.workoutTemplate.create({ 
        data: { 
          title: treinoData.title || `Treino ${i+1}`, 
          duration: treinoData.duration || "60 min", 
          userId: aluno.id, 
          dayOfWeek: dias[i], 
          exercises: { create: exercisesWithVideo } 
        } 
      });
    }

    await prisma.user.update({ where: { id: req.user.id }, data: { iaUsadaMes: trainer.iaUsadaMes + 1 } });
    res.json({ message: "Treino gerado com sucesso!" });
  } catch (error) { 
    res.status(500).json({ error: "Falha interna no servidor ao processar a Inteligência Artificial." }); 
  }
});

app.get('/api/alunos', authenticateToken, isAdmin, async (req, res) => {
  try {
    const alunos = await prisma.user.findMany({ 
      where: { role: 'STUDENT', trainerId: req.user.id }, 
      orderBy: { createdAt: 'desc' }, 
      include: { 
        workouts: { orderBy: { id: 'asc' } }, 
        history: { orderBy: { completedAt: 'desc' }, take: 1 }, // Traz o último feedback
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
    const history = await prisma.workoutHistory.create({ data: { userId: req.body.userId, workoutName: req.body.workoutName } });
    const user = await prisma.user.update({ where: { id: req.body.userId }, data: { streak: { increment: 1 }, status: 'Ativo' } });
    res.json({ message: "Sucesso!", novaOfensiva: user.streak, historyId: history.id });
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.post('/api/treinos/feedback', authenticateToken, async (req, res) => {
  const { historyId, rating, comment } = req.body;
  try {
    await prisma.workoutHistory.update({
      where: { id: historyId },
      data: { rating, comment }
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
      // O Webhook agora lê o preço que o Dono configurou no painel!
      const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
      
      let novoPlano = 'PRO'; 
      if (valorPago === Number(config?.startPrice || 30)) novoPlano = 'START';
      else if (valorPago === Number(config?.proPrice || 60)) novoPlano = 'PRO';
      else if (valorPago === Number(config?.elitePrice || 100)) novoPlano = 'ELITE';
      
      if (userId) { 
        await prisma.user.update({ where: { id: parseInt(userId) }, data: { plano: novoPlano } }); 
      }
    } catch (e) { console.error("Erro no Webhook", e); }
  }
  res.status(200).json({ received: true });
});

app.listen(3001, () => console.log('🚀 Backend a correr na porta 3001'));