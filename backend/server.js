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

// --- MIDDLEWARES DE SEGURANÇA ---
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
  if (req.user?.role !== 'SUPERADMIN') return res.status(403).json({ error: "Acesso Master negado." });
  next();
};

const isAdminOrMaster = (req, res, next) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPERADMIN') return res.status(403).json({ error: "Restrito." });
  next();
};

// ==========================================
// 💸 AUTOMAÇÃO FINANCEIRA (WEBHOOK ASAAS)
// ==========================================
app.post('/api/webhook/asaas', async (req, res) => {
  try {
    const payload = req.body;
    console.log("🔔 [WEBHOOK ASAAS] Evento recebido:", payload.event);

    if (payload.event === 'PAYMENT_RECEIVED' || payload.event === 'PAYMENT_CONFIRMED') {
      const customerId = payload.payment?.customer;

      if (customerId) {
        const asaasRes = await fetch(`https://api.asaas.com/v3/customers/${customerId}`, {
          method: 'GET',
          headers: { 
            'access_token': process.env.ASAAS_API_KEY || '', 
            'Content-Type': 'application/json'
          }
        });

        if (asaasRes.ok) {
          const customerData = await asaasRes.json();
          const emailPagador = customerData.email;

          if (emailPagador) {
            const vencimento = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); 
            
            const updatedUser = await prisma.user.updateMany({
              where: { email: emailPagador },
              data: { plano: 'PRO', iaUsadaMes: 0, planExpiresAt: vencimento }
            });

            if (updatedUser.count > 0) {
               console.log(`✅ SUCESSO: Conta ${emailPagador} ativada para PRO.`);
            }
          }
        }
      }
    }
    res.status(200).send('Recebido com sucesso');
  } catch (e) {
    console.error('Erro geral no Webhook:', e);
    res.status(500).send('Erro interno no servidor');
  }
});

// --- ROTA PÚBLICA DE REGISTRO E RECUPERAÇÃO ---
app.post('/api/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: "Este e-mail já está cadastrado." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const novoPersonal = await prisma.user.create({
      data: { name, email, phone, password: hashedPassword, role: 'ADMIN', status: 'Ativo', plano: 'GRATIS' }
    });
    res.status(201).json({ message: "Conta criada!", user: { id: novoPersonal.id, email: novoPersonal.email } });
  } catch (e) { res.status(500).json({ error: "Erro interno ao criar a conta." }); }
});

app.post('/api/recover-password', async (req, res) => {
  res.json({ message: "Se o e-mail constar na base, as instruções foram enviadas." });
});

// --- DADOS DO USUÁRIO EM TEMPO REAL ---
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id }, 
      select: { id: true, name: true, email: true, role: true, plano: true, iaUsadaMes: true, planExpiresAt: true } 
    });
    res.json(user);
  } catch (e) { res.status(500).json({ error: "Erro ao buscar dados." }); }
});

// ==========================================
// 🧠 EVOINTELLIGENCE™: ENGINE IA MUNDIAL (PROMPT ATUALIZADO)
// ==========================================
app.post('/api/ai/gerar-autonomo', authenticateToken, isAdminOrMaster, async (req, res) => {
  const { alunoId, comandoPersonal, frequencia, ciclo, semanas } = req.body;
  try {
    const personal = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (personal.role !== 'SUPERADMIN' && personal.plano === 'GRATIS' && personal.iaUsadaMes >= 5) {
       return res.status(403).json({ error: "Você atingiu o limite de 5 treinos do Test Drive. Faça o upgrade para o plano Mensal." });
    }

    const aluno = await prisma.user.findUnique({ where: { id: parseInt(alunoId) } });
    if (!aluno) return res.status(404).json({ error: "Aluno não encontrado." });

    // O NOVO CÉREBRO DA IA: Muito mais restritivo, científico e dinâmico.
    const systemPrompt = `Você é a Engine EvoIntelligence™, o mais avançado sistema de Inteligência Artificial do mundo especializado em biomecânica, fisiologia do exercício e periodização de alta performance. Sua missão é criar um programa de treinamento de nível ELITE, adaptado cientificamente.

DADOS DO ATLETA:
- Nome: ${aluno.name}
- Nível: ${aluno.level}
- Prontuário Clínico / Restrições: ${aluno.anamnese || 'Nenhuma restrição relatada.'}

PARÂMETROS DE PERIODIZAÇÃO:
- Frequência Semanal: ${frequencia} dias. IMPORTANTE: Você DEVE gerar exatamente ${frequencia} fichas de treino distintas. (Ex: Se for 5 dias, gere Ficha A, B, C, D, E).
- Fase do Ciclo: ${ciclo} (Duração: ${semanas} semanas).

DIRETRIZES TÉCNICAS:
1. Ajuste o volume e a intensidade conforme o Nível do aluno. Se for Avançado, aplique métodos como Rest-Pause, Drop-set, Bi-set, RIR (Repetições na Reserva). Se for Iniciante/Reabilitação, foque em volume conservador e cadência.
2. Respeite ABSOLUTAMENTE a biomecânica para evitar agravamento de lesões citadas no prontuário. Substitua exercícios lesivos por opções seguras.
3. Retorne EXATAMENTE e APENAS um objeto JSON válido.
4. A chave "planilha" deve ser um array contendo exatamente ${frequencia} objetos (um para cada dia de treino).

ESTRUTURA JSON OBRIGATÓRIA (Siga este esqueleto, mas crie as fichas até bater o número de dias solicitados):
{
  "planilha": [
    {
      "title": "Ficha A - Peito, Ombro e Tríceps",
      "exercises": [
        {"name": "Supino Inclinado com Halteres", "sets": "4x8-10", "weight": "RIR 2 (Pesado)", "youtubeId": ""}
      ]
    },
    {
      "title": "Ficha B - Costas e Bíceps",
      "exercises": [
        {"name": "Puxada Alta (Focada em Dorsal)", "sets": "3x12", "weight": "Moderado", "youtubeId": ""}
      ]
    }
  ]
}`;

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt }, 
          { role: 'user', content: comandoPersonal }
        ],
        response_format: { type: "json_object" }
      })
    });

    const aiData = await aiRes.json();
    const result = JSON.parse(aiData.choices[0].message.content);

    // O sistema agora vai iterar sobre o array que a IA gerou (Ex: A, B, C, D, E, F)
    const treinosSalvos = [];
    for (const ficha of result.planilha) {
      const novoTreino = await prisma.workoutTemplate.create({
        data: { title: ficha.title, userId: aluno.id, duration: `${semanas} Semanas`, exercises: { create: ficha.exercises } }
      });
      treinosSalvos.push(novoTreino);
    }

    await prisma.user.update({ where: { id: req.user.id }, data: { iaUsadaMes: { increment: 1 } } });
    res.json({ message: "Periodização Elite salva com sucesso!", treinos: treinosSalvos });
  } catch (e) { 
    console.error(e);
    res.status(500).json({ error: "Falha na Engine IA." }); 
  }
});

app.delete('/api/treinos/:id', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    await prisma.workoutTemplate.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Ficha removida." });
  } catch (e) { res.status(500).json({ error: "Erro ao excluir ficha." }); }
});

// --- GESTÃO DE ALUNOS ---
app.post('/api/alunos', authenticateToken, isAdminOrMaster, async (req, res) => {
  const { name, email, phone, weight, height, level, anamnese, price } = req.body;
  try {
    const hashed = await bcrypt.hash("123456", 10);
    const novo = await prisma.user.create({
      data: { name, email, phone, weight, height, level, anamnese, price, password: hashed, role: 'STUDENT', trainerId: req.user.id, status: 'Ativo' }
    });
    res.status(201).json(novo);
  } catch (e) { res.status(400).json({ error: "E-mail duplicado." }); }
});

app.get('/api/alunos', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    const alunos = await prisma.user.findMany({
      where: { trainerId: req.user.id },
      include: { workouts: { include: { exercises: true } }, _count: { select: { workouts: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(alunos);
  } catch (e) { res.status(500).json({ error: "Erro na busca." }); }
});

app.put('/api/alunos/:id', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    const updated = await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: req.body });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: "Erro ao editar." }); }
});

app.delete('/api/alunos/:id', authenticateToken, isAdminOrMaster, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Removido." });
  } catch (e) { res.status(500).json({ error: "Erro ao excluir." }); }
});

// --- GESTÃO MASTER ---
app.get('/api/superadmin/trainers', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const trainers = await prisma.user.findMany({ where: { role: 'ADMIN' }, include: { _count: { select: { alunos: true } } }, orderBy: { createdAt: 'desc' } });
    res.json(trainers);
  } catch (e) { res.status(500).json({ error: "Erro." }); }
});

app.put('/api/superadmin/trainers/:id/plano', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const { plano } = req.body;
    let dataUpdate = { plano };
    if (plano === 'PRO') {
       dataUpdate.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
       dataUpdate.iaUsadaMes = 0;
    } else {
       dataUpdate.planExpiresAt = null;
    }
    const updated = await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: dataUpdate });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: "Erro." }); }
});

app.put('/api/superadmin/trainers/:id', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const updated = await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: { name: req.body.name, email: req.body.email, phone: req.body.phone } });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: "Erro." }); }
});

app.delete('/api/superadmin/trainers/:id', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Personal Removido!" });
  } catch (e) { res.status(500).json({ error: "Erro ao remover personal." }); }
});

// --- LOGIN & SEGURANÇA ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Conta não encontrada." });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid && user.password !== "") return res.status(401).json({ error: "Senha inválida." });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, plano: user.plano, iaUsadaMes: user.iaUsadaMes, planExpiresAt: user.planExpiresAt } });
  } catch (e) { res.status(500).json({ error: "Erro interno no login." }); }
});

app.put('/api/perfil/senha', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Senha atual incorreta." });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: "Senha alterada!" });
  } catch (e) { res.status(500).json({ error: "Erro." }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 EvoCore operante na porta ${PORT}`));