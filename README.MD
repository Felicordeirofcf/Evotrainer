# 🏋️‍♂️ EvoTrainer - Periodização de Elite (SaaS)

O **EvoTrainer** é uma plataforma SaaS (Software as a Service) desenvolvida para Personal Trainers que desejam escalar a sua consultoria online. Utilizando Inteligência Artificial (Engine Biomecânica), a plataforma automatiza a criação de periodizações, gestão de alunos e controlo financeiro.

---

## 🚀 Novidades e Melhorias da Versão Final (v1.0.0)

Abaixo está o registo de todas as atualizações (Changelog) implementadas na versão final do sistema:

### 🤖 1. Engine de IA Biomecânica (EvoIntelligence™)
* **Volume Inteligente:** O prompt do sistema foi reescrito para impedir "treinos curtos". A IA agora gera obrigatoriamente de **6 a 9 exercícios** por sessão, garantindo um volume eficiente.
* **Perceção de Esforço (RIR):** A IA agora sugere cargas baseadas no nível do aluno, utilizando métodos como RIR (Reps in Reserve) ou esforço percebido.
* **Respeito ao Prontuário:** Integração direta das restrições médicas do aluno (`anamnese`) no algoritmo de geração do treino.

### 📝 2. Edição Manual de Planilhas (Flexibilidade)
* **Novo Modal de Edição:** Adicionado o botão de edição (âmbar) no Dossiê do Aluno. O Personal pode agora editar o título, alterar as semanas de duração e fazer microajustes em qualquer exercício.
* **Gestão de Exercícios:** Possibilidade de adicionar novas linhas de exercícios, remover existentes ou editar Séries/Cargas manualmente após a geração pela IA.
* **Sincronização com o Banco de Dados:** Backend atualizado (`PUT /api/treinos/:id`) para limpar e recriar a lista de exercícios no banco (Prisma `workoutTemplate`), garantindo dados sempre consistentes.

### 📄 3. Exportação de PDF Otimizada
* **Nomenclatura Automática:** O ficheiro PDF baixado agora assume inteligentemente o nome `EvoTrainer_NomeDoAluno_NomeDaFicha.pdf` em vez de um ficheiro sem nome genérico.
* **Retorno ao Sistema:** Criada uma "Barra de Navegação Não Imprimível" no topo da janela de impressão, com botões para "Voltar para o EvoTrainer", evitando que o Personal fique preso na aba do navegador.
* **Links de Vídeo Corrigidos:** Simplificação do CSS no PDF para garantir que os botões de "VÍDEO 🎬" sejam sempre reconhecidos como hiperligações ativas por qualquer leitor de PDF.

### 💬 4. Fluxo de WhatsApp Inteligente
* **Texto Polido:** Mensagem pré-programada atualizada para informar ao aluno que o PDF da ficha será enviado logo a seguir ("Estou enviando o seu PDF logo abaixo!").
* **Correção de Caracteres Quebrados:** Remoção de emojis específicos da string de URL (`encodeURIComponent`) para evitar o "bug do losango preto" em dispositivos móveis na hora de abrir a aplicação do WhatsApp.

### 📧 5. Automação de E-mails de Registo
* **Nodemailer Integrado:** Sempre que um novo Personal Trainer se regista, o sistema envia automaticamente um e-mail de boas-vindas com o design da marca EvoTrainer.
* **Integração Hostinger SMTP:** Conexão segura utilizando variáveis de ambiente via porta 465 (SSL/TLS).

### 📱 6. PWA e Mobile-First (Incentivo de Instalação)
* **Manifest.json Adicionado:** O sistema agora é reconhecido como uma Aplicação Web Progressiva (PWA).
* **Banner de Instalação Smart:** Implementação de uma barra de aviso azul dinâmica que deteta se o utilizador está num telemóvel e fora do modo "app". Ensina proativamente o Personal Trainer a adicionar o sistema ao Ecrã Principal do telemóvel para melhorar a retenção.

### 👑 7. Painel Master (SuperAdmin)
* **Contador de Alunos Ativos:** O painel do administrador principal agora lê diretamente da base de dados (`_count.alunos`) e exibe visualmente quantos alunos cada Personal Trainer cadastrou, facilitando a análise de engajamento dos clientes.

### 🔒 8. Conformidade Legal e Anúncios (Google Ads)
* **Página de Política de Privacidade (`/privacidade`):** Rota criada com os termos de recolha de dados e tratamento via IA e Asaas, essencial para a aprovação de campanhas e captação de Leads no Google Ads.

---

## 🛠️ Stack Tecnológica

* **Front-end:** React.js, Next.js, Tailwind CSS, Lucide React (Ícones).
* **Back-end:** Node.js, Express.js.
* **Base de Dados:** Prisma ORM, PostgreSQL.
* **Autenticação:** JWT (JSON Web Tokens), Bcryptjs.
* **Integrações Externas:** * OpenAI API (GPT-4o-mini) para geração de treinos.
  * Asaas API para gateway de pagamentos PIX/Cartão.
  * Nodemailer para automação de e-mails SMTP.
  * Meta Pixel & Google Ads (Eventos e Captação de Leads).

---

## ⚙️ Variáveis de Ambiente Necessárias (.env)

Para que o projeto funcione a 100% em produção (Render/Vercel), certifique-se de configurar as seguintes chaves no seu servidor:

### No Back-end (Render):
```env
PORT=3001
DATABASE_URL="postgres://user:password@host:port/database"
JWT_SECRET="sua-chave-secreta-jwt"
OPENAI_API_KEY="sk-sua-chave-openai"
ASAAS_API_KEY="sua-chave-api-do-asaas"
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=465
SMTP_USER="adminevotrainer@evotrainer.com.br"
SMTP_PASS="senha-do-seu-email"
