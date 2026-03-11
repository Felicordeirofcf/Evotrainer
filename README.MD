🚀 EvoTrainer SaaS - Sistema de Gestão de Consultoria Fitness com IA

O EvoTrainer é uma plataforma SaaS (Software as a Service) completa, desenvolvida para transformar Personal Trainers em empresas de alta produtividade. O sistema utiliza Inteligência Artificial para automatizar a criação de treinos, oferece uma experiência de App nativo para o aluno (PWA) e permite a monetização automática via assinaturas.

📋 Sumário

Funcionalidades Principais

Arquitetura de Níveis de Acesso

Stack Tecnológica

Instalação e Configuração

Variáveis de Ambiente

White Label (Plano Elite)

Integração de Pagamentos (Asaas)

Estrutura do Projeto

✨ Funcionalidades Principais

🧠 Inteligência Artificial (Mágico de IA)

Geração automática de fichas de treino periodizadas baseadas no perfil, objetivo e restrições clínicas do aluno.

Integração com a API da OpenAI (GPT-4o-mini).

Limites de uso automáticos baseados no plano contratado pelo Personal.

📺 Biblioteca de Vídeos Inteligente

Busca automática de vídeos de execução no YouTube para cada exercício gerado.

Reprodutor de vídeo embutido no sistema para que o aluno não precise sair do App.

Plano de contingência (busca manual via link) caso a API do YouTube falhe.

📱 Experiência do Aluno (PWA)

Aplicação instalável no smartphone (Progressive Web App).

Modo Foco: Interface otimizada para ser usada durante o treino, com cronómetro e check-list.

Gamificação: Sistema de ofensiva (Streak/Foguinhos) para incentivar a constância.

📄 Exportação Premium

Geração nativa de PDFs com design minimalista.

Botões interativos de "Assistir Vídeo" dentro do próprio PDF.

Envio direto para o WhatsApp do aluno com mensagem formatada.

👤 Arquitetura de Níveis de Acesso

O sistema divide-se em três pilares:

SUPERADMIN (Dono): Acesso ao Painel Master para gerir todos os Personal Trainers, alterar planos manualmente e limpar a base de dados.

ADMIN (Personal Trainer): Painel de gestão de alunos, criação de treinos (manual ou IA), gestão de marca (White Label) e assinatura.

STUDENT (Aluno): Interface simplificada e focada na execução dos treinos recebidos.

🛠 Stack Tecnológica

Frontend: Next.js 14, React, Tailwind CSS, Lucide React (Ícones).

Backend: Node.js, Express.

ORM: Prisma (PostgreSQL).

Base de Dados: PostgreSQL (Hospedado no Neon.tech).

Autenticação: JWT (JSON Web Tokens) e Bcrypt.js.

E-mail: Nodemailer (SMTP).

📦 Instalação e Configuração

1. Clonar o Repositório

git clone [https://github.com/seu-usuario/evotrainer.git](https://github.com/seu-usuario/evotrainer.git)
cd evotrainer


2. Configurar o Backend

cd backend
npm install
npx prisma db push # Sincroniza a base de dados
node server.js


3. Configurar o Frontend

cd frontend
npm install
npm run dev


🔑 Variáveis de Ambiente

Crie um ficheiro .env na pasta backend com as seguintes chaves:

# Banco de Dados (Neon.tech)
DATABASE_URL="postgresql://user:pass@host/neondb?sslmode=require"

# Segurança
JWT_SECRET="sua_chave_secreta_super_forte"

# APIs Externas
OPENAI_API_KEY="sk-..."
YOUTUBE_API_KEY="AIza..."

# E-mail (Recuperação de Senha)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"


🎨 White Label (Plano Elite)

O sistema permite que o Personal Trainer Elite tenha a sua própria "App".

Link Personalizado: O Personal envia o link app.evotrainer.com/?t=ID.

Injeção Dinâmica: O frontend deteta o trainerId na URL e carrega o logótipo e a cor principal do Personal antes mesmo do login.

Personalização: O Personal altera as cores e o logótipo diretamente no seu perfil.

💳 Integração de Pagamentos (Asaas)

A monetização é feita através de Webhooks do Asaas:

O Personal clica em upgrade e é levado para o link de checkout.

O link carrega o ID do utilizador no campo externalReference.

Após o pagamento, o Asaas envia um POST para /api/webhooks/asaas.

O servidor identifica o valor e atualiza automaticamente o plano:

R$ 30: Plano START (Bronze)

R$ 60: Plano PRO (Prata)

R$ 100: Plano ELITE (Ouro)

🛡️ Criar Conta Master (Dono)

Para ter acesso ao painel Master, clique no ícone de escudo no ecrã de login e use a chave secreta:

Secret Key: evotrainer2026

📄 Licença

Propriedade de EvoTrainer Master. Todos os direitos reservados.
