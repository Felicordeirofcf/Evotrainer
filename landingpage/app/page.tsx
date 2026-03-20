'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, Sparkles, CheckCircle2, ArrowRight, Menu, X, ShieldCheck, Zap, 
  HelpCircle, Play, FileText, TrendingUp, MessageCircle, Activity 
} from 'lucide-react';

const getBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return 'https://evotrainer.onrender.com';
};
const API_URL = getBaseUrl().endsWith('/') ? `${getBaseUrl()}api` : `${getBaseUrl()}/api`;
const APP_URL = "https://evotrainer.vercel.app"; // Substitua pelo link real do seu Dashboard

const Navbar = ({ onOpenSignup }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-[100] bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
            <Dumbbell className="text-white" size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">EVO<span className="text-blue-500">TRAINER</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#funcionalidades" className="text-sm font-bold text-slate-400 hover:text-white transition-colors tracking-wide">Recursos</a>
          <a href="#como-funciona" className="text-sm font-bold text-slate-400 hover:text-white transition-colors tracking-wide">Como Funciona</a>
          <a href="#precos" className="text-sm font-bold text-slate-400 hover:text-white transition-colors tracking-wide">Planos</a>
          <div className="flex gap-4 border-l border-slate-800 pl-8">
            <a href={APP_URL} className="text-white font-bold text-sm hover:text-blue-400 transition-all flex items-center">Login</a>
            <button onClick={onOpenSignup} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all">Testar Grátis</button>
          </div>
        </div>
        <button className="md:hidden text-slate-400" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X /> : <Menu />}</button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-6 flex flex-col gap-4 animate-fade-in">
          <a href="#funcionalidades" className="text-lg font-bold text-slate-300">Recursos</a>
          <a href="#como-funciona" className="text-lg font-bold text-slate-300">Como Funciona</a>
          <a href="#precos" className="text-lg font-bold text-slate-300">Planos</a>
          <hr className="border-slate-800" />
          <a href={APP_URL} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-center tracking-widest uppercase text-xs">Login do Painel</a>
          <button onClick={() => { setIsOpen(false); onOpenSignup(); }} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-center block tracking-widest uppercase text-xs">Criar Conta</button>
        </div>
      )}
    </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color }: any) => (
  <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800 hover:border-slate-600 transition-all group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 blur-[50px] rounded-full group-hover:opacity-20 transition-all duration-700`}></div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${color.replace('bg-', 'bg-opacity-20 text-').replace('500', '500 bg-opacity-20')}`} style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
      <Icon size={28} className={color.replace('bg-', 'text-')} />
    </div>
    <h3 className="text-xl font-black text-white mb-4 leading-tight">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm font-medium">{desc}</p>
  </div>
);

const PlanCard = ({ title, price, subPrice, features, highlighted = false, onAction, badge }: any) => {
  return (
    <div className={`relative p-10 rounded-[3rem] border transition-all duration-500 hover:-translate-y-2 flex flex-col h-full ${highlighted ? 'bg-slate-900 border-blue-500 shadow-2xl shadow-blue-900/20' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-600/30 whitespace-nowrap">
          {badge}
        </div>
      )}
      <div className="mb-8 text-center mt-4">
        <h3 className="text-slate-400 font-black text-xs uppercase tracking-[0.3em] mb-4">{title}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-slate-500 font-bold text-xl mr-1">R$</span>
          <span className="text-6xl font-black text-white tracking-tighter">{price}</span>
        </div>
        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 block">{subPrice}</span>
      </div>
      
      <div className="space-y-5 mb-10 flex-1">
        {features.map((f: string, i: number) => (
          <div key={i} className="flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-slate-300 text-sm font-medium leading-relaxed">{f}</span>
          </div>
        ))}
      </div>

      <button onClick={onAction} className={`w-full py-5 rounded-2xl font-black text-center text-[11px] uppercase tracking-[0.2em] transition-all ${highlighted ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
        {price === "0,00" ? "Iniciar Teste Grátis" : "Assinar Agora"}
      </button>
      {price !== "0,00" && <p className="text-center text-[10px] text-slate-500 mt-5 font-bold uppercase tracking-widest flex items-center justify-center gap-2"><ShieldCheck size={14} className="text-emerald-500"/> Pagamento Seguro</p>}
    </div>
  );
};

export default function LandingPage() {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formReg, setFormReg] = useState({ name: '', email: '', phone: '', password: '' });

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

  const irParaWhatsApp = () => {
    const msg = encodeURIComponent("Fala equipe EvoTrainer! Quero escalar minha consultoria, como funciona a plataforma?");
    window.open(`https://wa.me/5521987708652?text=${msg}`, '_blank');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formReg)
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Conta criada com sucesso! Redirecionando...");
        setTimeout(() => { window.location.href = APP_URL; }, 2000); 
      } else {
        showToast(data.error || "Erro ao criar conta.");
      }
    } catch (err) {
      showToast("Erro de conexão com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!document.getElementById('meta-pixel-script')) {
      const fbScript = document.createElement('script');
      fbScript.id = 'meta-pixel-script';
      fbScript.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', 'SEU_PIXEL_ID_AQUI'); fbq('track', 'PageView');`;
      document.head.appendChild(fbScript);
    }
  }, []); 

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30">
      <Navbar onOpenSignup={() => setShowSignupModal(true)} />

      {/* HERO SECTION */}
      <section className="pt-40 pb-20 px-6 overflow-hidden relative">
        <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-full mb-10 animate-fade-in shadow-xl">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] md:text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Engine IA 3.0 Ativa e Operante</span>
          </div>
          
          <h1 className="text-5xl md:text-[5.5rem] font-black text-white leading-[1.05] tracking-tighter mb-8">
            Sua Consultoria Fitness <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">no Piloto Automático.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium mb-12 leading-relaxed">
            Esqueça planilhas em Excel. Use nossa Inteligência Artificial para gerar periodizações completas, PDFs premium com vídeos e gerenciar seu faturamento em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => setShowSignupModal(true)} className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 hover:-translate-y-1 transition-all">
              <Zap size={18}/> GERAR MEUS 5 TREINOS GRÁTIS
            </button>
            <button onClick={irParaWhatsApp} className="w-full sm:w-auto bg-slate-900 border border-slate-800 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
              <MessageCircle size={18}/> Falar com Especialista
            </button>
          </div>
          <p className="mt-6 text-slate-500 font-bold text-[11px] uppercase tracking-widest">Nenhum cartão de crédito exigido no teste.</p>
        </div>

        {/* MOCKUP SHOWCASE */}
        <div className="max-w-6xl mx-auto mt-24 relative px-4 z-10">
           <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-2 md:p-4 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_100px_rgba(37,99,235,0.15)] border border-slate-700/50">
             <div className="bg-slate-950 rounded-[2rem] md:rounded-[3.5rem] aspect-[16/10] md:aspect-[21/9] flex items-center justify-center relative overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" 
                  alt="Dashboard EvoTrainer" 
                  className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-70 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                   <div className="hidden md:block">
                     <div className="bg-blue-600/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-blue-400/30">
                        <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest mb-1">Dossiê Gerado</p>
                        <p className="text-white font-black text-xl">Mesociclo de Hipertrofia</p>
                     </div>
                   </div>
                   <div className="bg-emerald-500/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-emerald-400/30 mx-auto md:mx-0">
                      <p className="text-[10px] text-emerald-100 font-black uppercase tracking-widest mb-1">Faturamento Atual</p>
                      <p className="text-white font-black text-xl">R$ 5.400,00</p>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* SEÇÃO RECURSOS DE ALTA PERFORMANCE */}
      <section id="funcionalidades" className="py-32 px-6 relative border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">Recursos de Alta Performance</h2>
            <p className="text-slate-500 font-black uppercase text-xs tracking-[0.3em]">Tudo que você precisa para escalar, em um só lugar.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={Sparkles} color="bg-blue-500" title="IA Periodizada" desc="Digite o foco e nossa IA gera a semana inteira de treinos (Macro, Meso, Micro) respeitando lesões e nível do aluno." />
            <FeatureCard icon={FileText} color="bg-red-500" title="Planilhas Premium" desc="Exporte treinos em PDFs lindíssimos com botões clicáveis que abrem vídeos explicativos diretamente no YouTube." />
            <FeatureCard icon={TrendingUp} color="bg-emerald-500" title="CRM Financeiro" desc="Cadastre o valor da mensalidade de cada aluno e acompanhe o crescimento real do faturamento da sua consultoria." />
            <FeatureCard icon={MessageCircle} color="bg-green-500" title="WhatsApp Nativo" desc="Um clique e o sistema abre seu WhatsApp com uma mensagem pronta avisando o aluno sobre a data de revisão da ficha." />
          </div>
        </div>
      </section>

      {/* SEÇÃO PREÇOS */}
      <section id="precos" className="py-32 px-6 relative border-t border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">Um preço. Retorno Infinito.</h2>
            <p className="text-slate-500 font-black uppercase text-xs tracking-[0.3em]">Custa menos que a mensalidade de UM aluno.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PlanCard 
              title="Test Drive" price="0,00" subPrice="100% Grátis para testar"
              features={["Até 5 Treinos gerados por IA", "Gestão de Alunos Básica", "Exportação em PDF simples", "Sem painel financeiro"]} 
              onAction={() => setShowSignupModal(true)}
            />
            <PlanCard 
              title="Plano Mensal" price="39,90" subPrice="Por Mês (Sem fidelidade)" badge="O MAIS ESCOLHIDO" highlighted={true}
              features={["Alunos Ilimitados", "Treinos por IA Ilimitados", "PDF Premium com Vídeos YT", "Dashboard Financeiro", "Integração WhatsApp"]} 
              onAction={() => setShowSignupModal(true)}
            />
            <PlanCard 
              title="Plano Anual" price="29,90" subPrice="Por Mês (Cobrado R$ 358 à vista)"
              features={["Tudo do plano Mensal", "Desconto de 25%", "Prioridade de Suporte", "Congelamento de preço anual"]} 
              onAction={() => setShowSignupModal(true)}
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
           <div>
             <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
               <div className="bg-blue-600 p-2 rounded-xl text-white"><Dumbbell size={20}/></div>
               <span className="text-xl font-black tracking-tighter text-white">EVO<span className="text-blue-500">TRAINER</span></span>
             </div>
             <p className="text-slate-600 text-xs font-bold uppercase tracking-[0.2em]">Tecnologia para Personal Trainers de Elite.</p>
           </div>
           
           <div className="flex gap-8 text-slate-500 font-black text-[10px] uppercase tracking-widest">
             <a href="#" className="hover:text-blue-500 transition-colors">Termos de Uso</a>
             <a href="#" className="hover:text-blue-500 transition-colors">Privacidade</a>
             <a href={APP_URL} className="hover:text-blue-500 transition-colors">Login Painel</a>
           </div>
        </div>
      </footer>

      {/* MODAL DE CADASTRO (REGISTRO DE PERSONAL) */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in">
           <div className="bg-slate-900 border border-slate-800 p-10 md:p-12 rounded-[3.5rem] w-full max-w-lg shadow-[0_0_80px_rgba(37,99,235,0.15)] relative">
              <button onClick={() => setShowSignupModal(false)} className="absolute top-8 right-8 p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><X size={24}/></button>
              
              <div className="text-center mb-10">
                 <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Criar Conta</h3>
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Acesso de Personal Trainer</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6 text-left">
                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Nome Completo</label>
                    <input type="text" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500 transition-all" value={formReg.name} onChange={e => setFormReg({...formReg, name: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">E-mail Profissional</label>
                    <input type="email" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500 transition-all" value={formReg.email} onChange={e => setFormReg({...formReg, email: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">WhatsApp</label>
                    <input type="tel" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500 transition-all" value={formReg.phone} onChange={e => setFormReg({...formReg, phone: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Crie uma Senha Segura</label>
                    <input type="password" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500 transition-all" value={formReg.password} onChange={e => setFormReg({...formReg, password: e.target.value})} />
                 </div>
                 
                 <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-blue-600 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-600/20 uppercase tracking-widest text-xs active:scale-95 transition-all mt-4 hover:bg-blue-500 flex justify-center items-center gap-2">
                    {isSubmitting ? <Activity className="animate-spin" size={20}/> : 'Concluir Cadastro'}
                 </button>
                 <p className="text-center text-slate-500 text-[10px] mt-4 font-medium">Ao se cadastrar, você concorda com nossos Termos de Uso.</p>
              </form>
           </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-10 py-5 rounded-full font-black shadow-[0_20px_50px_rgba(37,99,235,0.5)] flex items-center gap-4 text-sm animate-bounce border border-white/10">
           <CheckCircle2 size={24} /> {toastMsg}
        </div>
      )}
    </div>
  );
}