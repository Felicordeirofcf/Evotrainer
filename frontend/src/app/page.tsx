'use client';

import React, { useState, useEffect, useRef } from 'react';
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

        <button className="md:hidden text-slate-400" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
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

const FeatureCard = ({ icon: Icon, title, desc, color }: any) => (
  <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800 hover:border-slate-600 transition-all group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 blur-[50px] rounded-full group-hover:opacity-20 transition-all duration-700`} />
    <div
      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${color.replace('bg-', 'bg-opacity-20 text-').replace('500', '500 bg-opacity-20')}`}
      style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
    >
      <Icon size={28} className={color.replace('bg-', 'text-')} />
    </div>
    <h3 className="text-xl font-black text-white mb-4 leading-tight">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm font-medium">{desc}</p>
  </div>
);

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

    {price !== "0,00" && (
      <p className="text-center text-[10px] text-slate-500 mt-5 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
        <ShieldCheck size={14} className="text-emerald-500" /> Pagamento Seguro
      </p>
    )}
  </div>
);

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
  const [isCreatingCharge, setIsCreatingCharge] = useState(false);

  const paymentPollingRef = useRef<number | null>(null);

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

  const [showCpfModal, setShowCpfModal] = useState(false);
  const [cpfInput, setCpfInput] = useState('');

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

  const atualizarPerfil = async () => {
    if (!token) return null;

    try {
      const resMe = await fetch(`${API_URL}/me`, { headers: getAuthHeaders() });
      if (!resMe.ok) return null;

      const userData = await resMe.json();
      setCurrentUser(userData);
      localStorage.setItem('treino_ai_user', JSON.stringify(userData));
      return userData;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const iniciarMonitoramentoPlano = () => {
    if (paymentPollingRef.current) {
      window.clearInterval(paymentPollingRef.current);
    }

    let tentativas = 0;

    paymentPollingRef.current = window.setInterval(async () => {
      tentativas += 1;

      const userAtualizado = await atualizarPerfil();

      if (userAtualizado?.plano === 'PRO' || userAtualizado?.plano === 'ELITE') {
        if (paymentPollingRef.current) {
          window.clearInterval(paymentPollingRef.current);
          paymentPollingRef.current = null;
        }
        showToast('Pagamento confirmado! Plano PRO ativado.');
        fetchData();
        return;
      }

      if (tentativas >= 24) {
        if (paymentPollingRef.current) {
          window.clearInterval(paymentPollingRef.current);
          paymentPollingRef.current = null;
        }
      }
    }, 5000);
  };

  const abrirCheckoutAsaas = async () => {
    const cleanCpf = cpfInput.replace(/\D/g, '');
    if (cleanCpf.length < 11) return showToast("Digite um CPF/CNPJ válido.");
    
    setIsCreatingCharge(true);
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
        showToast("Escaneie o Pix! Aguardando pagamento...");
        iniciarMonitoramentoPlano();
      } else {
        showToast(data.error || "Erro ao gerar cobrança.");
      }
    } catch (e) {
      showToast("Erro de conexão ao gerar Pix.");
    } finally {
      setIsCreatingCharge(false);
    }
  };

  const faturamentoAtletas = alunos.reduce((acc, aluno) => acc + (parseFloat(aluno.price) || 0), 0);
  const faturamentoMaster = trainers.reduce((acc, t) => {
    if (t.plano === 'PRO') return acc + 39.90;
    return acc;
  }, 0);
  const faturamentoReal = isMaster ? faturamentoMaster : faturamentoAtletas;

  const isIlimitado = currentUser?.plano === 'PRO' || currentUser?.plano === 'ELITE';
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
    if (!token) return;

    try {
      const resMe = await fetch(`${API_URL}/me`, { headers: getAuthHeaders() });
      if (!resMe.ok) return;

      const userData = await resMe.json();
      setCurrentUser(userData);
      localStorage.setItem('treino_ai_user', JSON.stringify(userData));

      const isUserMaster = userData?.role === 'SUPERADMIN';
      const ep = isUserMaster ? '/superadmin/trainers' : '/alunos';

      const res = await fetch(`${API_URL}${ep}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        isUserMaster ? setTrainers(data) : setAlunos(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setToken(data.token);
        setCurrentUser(data.user);
        setShowLoginModal(false);
        localStorage.setItem('treino_ai_token', data.token);
        localStorage.setItem('treino_ai_user', JSON.stringify(data.user));
      } else {
        showToast(data.error);
      }
    } catch (e) {
      showToast("Servidor acordando...");
    } finally {
      setIsLoggingIn(false);
    }
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
        showToast("Conta criada! Redirecionando...");

        const loginRes = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formReg.email, password: formReg.password })
        });

        const loginData = await loginRes.json();

        if (loginRes.ok) {
          setToken(loginData.token);
          setCurrentUser(loginData.user);
          setShowSignupModal(false);
          localStorage.setItem('treino_ai_token', loginData.token);
          localStorage.setItem('treino_ai_user', JSON.stringify(loginData.user));
        }
      } else {
        showToast(data.error || "Erro ao criar conta.");
      }
    } catch (err) {
      showToast("Erro de conexão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverPassword = async () => {
    if (!recoverEmail) return showToast("Preencha o e-mail.");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoverEmail })
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message);
        setShowRecoverModal(false);
        setShowLoginModal(true);
        setRecoverEmail('');
      } else {
        showToast(data.error);
      }
    } catch (e) {
      showToast("Erro de rede.");
    } finally {
      setIsLoading(false);
    }
  };

  const createAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/alunos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(formAluno)
    });

    if (res.ok) {
      showToast("Aluno Incluído!");
      setShowAddAlunoModal(false);
      fetchData();
    }
  };

  const updateAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/alunos/${alunoSelecionado.id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(formAluno)
    });

    if (res.ok) {
      showToast("Dados Atualizados!");
      setShowEditAlunoModal(false);
      fetchData();
    }
  };

  const deleteAluno = async (id: number) => {
    if (!confirm("Remover aluno permanentemente?")) return;
    const res = await fetch(`${API_URL}/alunos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (res.ok) {
      showToast("Aluno Removido!");
      fetchData();
    }
  };

  const updateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/superadmin/trainers/${trainerSelecionado.id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: formTrainer.name, email: formTrainer.email, phone: formTrainer.phone })
    });

    if (res.ok) {
      showToast("Personal Atualizado!");
      setShowEditTrainerModal(false);
      fetchData();
    }
  };

  const updatePlan = async (id: number, plano: string) => {
    const res = await fetch(`${API_URL}/superadmin/trainers/${id}/plano`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ plano })
    });

    if (res.ok) {
      showToast("Plano Atualizado!");
      setShowEditPlanModal(false);
      fetchData();
    }
  };

  const deleteTrainer = async (id: number) => {
    if (!confirm("ATENÇÃO: Remover este Personal excluirá permanentemente todos os alunos e treinos dele. Prosseguir?")) return;

    const res = await fetch(`${API_URL}/superadmin/trainers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (res.ok) {
      showToast("Personal Removido!");
      fetchData();
    }
  };

  const deletePlanilha = async (planilhaId: number) => {
    if (!confirm("Deletar esta planilha do dossiê?")) return;

    const res = await fetch(`${API_URL}/treinos/${planilhaId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (res.ok) {
      showToast("Planilha Excluída!");
      setAlunoSelecionado((prev: any) => ({ ...prev, workouts: prev.workouts.filter((w: any) => w.id !== planilhaId) }));
      fetchData();
    }
  };

  const changePassword = async () => {
    const res = await fetch(`${API_URL}/perfil/senha`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordForm)
    });

    if (res.ok) {
      showToast("Senha alterada!");
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } else {
      showToast("Senha atual incorreta.");
    }
  };

  const gerarSemanaIA = async () => {
    if (iaOffline) return;

    const prompt = (document.getElementById('comandoIA') as HTMLTextAreaElement).value;
    if (!iaAlunoId || !prompt) return showToast("Dados incompletos.");

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/gerar-autonomo`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          alunoId: iaAlunoId,
          comandoPersonal: prompt,
          frequencia: iaFrequencia,
          ciclo: iaCiclo,
          semanas: iaSemanas
        })
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Periodização Criada!");
        setTabAtiva('alunos');
        fetchData();
      } else {
        showToast(data.error || "Erro na Engine IA.");
      }
    } catch (e) {
      showToast("Erro de rede.");
    } finally {
      setIsLoading(false);
    }
  };

  const calcularDataRevisao = (dataCriacao: string, semanas: string) => {
    const numSemanas = parseInt(semanas.split(' ')[0]) || 4;
    const data = new Date(dataCriacao);
    data.setDate(data.getDate() + (numSemanas * 7));
    return data.toLocaleDateString('pt-BR');
  };

  const exportarPDF = (treino: any, aluno: any) => {
    const primaryColor = "#2563eb";
    const dataCriado = new Date(treino.createdAt).toLocaleDateString('pt-BR');
    const dataRevisao = calcularDataRevisao(treino.createdAt, treino.duration || '4 Semanas');

    const rows = treino.exercises?.map((ex: any, i: number) => {
      const youtubeLink = ex.youtubeId
        ? `https://www.youtube.com/watch?v=${ex.youtubeId}`
        : `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' execução biomecânica')}`;

      return `<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 16px; font-weight: 800; color: ${primaryColor}; font-size: 18px;">${String(i + 1).padStart(2, '0')}</td><td style="padding: 16px;"><div style="font-weight: 800; color: #1e293b; font-size: 16px; text-transform: uppercase;">${ex.name}</div><div style="color: #64748b; font-size: 13px; margin-top: 4px;">Séries: ${ex.sets} | Carga: ${ex.weight}</div></td><td style="padding: 16px; text-align: right;"><a href="${youtubeLink}" target="_blank" style="background: #ff0000; color: white; padding: 10px 15px; border-radius: 8px; text-decoration: none; font-weight: 900; font-size: 10px;">VÍDEO 🎬</a></td></tr>`;
    }).join('');

    const html = `<html><head><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap'); body { font-family: 'Inter', sans-serif; margin: 0; background: #f8fafc; } .header { background: ${primaryColor}; color: white; padding: 40px; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; } .container { max-width: 800px; margin: -20px auto 40px; background: white; border-radius: 30px; box-shadow: 0 20px 25px rgba(0,0,0,0.1); overflow: hidden; } table { width: 100%; border-collapse: collapse; }</style></head>
      <body>
        <div class="header"><div style="display:flex; justify-content:space-between; align-items:center;"><div><h1 style="margin:0; font-weight:900; font-style:italic;">EVOTRAINER</h1><p style="margin:5px 0 0; font-weight:700; text-transform:uppercase; font-size:12px;">Periodização de Elite</p></div><div style="text-align:right;"><div style="font-weight:900; font-size:20px;">${aluno.name.toUpperCase()}</div><div style="font-size:12px;">Ficha: ${treino.title}</div></div></div></div>
        <div class="container"><div style="padding:20px 30px; background: #eff6ff; display:flex; gap:20px; border-bottom: 1px solid #e2e8f0;"><div style="flex:1"><span style="font-size:10px; font-weight:900; color:#3b82f6; text-transform:uppercase;">Enviado em</span><br/><strong style="color:#1e3a8a">${dataCriado}</strong></div><div style="flex:1"><span style="font-size:10px; font-weight:900; color:#ef4444; text-transform:uppercase;">Data de Revisão</span><br/><strong style="color:#991b1b">${dataRevisao}</strong></div></div><div style="padding:20px 30px; border-bottom:2px solid #f1f5f9; display:flex; gap:20px;"><div style="flex:1; background:#f8fafc; padding:15px; border-radius:15px; border:1px solid #e2e8f0;"><span style="font-size:10px; font-weight:900; color:#64748b; display:block; text-transform:uppercase;">Nível</span><span style="font-weight:800; color:${primaryColor};">${aluno.level}</span></div><div style="flex:1; background:#f8fafc; padding:15px; border-radius:15px; border:1px solid #e2e8f0;"><span style="font-size:10px; font-weight:900; color:#64748b; display:block; text-transform:uppercase;">Peso</span><span style="font-weight:800; color:${primaryColor};">${aluno.weight || '--'}kg</span></div></div><table><tbody>${rows}</tbody></table></div>
        <div style="text-align:center; padding: 20px; font-size:12px; color: #64748b;"><strong>EVOTRAINER™</strong> - Ciência e Resultado</div>
        <script>window.onload=()=>window.print()</script>
      </body></html>`;

    const win = window.open('', '_blank');
    win?.document.write(html);
    win?.document.close();
  };

  const enviarWhatsApp = (aluno: any, treino: any) => {
    const cleanPhone = aluno.phone?.replace(/\D/g, '');
    const dataRev = calcularDataRevisao(treino.createdAt, treino.duration || '4 Semanas');
    const msg = encodeURIComponent(`Fala ${aluno.name.split(' ')[0]}! 💪 Seu novo protocolo "${treino.title}" já está disponível no EvoTrainer.\n\n📅 Nossa próxima revisão de treino será em: *${dataRev}*.\nBora esmagar!`);
    window.open(`https://wa.me/55${cleanPhone}?text=${msg}`, '_blank');
  };

  const irParaWhatsApp = () => {
    const msg = encodeURIComponent("Fala equipe EvoTrainer! Quero escalar minha consultoria, como funciona a plataforma?");
    window.open(`https://wa.me/5521987708652?text=${msg}`, '_blank');
  };

  useEffect(() => {
    const t = localStorage.getItem('treino_ai_token');
    const u = localStorage.getItem('treino_ai_user');

    if (t && u) {
      setToken(t);
      setCurrentUser(JSON.parse(u));
    }

    if (!document.getElementById('meta-pixel-script')) {
      const fbScript = document.createElement('script');
      fbScript.id = 'meta-pixel-script';
      fbScript.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', 'SEU_PIXEL_ID_AQUI'); fbq('track', 'PageView');`;
      document.head.appendChild(fbScript);
    }
  }, []);

  useEffect(() => {
    if (token) fetchData();
  }, [token, tabAtiva]);

  useEffect(() => {
    return () => {
      if (paymentPollingRef.current) {
        window.clearInterval(paymentPollingRef.current);
        paymentPollingRef.current = null;
      }
    };
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30">
        <Navbar onOpenSignup={() => setShowSignupModal(true)} onOpenLogin={() => setShowLoginModal(true)} />

        <section className="pt-40 pb-20 px-6 overflow-hidden relative">
          <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-full mb-10 animate-fade-in shadow-xl">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
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
                <Zap size={18} /> GERAR MEUS 5 TREINOS GRÁTIS
              </button>
              <button onClick={irParaWhatsApp} className="w-full sm:w-auto bg-slate-900 border border-slate-800 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
                <MessageCircle size={18} /> Falar com Especialista
              </button>
            </div>

            <p className="mt-6 text-slate-500 font-bold text-[11px] uppercase tracking-widest">Nenhum cartão de crédito exigido no teste.</p>
          </div>

          <div className="max-w-6xl mx-auto mt-24 relative px-4 z-10">
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-2 md:p-4 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_100px_rgba(37,99,235,0.15)] border border-slate-700/50">
              <div className="bg-slate-950 rounded-[2rem] md:rounded-[3.5rem] aspect-[16/10] md:aspect-[21/9] flex items-center justify-center relative overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" alt="Dashboard" className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-70 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
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

        <section id="funcionalidades" className="py-32 px-6 relative border-t border-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">Recursos de Alta Performance</h2>
              <p className="text-slate-500 font-black uppercase text-xs tracking-[0.3em]">Tudo que você precisa para escalar, em um só lugar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard icon={Sparkles} color="bg-blue-500" title="IA Periodizada" desc="Digite o foco e nossa IA gera a semana inteira de treinos respeitando lesões e nível do aluno." />
              <FeatureCard icon={FileText} color="bg-red-500" title="Planilhas Premium" desc="Exporte treinos em PDFs lindíssimos com botões que abrem vídeos explicativos no YouTube." />
              <FeatureCard icon={TrendingUp} color="bg-emerald-500" title="CRM Financeiro" desc="Cadastre a mensalidade de cada aluno e acompanhe o crescimento real do seu faturamento." />
              <FeatureCard icon={MessageCircle} color="bg-green-500" title="WhatsApp Nativo" desc="Com 1 clique, dispare mensagens automáticas sobre a nova ficha direto no WhatsApp do aluno." />
            </div>
          </div>
        </section>

        <section id="precos" className="py-32 px-6 relative border-t border-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950 pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">Um preço. Retorno Infinito.</h2>
              <p className="text-slate-500 font-black uppercase text-xs tracking-[0.3em]">Custa menos que a mensalidade de UM aluno.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <PlanCard
                title="Test Drive"
                price="0,00"
                subPrice="100% Grátis para testar"
                features={["Até 5 Treinos por IA", "Gestão de Alunos Básica", "PDF simples"]}
                onAction={() => setShowSignupModal(true)}
              />
              <PlanCard
                title="Plano Mensal"
                price="39,90"
                subPrice="Por Mês (Sem fidelidade)"
                badge="ACESSO TOTAL"
                highlighted={true}
                features={["Alunos Ilimitados", "Treinos por IA Ilimitados", "PDF Premium com Vídeos", "Dashboard Financeiro", "WhatsApp Nativo"]}
                onAction={() => setShowSignupModal(true)}
              />
            </div>
          </div>
        </section>

        <footer className="py-16 px-6 border-t border-slate-900 bg-slate-950">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                <div className="bg-blue-600 p-2 rounded-xl text-white"><Dumbbell size={20} /></div>
                <span className="text-xl font-black tracking-tighter text-white">EVO<span className="text-blue-500">TRAINER</span></span>
              </div>
              <p className="text-slate-600 text-xs font-bold uppercase tracking-[0.2em]">Tecnologia para Personal Trainers de Elite.</p>
            </div>

            <div className="flex gap-8 text-slate-500 font-black text-[10px] uppercase tracking-widest">
              <button onClick={() => setShowLoginModal(true)} className="hover:text-blue-500 transition-colors">Login Painel</button>
            </div>
          </div>
        </footer>

        {showLoginModal && (
          <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in text-slate-50">
            <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3.5rem] w-full max-w-md shadow-2xl relative">
              <button onClick={() => setShowLoginModal(false)} className="absolute top-8 right-8 p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><X size={24} /></button>
              <div className="text-center mb-8">
                <Dumbbell className="text-blue-500 mx-auto mb-4" size={40} />
                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Login</h3>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">E-mail de Acesso</label>
                  <input type="email" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 font-bold transition-all" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Senha Segura</label>
                  <input type="password" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 font-bold transition-all" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                </div>

                <div className="text-right mt-1">
                  <button type="button" onClick={() => { setShowLoginModal(false); setShowRecoverModal(true); }} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-500 transition-all">Esqueceu a Senha?</button>
                </div>

                <button className="w-full p-6 bg-blue-600 rounded-[2rem] font-black text-white uppercase active:scale-95 transition-all shadow-xl mt-4 hover:bg-blue-500">
                  {isLoggingIn ? 'Entrando...' : 'Acessar Dashboard'}
                </button>
              </form>
            </div>
          </div>
        )}

        {showSignupModal && (
          <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in text-slate-50">
            <div className="bg-slate-900 border border-slate-800 p-10 md:p-12 rounded-[3.5rem] w-full max-w-lg shadow-[0_0_80px_rgba(37,99,235,0.15)] relative">
              <button onClick={() => setShowSignupModal(false)} className="absolute top-8 right-8 p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><X size={24} /></button>
              <div className="text-center mb-10">
                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Criar Conta</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Acesso de Personal Trainer</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6 text-left">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Nome Completo</label>
                  <input type="text" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500 transition-all" value={formReg.name} onChange={e => setFormReg({ ...formReg, name: e.target.value })} />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">E-mail Profissional</label>
                  <input type="email" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500 transition-all" value={formReg.email} onChange={e => setFormReg({ ...formReg, email: e.target.value })} />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">WhatsApp</label>
                  <input type="tel" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500 transition-all" value={formReg.phone} onChange={e => setFormReg({ ...formReg, phone: e.target.value })} />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Crie uma Senha Segura</label>
                  <input type="password" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500 transition-all" value={formReg.password} onChange={e => setFormReg({ ...formReg, password: e.target.value })} />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-blue-600 text-white font-black rounded-[2rem] shadow-2xl uppercase tracking-widest text-xs active:scale-95 hover:bg-blue-500 flex justify-center items-center gap-2">
                  {isSubmitting ? <Activity className="animate-spin" size={20} /> : 'Concluir Cadastro'}
                </button>
              </form>
            </div>
          </div>
        )}

        {showRecoverModal && (
          <div className="fixed inset-0 bg-black/98 z-[999] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in text-slate-50">
            <div className="bg-slate-900 border border-slate-800 p-10 md:p-12 rounded-[3.5rem] w-full max-w-md shadow-2xl text-center relative">
              <button onClick={() => setShowRecoverModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-all"><X size={24} /></button>
              <h3 className="text-2xl font-black text-white mb-2 italic uppercase tracking-tighter">Recuperar Acesso</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8">Enviaremos instruções seguras</p>

              <div className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">E-mail Cadastrado</label>
                  <input type="email" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 font-bold transition-all" value={recoverEmail} onChange={e => setRecoverEmail(e.target.value)} />
                </div>

                <button onClick={handleRecoverPassword} disabled={isLoading} className="w-full py-6 bg-blue-600 text-white font-black rounded-[2rem] active:scale-95 shadow-xl transition-all uppercase tracking-widest text-[11px] mt-4 hover:bg-blue-500 flex justify-center items-center gap-2">
                  {isLoading ? <Activity className="animate-spin" size={20} /> : 'Enviar Instruções'}
                </button>
              </div>
            </div>
          </div>
        )}

        {toastMsg && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-10 py-5 rounded-full font-black shadow-2xl">
            <CheckCircle2 size={24} className="inline mr-2" />
            {toastMsg}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      <header className="p-6 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-black text-xl italic tracking-tighter uppercase leading-none">
          EVO<span className={isMaster ? 'text-red-500' : 'text-blue-500'}>{isMaster ? 'MASTER' : 'TRAINER'}</span>
        </h1>
        <button
          onClick={() => {
            if (paymentPollingRef.current) {
              window.clearInterval(paymentPollingRef.current);
              paymentPollingRef.current = null;
            }
            localStorage.clear();
            window.location.reload();
          }}
          className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:bg-red-500 transition-all border border-slate-700 shadow-xl"
        >
          <LogOut size={18} />
        </button>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full pb-40 animate-fade-in">
        {tabAtiva === 'dashboard' && (
          <div className="space-y-10">
            <h2 className="text-4xl font-black italic tracking-tight uppercase text-white text-center sm:text-left">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title={isMaster ? "Total Personais" : "Total Alunos"} value={isMaster ? trainers.length : alunos.length} icon={Users} color="bg-blue-500" />
              <StatCard title={isMaster ? "Receita (SaaS)" : "Faturamento"} value={`R$ ${faturamentoReal.toFixed(2).replace('.', ',')}`} icon={DollarSign} color="bg-emerald-500" />
              <StatCard title="Engine IA" value={iaStatusText} icon={Zap} color={iaOffline ? "bg-red-500" : "bg-indigo-500"} />
              <StatCard title="Status" value="OK" icon={Target} color="bg-amber-500" />
            </div>
          </div>
        )}

        {tabAtiva === 'alunos' && (
          <div className="space-y-10">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black italic uppercase">{isMaster ? 'Gestão de Personais' : 'Gestão de Alunos'}</h2>
              {!isMaster && (
                <button
                  onClick={() => {
                    setFormAluno({ name: '', email: '', phone: '', weight: '', height: '', level: 'Intermediário', anamnese: '', price: '' });
                    setShowAddAlunoModal(true);
                  }}
                  className="bg-blue-600 px-8 py-5 rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all"
                >
                  <Plus size={16} className="inline mr-2" /> Incluir Aluno
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(isMaster ? trainers : alunos).map(item => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[3.5rem] shadow-xl hover:border-slate-700 transition-all flex flex-col gap-6 relative overflow-hidden">
                  {item.price && !isMaster && (
                    <div className="absolute top-6 right-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[11px] px-4 py-2 rounded-xl backdrop-blur-md">
                      R$ {item.price}
                    </div>
                  )}

                  <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-[1.5rem] ${isMaster ? 'bg-red-600/10 text-red-500 border-red-500/10' : 'bg-blue-600/10 text-blue-500 border-blue-500/10'} flex items-center justify-center font-black text-2xl border`}>
                      {item.name ? item.name[0].toUpperCase() : '?'}
                    </div>
                    <div>
                      <h3 className="font-black text-xl leading-none pr-12">{item.name}</h3>
                      <p className="text-xs text-slate-500 mt-2">{item.email}</p>
                      {isMaster && <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-widest">Plano: {item.plano}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    {isMaster ? (
                      <>
                        <button onClick={() => { setTrainerSelecionado(item); setShowEditPlanModal(true); }} className="flex-1 bg-slate-800 text-white p-5 rounded-2xl font-black text-[10px] uppercase shadow-xl active:scale-95 hover:bg-slate-700 transition-all">Alterar Plano</button>
                        <button onClick={() => { setTrainerSelecionado(item); setFormTrainer({ name: item.name, email: item.email, phone: item.phone || '', plano: item.plano }); setShowEditTrainerModal(true); }} className="p-5 bg-blue-600/10 text-blue-500 rounded-2xl shadow-xl hover:bg-blue-600 hover:text-white transition-all"><Edit2 size={22} /></button>
                        <button onClick={() => deleteTrainer(item.id)} className="p-5 bg-red-600/10 text-red-500 rounded-2xl shadow-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={22} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setAlunoSelecionado(item); setShowGerenciarTreinosModal(true); }} className="flex-1 bg-blue-600 text-white p-5 rounded-2xl font-black text-[10px] uppercase shadow-xl active:scale-95 hover:bg-blue-500 transition-all">Gerenciar Treino</button>
                        <button onClick={() => { setAlunoSelecionado(item); setFormAluno({ name: item.name, email: item.email, phone: item.phone || '', weight: item.weight || '', height: item.height || '', level: item.level || 'Intermediário', anamnese: item.anamnese || '', price: item.price || '' }); setShowEditAlunoModal(true); }} className="p-5 bg-blue-600/10 text-blue-500 rounded-2xl shadow-xl hover:bg-blue-600 hover:text-white transition-all"><Edit2 size={22} /></button>
                        <button onClick={() => deleteAluno(item.id)} className="p-5 bg-red-600/10 text-red-500 rounded-2xl shadow-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={22} /></button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tabAtiva === 'ia' && (
          <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-40 text-center">
            <div className={`bg-gradient-to-br ${iaOffline ? 'from-red-700 to-red-950 border-red-500/30' : 'from-indigo-700 to-blue-900 border-white/10'} p-16 rounded-[4rem] shadow-2xl relative overflow-hidden border text-center transition-all`}>
              {iaOffline ? <Lock size={100} className="mx-auto text-red-200 mb-8" /> : <Sparkles size={100} className="mx-auto text-white mb-8 animate-pulse" />}
              <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">EvoIntelligence™</h2>
              <p className="text-white/80 mt-4 leading-relaxed italic text-lg">{iaOffline ? "Você atingiu o limite de testes. Faça o upgrade para continuar." : "Engine Autônoma de Periodização Semanal"}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3.5rem] shadow-2xl text-left space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4">1. Selecionar Aluno</label>
                  <select disabled={iaOffline} value={iaAlunoId} onChange={e => setIaAlunoId(e.target.value)} className="w-full p-8 bg-slate-950 border-2 border-slate-800 rounded-[2rem] text-white font-black text-xl outline-none focus:border-blue-500 cursor-pointer appearance-none">
                    <option value="">Acessar lista...</option>
                    {alunos.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4">2. Dias na Semana</label>
                  <select disabled={iaOffline} value={iaFrequencia} onChange={e => setIaFrequencia(e.target.value)} className="w-full p-8 bg-slate-950 border-2 border-slate-800 rounded-[2rem] text-white font-black text-xl outline-none focus:border-blue-500 cursor-pointer appearance-none">
                    {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} dias na semana</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4">3. Fase do Ciclo</label>
                  <select disabled={iaOffline} value={iaCiclo} onChange={e => setIaCiclo(e.target.value)} className="w-full p-6 bg-slate-950 border-2 border-slate-800 rounded-[2rem] text-white font-black text-lg outline-none focus:border-blue-500 appearance-none">
                    <option>Microciclo (Choque/Recuperação)</option>
                    <option>Mesociclo (Hipertrofia/Força)</option>
                    <option>Macrociclo (Preparação Longa)</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4">4. Duração (Validade)</label>
                  <select disabled={iaOffline} value={iaSemanas} onChange={e => setIaSemanas(e.target.value)} className="w-full p-6 bg-slate-950 border-2 border-slate-800 rounded-[2rem] text-white font-black text-lg outline-none focus:border-blue-500 appearance-none">
                    {[1, 2, 3, 4, 5, 6, 8, 12].map(n => <option key={n} value={n}>{n} Semanas</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4">5. Comando da Periodização</label>
                <textarea disabled={iaOffline} id="comandoIA" placeholder="Ex: Monte um ABCDE focado em hipertrofia máxima, priorizando ombros..." className="w-full p-8 bg-slate-950 border-2 border-slate-800 rounded-[3rem] text-white font-medium text-lg min-h-[200px] outline-none shadow-inner" />
              </div>

              <button
                onClick={iaOffline ? () => setShowCpfModal(true) : gerarSemanaIA}
                disabled={isLoading || isCreatingCharge}
                className={`w-full py-10 font-black rounded-[2.5rem] shadow-2xl active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-4 ${iaOffline ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-white text-blue-900 hover:bg-blue-50'} disabled:opacity-60`}
              >
                {isLoading ? (
                  <Activity className="animate-spin" size={30} />
                ) : isCreatingCharge ? (
                  <>
                    <Activity className="animate-spin" size={24} /> Gerando cobrança...
                  </>
                ) : iaOffline ? (
                  <>
                    <Lock size={24} /> Fazer Upgrade (R$ 39,90)
                  </>
                ) : (
                  <>
                    <Zap size={24} /> Ativar Engine Biomecânica
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {tabAtiva === 'perfil' && (
          <div className="max-w-4xl mx-auto animate-fade-in pb-40">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2 flex flex-col gap-6">
                <div className={`p-10 rounded-[3.5rem] border flex flex-col items-center text-center justify-center relative overflow-hidden shadow-2xl ${isIlimitado || isMaster ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-blue-500/30' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="w-28 h-28 bg-slate-950 text-blue-500 rounded-[2rem] flex items-center justify-center text-4xl font-black mb-6 border border-slate-800 shadow-inner">
                    {getInitial()}
                  </div>

                  <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{currentUser?.name || 'Usuário'}</h3>
                  <p className="text-slate-500 text-sm mt-2">{currentUser?.email}</p>

                  <div className="w-full mt-8 bg-slate-950 p-6 rounded-[2rem] border border-slate-800">
                    {isMaster ? (
                      <div className="text-red-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                        <Crown size={16} /> Acesso Master
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Plano Atual</span>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isIlimitado ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                            {currentUser?.plano}
                          </span>
                        </div>

                        {isIlimitado ? (
                          <div className="space-y-4 text-left">
                            <div className="flex items-center gap-3 text-slate-300 text-sm"><CreditCard size={16} className="text-emerald-500" /> Pagamento: <span className="font-bold ml-auto">{paymentDate || 'Ativação Manual'}</span></div>
                            <div className="flex items-center gap-3 text-slate-300 text-sm"><Calendar size={16} className="text-blue-500" /> Vencimento: <span className="font-bold ml-auto">{planExpiresDate ? planExpiresDate.toLocaleDateString('pt-BR') : 'Vitalício'}</span></div>
                            {daysRemaining > 0 && <div className="flex items-center gap-3 text-slate-300 text-sm"><Clock size={16} className="text-amber-500" /> Faltam: <span className="font-bold ml-auto text-amber-500">{daysRemaining} dias</span></div>}
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Você está usando a versão de teste (Acesso Limitado).</p>
                            <button
                              onClick={() => setShowCpfModal(true)}
                              disabled={isCreatingCharge}
                              className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-widest hover:bg-emerald-500 disabled:opacity-60"
                            >
                              {isCreatingCharge ? 'Gerando cobrança...' : 'Ativar Plano PRO'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:w-1/2 flex flex-col gap-6">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3.5rem] shadow-xl">
                  <h4 className="text-white font-black text-xl italic uppercase tracking-tighter mb-6">Segurança</h4>
                  <div className="space-y-4">
                    <button onClick={() => setShowPasswordModal(true)} className="w-full bg-slate-950 border border-slate-800 p-6 rounded-[2rem] font-black text-[11px] text-white uppercase tracking-widest flex items-center gap-4 hover:border-slate-600 transition-all">
                      <div className="bg-slate-900 p-3 rounded-xl"><Lock size={18} className="text-slate-400" /></div>
                      Alterar minha Senha
                    </button>

                    <button className="w-full bg-slate-950 border border-slate-800 p-6 rounded-[2rem] font-black text-[11px] text-slate-500 uppercase tracking-widest flex items-center gap-4 cursor-not-allowed">
                      <div className="bg-slate-900 p-3 rounded-xl"><Camera size={18} className="text-slate-600" /></div>
                      Mudar Foto (Em breve)
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[3.5rem] shadow-xl flex items-center justify-center flex-1">
                  <button
                    onClick={() => {
                      if (paymentPollingRef.current) {
                        window.clearInterval(paymentPollingRef.current);
                        paymentPollingRef.current = null;
                      }
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="w-full py-6 bg-red-600/10 border border-red-500/20 text-red-500 font-black rounded-[2rem] hover:bg-red-600 hover:text-white active:scale-95 transition-all text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} /> Sair da Conta
                  </button>
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
          <button key={item.id} onClick={() => setTabAtiva(item.id)} className={`flex flex-col items-center gap-2 group transition-all transform active:scale-75 ${tabAtiva === item.id ? 'scale-125' : 'opacity-30 hover:opacity-100'}`}>
            <item.icon size={28} className={tabAtiva === item.id ? (isMaster ? 'text-red-500' : 'text-blue-500') : 'text-white'} strokeWidth={tabAtiva === item.id ? 2.5 : 2} />
            <span className={`text-[7px] font-black uppercase tracking-widest ${tabAtiva === item.id ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* MODAL: EDITAR TRAINER (SUPERADMIN) */}
      {showEditTrainerModal && isMaster && trainerSelecionado && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in text-slate-50">
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[4rem] w-full max-w-2xl shadow-2xl relative">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800">
              <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Editar Personal</h3>
              <button onClick={() => setShowEditTrainerModal(false)} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><X size={28} /></button>
            </div>

            <form onSubmit={updateTrainer} className="space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Nome Completo</label>
                  <input type="text" required className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500" value={formTrainer.name} onChange={e => setFormTrainer({ ...formTrainer, name: e.target.value })} />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">E-mail Profissional</label>
                  <input type="email" required className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500" value={formTrainer.email} onChange={e => setFormTrainer({ ...formTrainer, email: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">WhatsApp</label>
                <input type="tel" required className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500" value={formTrainer.phone} onChange={e => setFormTrainer({ ...formTrainer, phone: e.target.value })} />
              </div>

              <button type="submit" className="w-full py-8 bg-blue-600 text-white font-black rounded-[2.5rem] shadow-2xl uppercase tracking-widest text-[12px] active:scale-95 transition-all mt-4 hover:bg-blue-500">
                Atualizar Personal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR PLANO (SUPERADMIN) */}
      {showEditPlanModal && isMaster && trainerSelecionado && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in text-slate-50">
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-[4rem] w-full max-w-md shadow-2xl text-center relative">
            <button onClick={() => setShowEditPlanModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-white"><X size={24} /></button>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">Alterar Plano</h3>
            <p className="text-slate-500 mb-10 font-medium uppercase tracking-widest">{trainerSelecionado.name}</p>

            <div className="space-y-4">
              {['TESTE', 'MENSAL'].map(p => {
                const bdValue = p === 'TESTE' ? 'GRATIS' : 'PRO';
                return (
                  <button key={p} onClick={() => updatePlan(trainerSelecionado.id, bdValue)} className={`w-full p-6 rounded-3xl font-black text-[12px] uppercase border transition-all ${trainerSelecionado.plano === bdValue ? 'bg-red-600 text-white border-red-600 shadow-2xl' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                    PLANO {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INCLUIR / EDITAR ALUNO */}
      {(showAddAlunoModal || showEditAlunoModal) && !isMaster && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in text-slate-50">
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[4rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800">
              <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{showAddAlunoModal ? 'Incluir Aluno' : 'Editar Aluno'}</h3>
              <button onClick={() => { setShowAddAlunoModal(false); setShowEditAlunoModal(false); }} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><X size={28} /></button>
            </div>

            <form onSubmit={showAddAlunoModal ? createAluno : updateAluno} className="space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Nome Completo</label>
                  <input type="text" required className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500" value={formAluno.name} onChange={e => setFormAluno({ ...formAluno, name: e.target.value })} />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">E-mail de Login</label>
                  <input type="email" required className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500" value={formAluno.email} onChange={e => setFormAluno({ ...formAluno, email: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">WhatsApp</label>
                  <input type="tel" required className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500" value={formAluno.phone} onChange={e => setFormAluno({ ...formAluno, phone: e.target.value })} />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Valor Mensalidade</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">R$</span>
                    <input type="number" step="0.01" className="w-full p-6 pl-14 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500" value={formAluno.price} onChange={e => setFormAluno({ ...formAluno, price: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Nível de Treino</label>
                  <select className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-black outline-none focus:border-blue-500 appearance-none cursor-pointer" value={formAluno.level} onChange={e => setFormAluno({ ...formAluno, level: e.target.value })}>
                    <option>Iniciante</option>
                    <option>Intermediário</option>
                    <option>Avançado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Prontuário Médico / Restrições (IA)</label>
                <textarea className="w-full p-8 bg-slate-950 border border-slate-800 rounded-[2.5rem] text-white min-h-[150px] outline-none focus:border-blue-500 shadow-inner" value={formAluno.anamnese} onChange={e => setFormAluno({ ...formAluno, anamnese: e.target.value })} />
              </div>

              <button type="submit" className="w-full py-8 bg-blue-600 text-white font-black rounded-[2.5rem] shadow-2xl uppercase tracking-widest text-[12px] active:scale-95 transition-all mt-4 hover:bg-blue-500">
                {showAddAlunoModal ? 'Salvar e Integrar IA' : 'Atualizar Dados do Aluno'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MUDAR SENHA */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/98 z-[800] flex items-center justify-center p-6 backdrop-blur-md text-slate-50">
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] w-full max-w-md shadow-2xl text-center relative">
            <h3 className="text-2xl font-black text-white mb-8 italic uppercase tracking-tighter">Segurança</h3>
            <div className="space-y-5 text-left">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Senha Atual</label>
                <input type="password" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 font-bold" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Nova Senha Segura</label>
                <input type="password" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 font-bold" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              </div>

              <button onClick={changePassword} className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl active:scale-95 shadow-xl transition-all uppercase tracking-widest text-[11px] mt-6 hover:bg-blue-500">
                Atualizar Agora
              </button>

              <button onClick={() => setShowPasswordModal(false)} className="w-full py-2 text-slate-600 font-bold text-xs uppercase hover:text-white transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GERENCIAR TREINOS (DOSSIÊ) */}
      {showGerenciarTreinosModal && !isMaster && alunoSelecionado && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in text-slate-50">
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-[4rem] w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-8">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight uppercase italic">{alunoSelecionado.name}</h3>
                <p className="text-[10px] text-blue-500 font-black uppercase mt-2 tracking-widest">Gestão de Treinos</p>
              </div>
              <button onClick={() => setShowGerenciarTreinosModal(false)} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><X size={28} /></button>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {(!alunoSelecionado.workouts || alunoSelecionado.workouts.length === 0) ? (
                <div className="text-center py-20 text-slate-700 font-black uppercase text-xs tracking-widest border-2 border-dashed border-slate-800 rounded-[2rem]">
                  Nenhuma ficha no banco.
                </div>
              ) : (
                alunoSelecionado.workouts.map((w: any) => {
                  const dataCriacao = new Date(w.createdAt).toLocaleDateString('pt-BR');
                  const dataRevisao = calcularDataRevisao(w.createdAt, w.duration || '4');

                  return (
                    <div key={w.id} className="bg-slate-950 p-6 rounded-[2.5rem] border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 group hover:border-blue-500/50 transition-all shadow-inner">
                      <div className="flex-1">
                        <p className="font-black text-blue-400 uppercase text-sm tracking-tight leading-tight">{w.title}</p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Enviado: {dataCriacao}</span>
                          <span className="text-[10px] font-bold text-red-500 uppercase">Revisar: {dataRevisao}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => exportarPDF(w, alunoSelecionado)} className="p-4 bg-blue-600 text-white rounded-xl shadow-xl active:scale-90 hover:bg-blue-500 transition-all" title="Baixar PDF"><Download size={18} /></button>
                        <button onClick={() => enviarWhatsApp(alunoSelecionado, w)} className="p-4 bg-emerald-600 text-white rounded-xl shadow-xl active:scale-90 hover:bg-emerald-500 transition-all" title="Avisar no WhatsApp"><MessageCircle size={18} /></button>
                        <button onClick={() => deletePlanilha(w.id)} className="p-4 bg-red-600/20 text-red-500 rounded-xl shadow-xl active:scale-90 hover:bg-red-600 hover:text-white transition-all" title="Excluir"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* NOVO MODAL: CPF E GERAR COBRANÇA */}
      {showCpfModal && (
        <div className="fixed inset-0 bg-black/98 z-[900] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in text-slate-50">
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] w-full max-w-md shadow-2xl relative text-center">
            <button onClick={() => setShowCpfModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-white transition-all"><X size={24} /></button>
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
              <button
                onClick={abrirCheckoutAsaas}
                disabled={isGeneratingCheckout}
                className="w-full py-6 bg-emerald-600 text-white font-black rounded-3xl active:scale-95 shadow-xl transition-all uppercase tracking-widest text-[11px] mt-4 hover:bg-emerald-500 flex justify-center items-center gap-3 disabled:opacity-60"
              >
                {isGeneratingCheckout ? <Activity className="animate-spin" size={20} /> : <><ShieldCheck size={18} /> Gerar PIX Seguro</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-10 py-5 rounded-full font-black shadow-[0_20px_50px_rgba(37,99,235,0.5)] flex items-center gap-4 text-sm animate-bounce border border-white/10">
          <CheckCircle2 size={24} /> {toastMsg}
        </div>
      )}
    </div>
  );
}