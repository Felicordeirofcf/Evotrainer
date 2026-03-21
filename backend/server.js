'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, LogOut, X, User as UserIcon, Plus, Activity, Dumbbell, Trash2, Settings, List, 
  Search, Download, Sparkles, Youtube, ChevronRight, MessageCircle, Crown, Zap, 
  DollarSign, Target, Lock, Camera, BarChart3, Globe, Phone, CheckCircle2, Edit2, Calendar,
  ShieldCheck, FileText, TrendingUp, Play, Menu, CreditCard, Clock
} from 'lucide-react';

const getBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return 'https://evotrainer.onrender.com';
};
const API_URL = getBaseUrl().endsWith('/') ? `${getBaseUrl()}api` : `${getBaseUrl()}/api`;
const APP_URL = "https://evotrainer.vercel.app";

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-[2.5rem] shadow-xl transition-all">
    <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center mb-4`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</p>
    <h3 className="text-3xl font-black text-white mt-1">{value}</h3>
  </div>
);

// --- COMPONENTES DA LANDING PAGE ---
const Navbar = ({ onOpenSignup, onOpenLogin }: any) => {
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
            <button onClick={onOpenLogin} className="text-white font-bold text-sm hover:text-blue-400 transition-all flex items-center">Login</button>
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
          <button onClick={() => { setIsOpen(false); onOpenLogin(); }} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-center tracking-widest uppercase text-xs">Login do Painel</button>
          <button onClick={() => { setIsOpen(false); onOpenSignup(); }} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-center block tracking-widest uppercase text-xs">Criar Conta</button>
        </div>
      )}
    </nav>
  );
};

const PlanCard = ({ title, price, subPrice, features, highlighted = false, onAction, badge }: any) => (
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
  </div>
);

// ==========================================
// APLICAÇÃO PRINCIPAL (APP)
// ==========================================
export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null); 
  const [token, setToken] = useState<string | null>(null);
  const [tabAtiva, setTabAtiva] = useState('dashboard');
  const [toastMsg, setToastMsg] = useState('');
  
  const [alunos, setAlunos] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  
  const [iaAlunoId, setIaAlunoId] = useState('');
  const [iaFrequencia, setIaFrequencia] = useState('3');
  const [iaCiclo, setIaCiclo] = useState('Mesociclo (Hipertrofia/Força)');
  const [iaSemanas, setIaSemanas] = useState('4');
  const [isLoading, setIsLoading] = useState(false);

  const [showAddAlunoModal, setShowAddAlunoModal] = useState(false);
  const [showEditAlunoModal, setShowEditAlunoModal] = useState(false);
  const [showGerenciarTreinosModal, setShowGerenciarTreinosModal] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<any>(null);
  const [showEditTrainerModal, setShowEditTrainerModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [trainerSelecionado, setTrainerSelecionado] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Modal Asaas
  const [showCpfModal, setShowCpfModal] = useState(false);
  const [cpfInput, setCpfInput] = useState('');
  const [isGeneratingCheckout, setIsGeneratingCheckout] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [recoverEmail, setRecoverEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formAluno, setFormAluno] = useState({ name: '', email: '', phone: '', weight: '', height: '', level: 'Intermediário', anamnese: '', price: '' });
  const [formTrainer, setFormTrainer] = useState({ name: '', email: '', phone: '', plano: '' });
  const [formReg, setFormReg] = useState({ name: '', email: '', phone: '', password: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  const isMaster = currentUser?.role === 'SUPERADMIN';
  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };
  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });

  const getInitial = () => {
    if (currentUser && currentUser.name && typeof currentUser.name === 'string') return currentUser.name.charAt(0).toUpperCase();
    return 'U';
  };

  const faturamentoAtletas = alunos.reduce((acc, aluno) => acc + (parseFloat(aluno.price) || 0), 0);
  const faturamentoMaster = trainers.reduce((acc, t) => { if (t.plano === 'PRO') return acc + 39.90; return acc; }, 0);
  const faturamentoReal = isMaster ? faturamentoMaster : faturamentoAtletas;

  const isIlimitado = currentUser?.plano === 'PRO' || isMaster; 
  const usosRestantes = 5 - (currentUser?.iaUsadaMes || 0);
  const iaOffline = !isIlimitado && !isMaster && usosRestantes <= 0;
  
  let iaStatusText = "Online";
  if (isMaster) iaStatusText = "Online (Master)";
  else if (isIlimitado) iaStatusText = "Ilimitado";
  else if (iaOffline) iaStatusText = "Offline (Upgrade)";
  else iaStatusText = `${usosRestantes}/5 Testes`;

  const planExpiresDate = currentUser?.planExpiresAt ? new Date(currentUser.planExpiresAt) : null;
  let daysRemaining = 0;
  let paymentDate = null;
  if (planExpiresDate) {
    daysRemaining = Math.ceil((planExpiresDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    paymentDate = new Date(planExpiresDate.getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');
  }

  const fetchData = async () => {
    if (!token || !currentUser) return;
    try {
      const resMe = await fetch(`${API_URL}/me`, { headers: getAuthHeaders() });
      if (resMe.ok) {
         const userData = await resMe.json();
         setCurrentUser(userData);
         localStorage.setItem('treino_ai_user', JSON.stringify(userData));
      }
      const ep = isMaster ? '/superadmin/trainers' : '/alunos';
      const res = await fetch(`${API_URL}${ep}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        isMaster ? setTrainers(data) : setAlunos(data);
      }
    } catch (e) { console.error(e); }
  };

  // --- LOOP MÁGICO DE CHECAGEM DO PIX ---
  const handleCreateCheckout = async () => {
    const cleanCpf = cpfInput.replace(/\D/g, '');
    if (cleanCpf.length < 11) return showToast("Digite um CPF/CNPJ válido.");
    
    setIsGeneratingCheckout(true);
    try {
      const res = await fetch(`${API_URL}/asaas/criar-cobranca`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ cpfCnpj: cleanCpf })
      });
      const data = await res.json();
      
      if (res.ok && data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
        setShowCpfModal(false);
        showToast("Escaneie o Pix! Aguardando...");

        // Checador de status
        let tentativas = 0;
        const intervalId = setInterval(async () => {
           tentativas++;
           if (tentativas > 30) { clearInterval(intervalId); return; } // Para após 5 minutos

           try {
             const checkRes = await fetch(`${API_URL}/asaas/status-pagamento/${data.paymentId}`, { headers: getAuthHeaders() });
             if (checkRes.ok) {
                const statusData = await checkRes.json();
                if (statusData.status === 'RECEIVED' || statusData.status === 'CONFIRMED') {
                   clearInterval(intervalId);
                   showToast("Pix Recebido! Você agora é Elite.");
                   fetchData(); // Atualiza a tela sozinho!
                }
             }
           } catch(e) {}
        }, 10000); // Tenta a cada 10 segundos
        
      } else {
        showToast(data.error || "Erro.");
      }
    } catch (e) { showToast("Erro."); } 
    finally { setIsGeneratingCheckout(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: loginEmail, password: loginPassword }) });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token); setCurrentUser(data.user);
        setShowLoginModal(false);
        localStorage.setItem('treino_ai_token', data.token); localStorage.setItem('treino_ai_user', JSON.stringify(data.user));
      } else showToast(data.error);
    } catch (e) { showToast("Erro."); } finally { setIsLoggingIn(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formReg) });
      if (res.ok) {
        showToast("Conta criada!");
        const loginRes = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formReg.email, password: formReg.password }) });
        const loginData = await loginRes.json();
        if(loginRes.ok) {
           setToken(loginData.token); setCurrentUser(loginData.user);
           setShowSignupModal(false);
           localStorage.setItem('treino_ai_token', loginData.token); localStorage.setItem('treino_ai_user', JSON.stringify(loginData.user));
        }
      } else { 
        const d = await res.json();
        showToast(d.error || "Erro."); 
      }
    } catch (err) { showToast("Erro."); } finally { setIsSubmitting(false); }
  };

  const handleRecoverPassword = async () => {
    if(!recoverEmail) return showToast("E-mail!");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/recover-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: recoverEmail }) });
      if (res.ok) { showToast("Enviado!"); setShowRecoverModal(false); } 
    } catch (e) { showToast("Erro."); } finally { setIsLoading(false); }
  };

  const createAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/alunos`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(formAluno) });
    if (res.ok) { showToast("Incluído!"); setShowAddAlunoModal(false); fetchData(); }
  };
  const updateAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/alunos/${alunoSelecionado.id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(formAluno) });
    if (res.ok) { showToast("Atualizado!"); setShowEditAlunoModal(false); fetchData(); }
  };
  const deleteAluno = async (id: number) => {
    if(!confirm("Deletar aluno?")) return;
    const res = await fetch(`${API_URL}/alunos/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (res.ok) { showToast("Removido!"); fetchData(); }
  };

  const updateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/superadmin/trainers/${trainerSelecionado.id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(formTrainer) });
    if (res.ok) { showToast("Atualizado!"); setShowEditTrainerModal(false); fetchData(); }
  };
  const updatePlan = async (id: number, plano: string) => {
    const res = await fetch(`${API_URL}/superadmin/trainers/${id}/plano`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ plano }) });
    if (res.ok) { showToast("Atualizado!"); setShowEditPlanModal(false); fetchData(); }
  };
  const deleteTrainer = async (id: number) => {
    if(!confirm("Remover personal permanentemente?")) return;
    const res = await fetch(`${API_URL}/superadmin/trainers/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (res.ok) { showToast("Removido!"); fetchData(); }
  };

  const deletePlanilha = async (planilhaId: number) => {
    if(!confirm("Deletar ficha?")) return;
    const res = await fetch(`${API_URL}/treinos/${planilhaId}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (res.ok) { 
      showToast("Excluída!"); 
      if(alunoSelecionado) { setAlunoSelecionado((prev: any) => ({...prev, workouts: prev.workouts.filter((w:any) => w.id !== planilhaId)})); }
      fetchData(); 
    }
  };

  const changePassword = async () => {
    const res = await fetch(`${API_URL}/perfil/senha`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(passwordForm) });
    if (res.ok) { showToast("Alterada!"); setShowPasswordModal(false); } else showToast("Senha incorreta.");
  };

  const gerarSemanaIA = async () => {
    if (iaOffline) return;
    const prompt = (document.getElementById('comandoIA') as HTMLTextAreaElement).value;
    if (!iaAlunoId || !prompt) return showToast("Faltam dados.");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/ai/gerar-autonomo`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ alunoId: iaAlunoId, comandoPersonal: prompt, frequencia: iaFrequencia, ciclo: iaCiclo, semanas: iaSemanas }) });
      if (res.ok) { showToast("Criado!"); setTabAtiva('alunos'); fetchData(); } 
      else { const d = await res.json(); showToast(d.error || "Erro IA."); }
    } catch (e) { showToast("Erro."); } finally { setIsLoading(false); }
  };

  const exportarPDF = (treino: any, aluno: any) => {
    const primaryColor = "#2563eb";
    const dataCriado = new Date(treino.createdAt).toLocaleDateString('pt-BR');
    const rows = treino.exercises?.map((ex: any, i: number) => {
      const youtubeLink = ex.youtubeId ? `https://www.youtube.com/watch?v=${ex.youtubeId}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' execução biomecânica')}`;
      return `<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 16px; font-weight: 800; color: ${primaryColor}; font-size: 18px;">${String(i + 1).padStart(2, '0')}</td><td style="padding: 16px;"><div style="font-weight: 800; color: #1e293b; font-size: 16px; text-transform: uppercase;">${ex.name}</div><div style="color: #64748b; font-size: 13px; margin-top: 4px;">Séries: ${ex.sets} | Carga: ${ex.weight}</div></td><td style="padding: 16px; text-align: right;"><a href="${youtubeLink}" target="_blank" style="background: #ff0000; color: white; padding: 10px 15px; border-radius: 8px; text-decoration: none; font-weight: 900; font-size: 10px;">VÍDEO 🎬</a></td></tr>`;
    }).join('');

    const html = `<html><head><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap'); body { font-family: 'Inter', sans-serif; margin: 0; background: #f8fafc; } .header { background: ${primaryColor}; color: white; padding: 40px; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; } .container { max-width: 800px; margin: -20px auto 40px; background: white; border-radius: 30px; box-shadow: 0 20px 25px rgba(0,0,0,0.1); overflow: hidden; } table { width: 100%; border-collapse: collapse; }</style></head>
      <body><div class="header"><div style="display:flex; justify-content:space-between; align-items:center;"><div><h1 style="margin:0; font-weight:900; font-style:italic;">EVOTRAINER</h1><p style="margin:5px 0 0; font-weight:700; text-transform:uppercase; font-size:12px;">Periodização de Elite</p></div><div style="text-align:right;"><div style="font-weight:900; font-size:20px;">${aluno.name.toUpperCase()}</div><div style="font-size:12px;">Ficha: ${treino.title}</div></div></div></div>
      <div class="container"><div style="padding:20px 30px; background: #eff6ff; display:flex; gap:20px; border-bottom: 1px solid #e2e8f0;"><div style="flex:1"><span style="font-size:10px; font-weight:900; color:#3b82f6; text-transform:uppercase;">Enviado em</span><br/><strong>${dataCriado}</strong></div><div style="flex:1"><span style="font-size:10px; font-weight:900; color:#64748b; display:block; text-transform:uppercase;">Nível</span><span style="font-weight:800; color:${primaryColor};">${aluno.level}</span></div></div><table><tbody>${rows}</tbody></table></div>
      <script>window.onload=()=>window.print()</script></body></html>`;
    const win = window.open('', '_blank'); win?.document.write(html); win?.document.close();
  };

  const enviarWhatsApp = (aluno: any, treino: any) => {
    const cleanPhone = aluno.phone?.replace(/\D/g, '');
    const msg = encodeURIComponent(`Fala ${aluno.name.split(' ')[0]}! 💪 Seu novo protocolo "${treino.title}" já está disponível.`);
    window.open(`https://wa.me/55${cleanPhone}?text=${msg}`, '_blank');
  };

  useEffect(() => {
    const t = localStorage.getItem('treino_ai_token');
    const u = localStorage.getItem('treino_ai_user');
    if (t && u) { setToken(t); setCurrentUser(JSON.parse(u)); }
  }, []);

  useEffect(() => { if (currentUser) fetchData(); }, [currentUser, tabAtiva]);

  // ================= TELA PÚBLICA (LANDING PAGE) =================
  if (!currentUser) return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30">
      <Navbar onOpenSignup={() => setShowSignupModal(true)} onOpenLogin={() => setShowLoginModal(true)} />
      <section className="pt-40 pb-20 px-6 text-center">
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-8xl font-black text-white leading-tight tracking-tighter mb-8">Sua Consultoria Fitness <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">no Piloto Automático.</span></h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl mb-12">Periodização inteligente e gestão financeira em um só lugar.</p>
          <button onClick={() => setShowSignupModal(true)} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-2 mx-auto"><Zap size={18}/> GERAR TREINOS GRÁTIS</button>
        </div>
      </section>

      <section id="precos" className="py-32 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <PlanCard title="Test Drive" price="0,00" subPrice="Gratis" features={["5 Treinos IA", "Gestão Básica"]} onAction={() => setShowSignupModal(true)} />
          <PlanCard title="Plano Mensal" price="39,90" subPrice="Completo" badge="MELHOR ESCOLHA" highlighted={true} features={["Tudo Ilimitado", "WhatsApp Nativo", "Dashboard Financeiro"]} onAction={() => setShowSignupModal(true)} />
        </div>
      </section>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-6 backdrop-blur-md">
           <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] w-full max-w-md relative text-slate-50">
              <button onClick={() => setShowLoginModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-white"><X/></button>
              <h3 className="text-3xl font-black text-white italic uppercase mb-8">Login</h3>
              <form onSubmit={handleLogin} className="space-y-4">
                 <input type="email" placeholder="E-mail" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                 <input type="password" placeholder="Senha" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                 <div className="text-right"><button type="button" onClick={() => { setShowLoginModal(false); setShowRecoverModal(true); }} className="text-[10px] text-slate-500 uppercase hover:text-blue-500">Esqueceu a Senha?</button></div>
                 <button className="w-full p-6 bg-blue-600 rounded-3xl font-black uppercase text-white shadow-xl">{isLoggingIn ? 'Entrando...' : 'Acessar'}</button>
              </form>
           </div>
        </div>
      )}

      {showSignupModal && (
        <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-6 backdrop-blur-md">
           <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3.5rem] w-full max-w-lg relative text-slate-50 shadow-2xl">
              <button onClick={() => setShowSignupModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-white"><X size={24}/></button>
              <h3 className="text-3xl font-black text-white italic uppercase mb-8 text-center">Criar Conta</h3>
              <form onSubmit={handleRegister} className="space-y-4">
                 <input type="text" placeholder="Nome Completo" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500" value={formReg.name} onChange={e => setFormReg({...formReg, name: e.target.value})} />
                 <input type="email" placeholder="E-mail" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500" value={formReg.email} onChange={e => setFormReg({...formReg, email: e.target.value})} />
                 <input type="password" placeholder="Senha Segura" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500" value={formReg.password} onChange={e => setFormReg({...formReg, password: e.target.value})} />
                 <button className="w-full p-6 bg-blue-600 rounded-3xl font-black uppercase text-white">{isSubmitting ? 'Processando...' : 'Concluir'}</button>
              </form>
           </div>
        </div>
      )}
      {toastMsg && <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-10 py-5 rounded-full font-black shadow-2xl">{toastMsg}</div>}
    </div>
  );

  // ================= DASHBOARD LOGADO =================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      <header className="p-6 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-black text-xl italic tracking-tighter uppercase leading-none">EVO<span className={isMaster ? 'text-red-500' : 'text-blue-500'}>{isMaster ? 'MASTER' : 'TRAINER'}</span></h1>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:bg-red-500 transition-all border border-slate-700 shadow-xl"><LogOut size={18}/></button>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full pb-40 animate-fade-in">
        
        {tabAtiva === 'dashboard' && (
          <div className="space-y-10">
             <h2 className="text-4xl font-black italic tracking-tight uppercase text-white">Dashboard</h2>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title={isMaster ? "Total Personais" : "Total Alunos"} value={isMaster ? trainers.length : alunos.length} icon={Users} color="bg-blue-500" />
                <StatCard title={isMaster ? "Receita (SaaS)" : "Faturamento"} value={`R$ ${faturamentoReal.toFixed(2).replace('.',',')}`} icon={DollarSign} color="bg-emerald-500" />
                <StatCard title="Engine IA" value={iaStatusText} icon={Zap} color={iaOffline ? "bg-red-500" : "bg-indigo-500"} />
                <StatCard title="Status" value="OK" icon={Target} color="bg-amber-500" />
             </div>
          </div>
        )}

        {tabAtiva === 'alunos' && (
          <div className="space-y-10">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black italic uppercase">{isMaster ? 'Gestão de Personais' : 'Gestão de Alunos'}</h2>
                {!isMaster && <button onClick={() => { setFormAluno({ name: '', email: '', phone: '', weight: '', height: '', level: 'Intermediário', anamnese: '', price: '' }); setShowAddAlunoModal(true); }} className="bg-blue-600 px-8 py-5 rounded-2xl font-black uppercase text-xs"><Plus size={16} className="inline mr-2"/> Incluir Aluno</button>}
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(isMaster ? trainers : alunos).map(item => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[3.5rem] shadow-xl hover:border-slate-700 transition-all flex flex-col gap-6 relative overflow-hidden">
                     {item.price && !isMaster && <div className="absolute top-6 right-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[11px] px-4 py-2 rounded-xl backdrop-blur-md">R$ {item.price}</div>}
                     <div className="flex items-center gap-5">
                        <div className={`w-16 h-16 rounded-[1.5rem] ${isMaster ? 'bg-red-600/10 text-red-500 border-red-500/10' : 'bg-blue-600/10 text-blue-500 border-blue-500/10'} flex items-center justify-center font-black text-2xl border`}>{item.name ? item.name[0].toUpperCase() : '?'}</div>
                        <div>
                          <h3 className="font-black text-xl leading-none pr-12">{item.name}</h3>
                          <p className="text-xs text-slate-500 mt-2">{item.email}</p>
                          {isMaster && <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-widest">Plano: {item.plano}</p>}
                        </div>
                     </div>
                     <div className="flex gap-2 mt-2">
                        {isMaster ? (
                          <>
                            <button onClick={() => { setTrainerSelecionado(item); setShowEditPlanModal(true); }} className="flex-1 bg-slate-800 text-white p-5 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-slate-700 transition-all">Alterar Plano</button>
                            <button onClick={() => { setTrainerSelecionado(item); setFormTrainer({ name: item.name, email: item.email, phone: item.phone || '', plano: item.plano }); setShowEditTrainerModal(true); }} className="p-5 bg-blue-600/10 text-blue-500 rounded-2xl shadow-xl hover:bg-blue-600 hover:text-white transition-all"><Edit2 size={22}/></button>
                            <button onClick={() => deleteTrainer(item.id)} className="p-5 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={22}/></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setAlunoSelecionado(item); setShowGerenciarTreinosModal(true); }} className="flex-1 bg-blue-600 text-white p-5 rounded-2xl font-black text-[10px] uppercase shadow-xl active:scale-95 hover:bg-blue-500 transition-all">Treinos</button>
                            <button onClick={() => { setAlunoSelecionado(item); setFormAluno({ name: item.name, email: item.email, phone: item.phone || '', weight: item.weight || '', height: item.height || '', level: item.level || 'Intermediário', anamnese: item.anamnese || '', price: item.price || '' }); setShowEditAlunoModal(true); }} className="p-5 bg-blue-600/10 text-blue-500 rounded-2xl shadow-xl hover:bg-blue-600 hover:text-white transition-all"><Edit2 size={22}/></button>
                            <button onClick={() => deleteAluno(item.id)} className="p-5 bg-red-600/10 text-red-500 rounded-2xl shadow-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={22}/></button>
                          </>
                        )}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {tabAtiva === 'ia' && (
           <div className="max-w-4xl mx-auto space-y-10 text-center pb-40">
              <div className={`bg-gradient-to-br ${iaOffline ? 'from-red-700 to-red-950 border-red-500/30' : 'from-indigo-700 to-blue-900 border-white/10'} p-16 rounded-[4rem] shadow-2xl relative overflow-hidden border`}>
                 {iaOffline ? <Lock size={100} className="mx-auto text-red-200 mb-8" /> : <Sparkles size={100} className="mx-auto text-white mb-8 animate-pulse" />}
                 <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">EvoIntelligence™</h2>
                 <p className="text-white/80 mt-4 leading-relaxed italic text-lg">{iaOffline ? "Você atingiu o limite de testes. Faça o upgrade para continuar." : "Engine Autônoma de Periodização"}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3.5rem] shadow-2xl text-left space-y-8">
                 <select disabled={iaOffline} value={iaAlunoId} onChange={e => setIaAlunoId(e.target.value)} className="w-full p-8 bg-slate-950 border-2 border-slate-800 rounded-[2rem] text-white font-black text-xl outline-none focus:border-blue-500 cursor-pointer appearance-none">
                    <option value="">Acessar lista...</option>
                    {alunos.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                 </select>
                 <div className="grid grid-cols-2 gap-4">
                    <select disabled={iaOffline} value={iaFrequencia} onChange={e => setIaFrequencia(e.target.value)} className="w-full p-6 bg-slate-950 border-2 border-slate-800 rounded-[2rem] text-white font-black outline-none focus:border-blue-500 cursor-pointer appearance-none">
                       {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} dias na semana</option>)}
                    </select>
                    <select disabled={iaOffline} value={iaSemanas} onChange={e => setIaSemanas(e.target.value)} className="w-full p-6 bg-slate-950 border-2 border-slate-800 rounded-[2rem] text-white font-black outline-none focus:border-blue-500 cursor-pointer appearance-none">
                       {[1,2,3,4,5,6,8,12].map(n => <option key={n} value={n}>{n} Semanas</option>)}
                    </select>
                 </div>
                 <textarea disabled={iaOffline} id="comandoIA" placeholder="Ex: Monte um ABCDE focado em hipertrofia máxima..." className="w-full p-8 bg-slate-950 border-2 border-slate-800 rounded-[3rem] text-white font-medium text-lg min-h-[200px] outline-none shadow-inner"></textarea>
                 <button onClick={iaOffline ? () => setShowCpfModal(true) : gerarSemanaIA} disabled={isLoading && !iaOffline} className={`w-full py-10 font-black rounded-[2.5rem] shadow-2xl active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-4 ${iaOffline ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-white text-blue-900 hover:bg-blue-50'}`}>
                    {isLoading ? <Activity className="animate-spin" size={30} /> : (iaOffline ? <><Lock size={24} /> Fazer Upgrade (R$ 39,90)</> : <><Zap size={24} /> Ativar Engine</>)}
                 </button>
              </div>
           </div>
        )}

        {tabAtiva === 'perfil' && (
          <div className="max-w-4xl mx-auto animate-fade-in pb-40">
             <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                   <div className={`p-10 rounded-[3.5rem] border flex flex-col items-center text-center justify-center relative overflow-hidden shadow-2xl ${isIlimitado || isMaster ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-blue-500/30' : 'bg-slate-900 border-slate-800'}`}>
                      <div className="w-28 h-28 bg-slate-950 text-blue-500 rounded-[2rem] flex items-center justify-center text-4xl font-black mb-6 border border-slate-800 shadow-inner">
                         {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{currentUser?.name || 'Usuário'}</h3>
                      <p className="text-slate-500 text-sm mt-2">{currentUser?.email}</p>
                      <div className="w-full mt-8 bg-slate-950 p-6 rounded-[2rem] border border-slate-800">
                         {isMaster ? <div className="text-red-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"><Crown size={16}/> Acesso Master</div> : 
                            <>
                               <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Plano Atual</span>
                                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isIlimitado ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>{currentUser?.plano}</span>
                               </div>
                               {isIlimitado ? (
                                 <div className="space-y-4 text-left">
                                    <div className="flex items-center gap-3 text-slate-300 text-sm"><CreditCard size={16} className="text-emerald-500"/> Pagamento: <span className="font-bold ml-auto">{paymentDate || 'Manual'}</span></div>
                                    <div className="flex items-center gap-3 text-slate-300 text-sm"><Calendar size={16} className="text-blue-500"/> Vencimento: <span className="font-bold ml-auto text-blue-500">{planExpiresDate?.toLocaleDateString('pt-BR') || '---'}</span></div>
                                    {daysRemaining > 0 && <div className="flex items-center gap-3 text-slate-300 text-sm"><Clock size={16} className="text-amber-500"/> Faltam: <span className="font-bold ml-auto text-amber-500">{daysRemaining} dias</span></div>}
                                 </div>
                               ) : (
                                 <button onClick={() => setShowCpfModal(true)} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl text-xs uppercase hover:bg-emerald-500 active:scale-95 transition-all">Ativar Plano PRO</button>
                               )}
                            </>
                         }
                      </div>
                   </div>
                </div>
                <div className="md:w-1/2 flex flex-col gap-6">
                   <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3.5rem] shadow-xl">
                      <h4 className="text-white font-black text-xl italic uppercase mb-6">Segurança</h4>
                      <button onClick={() => setShowPasswordModal(true)} className="w-full bg-slate-950 border border-slate-800 p-6 rounded-[2rem] font-black text-[11px] text-white uppercase tracking-widest flex items-center gap-4 hover:border-slate-600 transition-all"><Lock size={18} className="text-slate-400"/> Alterar minha Senha</button>
                   </div>
                   <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[3.5rem] shadow-xl flex items-center justify-center flex-1">
                      <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-6 bg-red-600/10 border border-red-500/20 text-red-500 font-black rounded-[2rem] hover:bg-red-600 hover:text-white active:scale-95 transition-all text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"><LogOut size={16}/> Sair da Conta</button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-3xl border border-white/10 px-12 py-6 rounded-full flex gap-14 shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-[100]">
        {[
          { id: 'dashboard', icon: BarChart3, label: 'DASH' },
          { id: 'alunos', icon: Users, label: isMaster ? 'PROS' : 'ALUNOS' },
          { id: 'ia', icon: Sparkles, label: 'EVO-INT' },
          { id: 'perfil', icon: UserIcon, label: 'CONTA' }
        ].map(item => (
          <button key={item.id} onClick={() => setTabAtiva(item.id)} className={`flex flex-col items-center gap-2 group transform active:scale-75 ${tabAtiva === item.id ? 'scale-125' : 'opacity-30 hover:opacity-100'}`}>
            <item.icon size={28} className={tabAtiva === item.id ? (isMaster ? 'text-red-500' : 'text-blue-500') : 'text-white'} strokeWidth={tabAtiva === item.id ? 2.5 : 2} />
            <span className={`text-[7px] font-black uppercase tracking-widest ${tabAtiva === item.id ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* MODAL MUDAR SENHA */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/98 z-[800] flex items-center justify-center p-6 backdrop-blur-md">
           <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] w-full max-w-md shadow-2xl relative text-slate-50 text-center">
              <button onClick={() => setShowPasswordModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-white"><X/></button>
              <h3 className="text-2xl font-black italic uppercase mb-8">Segurança</h3>
              <form onSubmit={e => { e.preventDefault(); changePassword(); }} className="space-y-4 text-left">
                 <input type="password" placeholder="Senha Atual" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 font-bold" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} />
                 <input type="password" placeholder="Nova Senha" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 font-bold" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
                 <button className="w-full p-6 bg-blue-600 rounded-3xl font-black uppercase text-white shadow-xl">Atualizar Agora</button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL GERENCIAR TREINO (DOSSIÊ) */}
      {showGerenciarTreinosModal && !isMaster && alunoSelecionado && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in text-slate-50">
           <div className="bg-slate-900 border border-slate-800 p-12 rounded-[4rem] w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-8 text-left">
                <div><h3 className="text-3xl font-black tracking-tight uppercase italic">{alunoSelecionado.name}</h3><p className="text-[10px] text-blue-500 font-black uppercase mt-2 tracking-widest">Dossiê de Periodização</p></div>
                <button onClick={() => setShowGerenciarTreinosModal(false)} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><X size={28}/></button>
              </div>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {(!alunoSelecionado.workouts || alunoSelecionado.workouts.length === 0) ? (
                  <div className="text-center py-20 text-slate-700 font-black uppercase text-xs tracking-widest border-2 border-dashed border-slate-800 rounded-[2rem]">Nenhuma ficha no banco.</div>
                ) : (
                  alunoSelecionado.workouts.map((w: any) => (
                    <div key={w.id} className="bg-slate-950 p-6 rounded-[2.5rem] border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 group hover:border-blue-500/50 transition-all shadow-inner text-left">
                      <div className="flex-1 text-left">
                        <p className="font-black text-blue-400 uppercase text-sm tracking-tight leading-tight">{w.title}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Validade: {w.duration}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => exportarPDF(w, alunoSelecionado)} className="p-4 bg-blue-600 text-white rounded-xl shadow-xl active:scale-90 hover:bg-blue-500 transition-all" title="Baixar PDF"><Download size={18}/></button>
                        <button onClick={() => enviarWhatsApp(alunoSelecionado, w)} className="p-4 bg-emerald-600 text-white rounded-xl shadow-xl active:scale-90 hover:bg-emerald-500 transition-all" title="Avisar no WhatsApp"><MessageCircle size={18}/></button>
                        <button onClick={() => deletePlanilha(w.id)} className="p-4 bg-red-600/20 text-red-500 rounded-xl shadow-xl active:scale-90 hover:bg-red-600 hover:text-white transition-all" title="Excluir"><Trash2 size={18}/></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>
      )}

      {/* MODAL SUPERADMIN PLANO */}
      {showEditPlanModal && trainerSelecionado && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md text-slate-50">
           <div className="bg-slate-900 border border-slate-800 p-12 rounded-[4rem] w-full max-w-md shadow-2xl text-center relative">
              <button onClick={() => setShowEditPlanModal(false)} className="absolute top-8 right-8 text-slate-400"><X size={24}/></button>
              <h3 className="text-2xl font-black uppercase mb-2">Alterar Plano</h3>
              <p className="text-slate-500 mb-10 uppercase text-[10px] tracking-widest">{trainerSelecionado.name}</p>
              <div className="space-y-4">
                 {['TESTE', 'MENSAL'].map(p => {
                   const bdValue = p === 'TESTE' ? 'GRATIS' : 'PRO';
                   return <button key={p} onClick={() => updatePlan(trainerSelecionado.id, bdValue)} className={`w-full p-6 rounded-3xl font-black uppercase border transition-all ${trainerSelecionado.plano === bdValue ? 'bg-red-600 text-white border-red-600' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>PLANO {p}</button>;
                 })}
              </div>
           </div>
        </div>
      )}

      {/* MODAL INCLUIR ALUNO */}
      {showAddAlunoModal && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md">
           <div className="bg-slate-900 border border-slate-800 p-10 rounded-[4rem] w-full max-w-3xl text-slate-50 relative shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6 text-left">
                <h3 className="text-3xl font-black uppercase italic">Incluir Aluno</h3>
                <button onClick={() => setShowAddAlunoModal(false)} className="p-2 bg-slate-800 rounded-xl"><X size={28}/></button>
              </div>
              <form onSubmit={createAluno} className="space-y-6 text-left">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" placeholder="Nome Completo" required className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 outline-none focus:border-blue-500" value={formAluno.name} onChange={e => setFormAluno({...formAluno, name: e.target.value})} />
                    <input type="email" placeholder="E-mail de Login" required className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 outline-none focus:border-blue-500" value={formAluno.email} onChange={e => setFormAluno({...formAluno, email: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <input type="tel" placeholder="WhatsApp" required className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 outline-none focus:border-blue-500" value={formAluno.phone} onChange={e => setFormAluno({...formAluno, phone: e.target.value})} />
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                      <input type="number" placeholder="Preço" step="0.01" required className="w-full p-6 pl-14 rounded-3xl bg-slate-950 border border-slate-800 outline-none focus:border-blue-500" value={formAluno.price} onChange={e => setFormAluno({...formAluno, price: e.target.value})} />
                    </div>
                    <select className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 outline-none appearance-none" value={formAluno.level} onChange={e => setFormAluno({...formAluno, level: e.target.value})}>
                      <option>Iniciante</option><option>Intermediário</option><option>Avançado</option>
                    </select>
                 </div>
                 <textarea placeholder="Prontuário Médico / Restrições (A IA lerá isso para montar o treino)" className="w-full p-8 bg-slate-950 border border-slate-800 rounded-[2.5rem] min-h-[150px] outline-none focus:border-blue-500" value={formAluno.anamnese} onChange={e => setFormAluno({...formAluno, anamnese: e.target.value})}></textarea>
                 <button className="w-full py-8 bg-blue-600 rounded-[2.5rem] font-black uppercase shadow-2xl hover:bg-blue-500 active:scale-95 transition-all">Salvar e Integrar IA</button>
              </form>
           </div>
        </div>
      )}

      {/* NOVO MODAL: CPF E GERAR COBRANÇA */}
      {showCpfModal && (
        <div className="fixed inset-0 bg-black/98 z-[900] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in text-slate-50">
           <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] w-full max-w-md shadow-2xl relative text-center">
              <button onClick={() => setShowCpfModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-white transition-all"><X size={24}/></button>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Plano Pro</h3>
              <p className="text-slate-500 mb-8 text-[10px] font-black uppercase tracking-widest leading-relaxed">Para gerar sua cobrança segura via PIX, informe seu documento.</p>
              
              <div className="space-y-4 text-left">
                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">CPF ou CNPJ</label>
                    <input 
                      type="text" 
                      placeholder="000.000.000-00" 
                      required 
                      className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 font-bold tracking-widest text-center" 
                      value={cpfInput} 
                      onChange={e => setCpfInput(e.target.value)} 
                    />
                 </div>
                 <button onClick={handleCreateCheckout} disabled={isGeneratingCheckout} className="w-full py-6 bg-emerald-600 text-white font-black rounded-3xl active:scale-95 shadow-xl transition-all uppercase tracking-widest text-[11px] mt-4 hover:bg-emerald-500 flex justify-center items-center gap-3">
                   {isGeneratingCheckout ? <Activity className="animate-spin" size={20}/> : <><ShieldCheck size={18}/> Gerar PIX Seguro</>}
                 </button>
              </div>
           </div>
        </div>
      )}

      {toastMsg && <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-10 py-5 rounded-full font-black shadow-[0_20px_50px_rgba(37,99,235,0.5)] flex items-center gap-4 text-sm animate-bounce border border-white/10"><CheckCircle2 size={24} /> {toastMsg}</div>}
    </div>
  );
}