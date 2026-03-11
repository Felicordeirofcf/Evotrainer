'use client';

import React, { useState } from 'react';
import { 
  Dumbbell, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Youtube, 
  MessageSquare, 
  Play,
  Menu,
  X,
  ShieldCheck,
  Zap,
  HelpCircle,
  Smartphone
} from 'lucide-react';

// ==========================================
// 🚀 COMPONENTES DA LANDING PAGE
// ==========================================

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const appUrl = "https://evotrainer.vercel.app";

  return (
    <nav className="fixed top-0 w-full z-[100] bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Dumbbell className="text-white" size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">EVO<span className="text-blue-500">TRAINER</span></span>
        </div>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#funcionalidades" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Funcionalidades</a>
          <a href="#como-funciona" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Como Funciona</a>
          <a href="#precos" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Planos</a>
          <a href={appUrl} className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all">Acessar o App</a>
          <a href={appUrl} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all">Começar Agora</a>
        </div>

        {/* Menu Mobile Trigger */}
        <button className="md:hidden text-slate-400" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-6 flex flex-col gap-4 animate-fade-in">
          <a href="#funcionalidades" className="text-lg font-bold text-slate-300">Funcionalidades</a>
          <a href="#como-funciona" className="text-lg font-bold text-slate-300">Como Funciona</a>
          <a href="#precos" className="text-lg font-bold text-slate-300">Planos</a>
          <hr className="border-slate-800" />
          <a href={appUrl} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-center">ACESSAR O APP</a>
          <a href={appUrl} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-center block">COMEÇAR GRÁTIS</a>
        </div>
      )}
    </nav>
  );
};

const PlanCard = ({ title, price, students, iaCalls, features, highlighted = false }: any) => {
  const appUrl = "https://evotrainer.vercel.app";

  return (
    <div className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 hover:translate-y-[-10px] flex flex-col h-full ${highlighted ? 'bg-slate-900 border-blue-500 shadow-2xl shadow-blue-500/10' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Mais Popular</div>
      )}
      <div className="mb-8">
        <h3 className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">{title}</h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-black text-white">R$ {price}</span>
          <span className="text-slate-500 font-bold text-sm">/mês</span>
        </div>
      </div>
      
      <div className="space-y-4 mb-8 flex-1">
        <div className="flex items-center gap-3">
          <Users size={18} className="text-blue-500" />
          <span className="text-slate-300 font-medium text-sm">{students}</span>
        </div>
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-indigo-400" />
          <span className="text-slate-300 font-medium text-sm">{iaCalls}</span>
        </div>
        {features.map((f: string, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <span className="text-slate-400 text-sm">{f}</span>
          </div>
        ))}
      </div>

      <a href={appUrl} className={`w-full py-4 rounded-2xl font-black text-center text-sm uppercase tracking-widest transition-all ${highlighted ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
        {price === "0" ? "Começar Grátis" : "Assinar Plano"}
      </a>
    </div>
  );
};

export default function LandingPage() {
  const irParaWhatsApp = () => {
    const msg = encodeURIComponent("Olá! Vim pelo site EvoTrainer e gostaria de saber mais sobre sua consultoria de treino personalizada.");
    window.open(`https://wa.me/5521987708652?text=${msg}`, '_blank');
  };

  const appUrl = "https://evotrainer.vercel.app";

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30">
      <Navbar />

      {/* SEÇÃO HERO */}
      <section className="pt-40 pb-20 px-6 overflow-hidden relative">
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-full mb-8 animate-fade-in">
            <Sparkles size={16} className="text-blue-500" />
            <span className="text-[10px] md:text-xs font-black text-blue-400 uppercase tracking-widest">Tecnologia master para personais</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-white leading-[1.1] tracking-tighter mb-8">
            Escale sua consultoria <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">com inteligência.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium mb-12 leading-relaxed">
            Esqueça as planilhas manuais. Use Inteligência Artificial Master para criar fichas perfeitas e vídeos de execução em segundos.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <a 
              href={appUrl}
              className="w-full md:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              CRIAR MINHA CONTA <ArrowRight size={20}/>
            </a>
            <button 
              onClick={irParaWhatsApp}
              className="w-full md:w-auto bg-slate-900 border border-slate-800 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-all"
            >
              FALAR COM ESPECIALISTA
            </button>
          </div>
        </div>

        {/* Mockup Preview */}
        <div className="max-w-5xl mx-auto mt-20 relative px-4">
           <div className="bg-slate-800 p-2 rounded-[2rem] shadow-3xl border border-slate-700/50">
             <div className="bg-slate-950 rounded-[1.5rem] aspect-video md:aspect-[21/9] flex items-center justify-center relative overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" 
                  alt="Pré-visualização da Interface" 
                  className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="absolute flex flex-col items-center gap-4">
                   <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                     <Play fill="white" size={24} className="ml-1" />
                   </div>
                   <p className="text-white font-black text-xs uppercase tracking-widest text-center">A produtividade que <br/> faltava no seu dia</p>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* SEÇÃO COMO FUNCIONA */}
      <section id="como-funciona" className="py-24 px-6 relative border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Como funciona?</h2>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.3em]">Três passos para o sucesso</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-blue-500 font-black text-2xl mx-auto mb-6 border border-slate-800 shadow-xl">1</div>
              <h3 className="text-xl font-black text-white mb-3">Registe-se</h3>
              <p className="text-slate-500 text-sm">Crie a sua conta de Personal e adicione os seus primeiros alunos em segundos.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-blue-500 font-black text-2xl mx-auto mb-6 border border-slate-800 shadow-xl">2</div>
              <h3 className="text-xl font-black text-white mb-3">Gere com IA</h3>
              <p className="text-slate-500 text-sm">Use o Mágico de IA para criar treinos periodizados com vídeos automáticos.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-blue-500 font-black text-2xl mx-auto mb-6 border border-slate-800 shadow-xl">3</div>
              <h3 className="text-xl font-black text-white mb-3">Envie ao Aluno</h3>
              <p className="text-slate-500 text-sm">O seu aluno recebe o link, instala a app e começa a treinar com foco total.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO FUNCIONALIDADES */}
      <section id="funcionalidades" className="py-24 px-6 bg-slate-950/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[100px]"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Seu braço direito digital</h2>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.3em]">Ferramentas que geram faturamento</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800 hover:border-blue-500/50 transition-all group">
              <div className="bg-blue-600/20 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform"><Sparkles size={28}/></div>
              <h3 className="text-xl font-black text-white mb-4">Treino Inteligente</h3>
              <p className="text-slate-400 leading-relaxed">Gere planilhas periodizadas para meses em apenas 10 segundos. Nossa IA entende de biomecânica e patologias.</p>
            </div>
            <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800 hover:border-indigo-500/50 transition-all group">
              <div className="bg-indigo-600/20 w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform"><Youtube size={28}/></div>
              <h3 className="text-xl font-black text-white mb-4">Vídeos Automáticos</h3>
              <p className="text-slate-400 leading-relaxed">Não perca tempo anexando links. O sistema busca automaticamente o melhor vídeo de execução para cada exercício.</p>
            </div>
            <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800 hover:border-cyan-500/50 transition-all group">
              <div className="bg-cyan-600/20 w-14 h-14 rounded-2xl flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform"><Zap size={28}/></div>
              <h3 className="text-xl font-black text-white mb-4">App PWA Instalável</h3>
              <p className="text-slate-400 leading-relaxed">Seu aluno instala seu sistema no celular como se fosse um app da Apple Store, com ícone próprio e carregamento rápido.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO PREÇOS */}
      <section id="precos" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Planos para todos os níveis</h2>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.3em]">Ideal para consultoria online e presencial</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PlanCard 
              title="Grátis" 
              price="0" 
              students="Até 5 Alunos" 
              iaCalls="IA Manual" 
              features={["App Completo para o Aluno", "Busca de Vídeos", "Treinos Ilimitados"]} 
            />
            <PlanCard 
              title="Start (Bronze)" 
              price="30" 
              students="Até 20 Alunos" 
              iaCalls="10 Treinos Inteligentes/mês" 
              features={["Exportar para PDF", "Suporte Prioritário", "Gestão Rápida"]} 
            />
            <PlanCard 
              title="Pro (Silver)" 
              price="60" 
              students="Alunos Ilimitados" 
              iaCalls="40 Treinos Inteligentes/mês" 
              features={["Periodização com IA", "Análise de Alunos", "Envio via WhatsApp"]} 
              highlighted={true}
            />
            <PlanCard 
              title="Elite (Ouro)" 
              price="100" 
              students="Tudo Ilimitado" 
              iaCalls="IA Ilimitada" 
              features={["White Label (Sua Logo)", "Cores Customizadas", "Botão WhatsApp Próprio"]} 
            />
          </div>
        </div>
      </section>

      {/* SEÇÃO FAQ */}
      <section className="py-24 px-6 border-t border-slate-900 bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-black text-white">Dúvidas comuns</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "Meus alunos precisam pagar para acessar?", a: "Não. O acesso dos alunos é gratuito e ilimitado através da conta do Personal Trainer." },
              { q: "O sistema funciona no iPhone e Android?", a: "Sim. O EvoTrainer é um PWA, o que significa que ele pode ser instalado como um aplicativo em qualquer smartphone." },
              { q: "Como funciona a geração de treino por IA?", a: "Você informa o foco do aluno e as restrições (ex: dor no joelho) e nossa IA master gera uma periodização completa respeitando a biomecânica." },
              { q: "Posso cancelar minha assinatura a qualquer momento?", a: "Sim. Não há fidelidade. Você pode cancelar ou mudar de plano quando quiser através do painel." }
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl">
                 <div className="flex items-center gap-3 mb-2">
                   <HelpCircle size={18} className="text-blue-500" />
                   <h4 className="font-black text-white">{item.q}</h4>
                 </div>
                 <p className="text-slate-500 text-sm leading-relaxed ml-7">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION FINAL */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3.5rem] p-10 md:p-20 text-center relative overflow-hidden shadow-3xl shadow-blue-600/20">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter leading-tight">
              A revolução na sua consultoria <br className="hidden md:block"/> começa agora.
            </h2>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a href={appUrl} className="bg-white text-blue-600 px-12 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all inline-block shadow-2xl">CRIAR CONTA GRÁTIS</a>
              <button onClick={irParaWhatsApp} className="bg-blue-800 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-blue-900 transition-all inline-block">FALAR COM SUPORTE</button>
            </div>
            <p className="text-blue-100/60 mt-10 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck size={16}/> Gestão MASTER de Pagamentos
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
           <div>
             <div className="flex items-center gap-2 justify-center md:justify-start">
               <div className="bg-blue-600 p-1.5 rounded-lg text-white"><Dumbbell size={18}/></div>
               <span className="text-lg font-black tracking-tighter text-white">EVO<span className="text-blue-500">TRAINER</span></span>
             </div>
             <p className="text-slate-600 text-xs font-bold mt-2 uppercase tracking-widest">Transformando Personal Trainers em Empresas de Elite.</p>
           </div>
           
           <div className="flex gap-8 text-slate-500 font-bold text-xs uppercase tracking-widest">
             <a href="#" className="hover:text-blue-500 transition-colors">Termos</a>
             <a href="#" className="hover:text-blue-500 transition-colors">Privacidade</a>
             <a href={appUrl} className="hover:text-blue-500 transition-colors">Login Admin</a>
           </div>

           <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.2em]">© 2024 EVO TRAINER MASTER. TODOS OS DIREITOS RESERVADOS.</p>
        </div>
      </footer>
    </div>
  );
}