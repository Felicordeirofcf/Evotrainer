'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, LogOut, CheckCircle2, Flame, Play, X, User as UserIcon, Plus, Activity, Dumbbell,
  Trash2, Ban, Unlock, Home, List, AlertTriangle, Pencil, Link as LinkIcon, Lock, Camera, Save, Search,
  Download, Sparkles, Youtube, ChevronRight, MessageCircle, Crown, Check, ShieldAlert, Zap, 
  TrendingUp, DollarSign, Target, Clock, Filter, BarChart3, Settings, Globe
} from 'lucide-react';

// ==========================================
// CONFIGURAÇÕES DE ENDPOINT
// ==========================================
const API_URL = "https://evotrainer.onrender.com/api";

const extractYouTubeId = (url: string) => {
  if (!url) return '';
  if (url.length === 11 && !url.includes('http')) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
};

export default function App() {
  // --- ESTADOS DE AUTENTICAÇÃO ---
  const [currentUser, setCurrentUser] = useState<any>(null); 
  const [token, setToken] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // --- ESTADOS DE DADOS ---
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [tabAtiva, setTabAtiva] = useState('dashboard'); 
  const [alunos, setAlunos] = useState<any[]>([]); // Para o Personal
  const [trainers, setTrainers] = useState<any[]>([]); // Para o SuperAdmin
  const [busca, setBusca] = useState('');

  // --- ESTADOS DOS MODAIS ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTreinoModal, setShowTreinoModal] = useState(false);
  const [showGerenciarTreinosModal, setShowGerenciarTreinosModal] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<any>(null);
  const [isCriandoTreino, setIsCriandoTreino] = useState(false);
  const [novoTreino, setNovoTreino] = useState({ title: '', duration: '60 min', dayOfWeek: 'Segunda', exercises: [{ name: '', sets: '', weight: '', youtubeId: '' }] });

  // --- ESTADOS IA CENTER ---
  const [iaAlunoId, setIaAlunoId] = useState('');

  // ==========================================
  // COMUNICAÇÃO COM O BACKEND (RENDER)
  // ==========================================

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const getAuthHeaders = (t: string | null) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${t}`
  });

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
        localStorage.setItem('treino_ai_token', data.token);
        localStorage.setItem('treino_ai_user', JSON.stringify(data.user));
        showToast(`Bem-vindo, ${data.user.name}!`);
      } else { showToast(data.error || "Erro no login."); }
    } catch (e) { showToast("Servidor Render demorando a responder..."); }
    finally { setIsLoggingIn(false); }
  };

  const fetchData = async () => {
    const sToken = localStorage.getItem('treino_ai_token');
    if (!sToken || !currentUser) return;

    setIsLoading(true);
    try {
      if (currentUser.role === 'SUPERADMIN') {
        const res = await fetch(`${API_URL}/superadmin/trainers`, { headers: getAuthHeaders(sToken) });
        if (res.ok) setTrainers(await res.json());
      } else {
        const res = await fetch(`${API_URL}/alunos`, { headers: getAuthHeaders(sToken) });
        if (res.ok) setAlunos(await res.json());
      }
    } catch (e) { console.error("Erro ao buscar dados."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    const sToken = localStorage.getItem('treino_ai_token');
    const sUser = localStorage.getItem('treino_ai_user');
    if (sToken && sUser) {
      setToken(sToken);
      setCurrentUser(JSON.parse(sUser));
    }
  }, []);

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser, tabAtiva]);

  // ==========================================
  // GERAÇÃO DE PDF PROFISSIONAL
  // ==========================================
  const exportarPDF = (treino: any, aluno: any) => {
    const primary = currentUser.role === 'SUPERADMIN' ? '#ef4444' : '#2563eb';
    const rows = treino.exercises?.map((ex: any, i: number) => `
      <tr style="border-bottom: 1px solid #eee">
        <td style="padding: 15px; font-weight: 800; color: ${primary}">${i+1}</td>
        <td style="padding: 15px">
          <div style="font-weight: bold; font-size: 15px; text-transform: uppercase">${ex.name}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px">Séries: ${ex.sets} | Carga: ${ex.weight || 'Intenso'}</div>
        </td>
        <td style="padding: 15px; text-align: right">
          <a href="https://youtu.be/${ex.youtubeId}" style="background: ${primary}; color: white; padding: 8px 15px; border-radius: 8px; text-decoration: none; font-size: 10px; font-weight: 900">VER VÍDEO</a>
        </td>
      </tr>
    `).join('');

    const html = `
      <html>
      <head><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet"></head>
      <body style="font-family: 'Inter', sans-serif; padding: 40px; color: #0f172a">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 4px solid ${primary}; padding-bottom: 20px; margin-bottom: 30px">
          <div><h1 style="margin:0; color: ${primary}; font-size: 32px; letter-spacing: -2px">EVOTRAINER</h1><p style="margin:0; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: #64748b">CONSULTORIA DE ELITE</p></div>
          <div style="text-align: right"><p style="margin:0; font-size: 14px">Atleta: <strong>${aluno.name}</strong></p><p style="margin:0; font-size: 12px; color: #64748b">${treino.title}</p></div>
        </div>
        <table style="width: 100%; border-collapse: collapse">${rows}</table>
        <div style="margin-top: 50px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px"><p style="font-size: 10px; color: #94a3b8; font-weight: bold uppercase; letter-spacing: 1px">Treino focado gera resultado. Não pule etapas.</p></div>
        <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }</script>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(html);
    win?.document.close();
  };

  // ==================== RENDER: LOGIN ====================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative z-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-[0_10px_30px_rgba(37,99,235,0.3)]">
            <Dumbbell className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter italic">EVO<span className="text-blue-500">TRAINER</span></h1>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-10">Intelligence Management</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input type="email" placeholder="E-mail" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full p-4 pl-12 rounded-2xl bg-slate-950/50 border border-slate-800 text-white outline-none focus:border-blue-500 transition-all font-medium" />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input type="password" placeholder="Senha" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full p-4 pl-12 rounded-2xl bg-slate-950/50 border border-slate-800 text-white outline-none focus:border-blue-500 transition-all font-medium" />
            </div>
            <button disabled={isLoggingIn} className="w-full p-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all uppercase tracking-widest text-sm">
              {isLoggingIn ? <Activity className="animate-spin mx-auto" /> : 'Entrar no Sistema'}
            </button>
          </form>
        </div>
        {toastMsg && <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-4 rounded-full font-black shadow-2xl animate-fade-in z-[100]">{toastMsg}</div>}
      </div>
    );
  }

  // ==================== RENDER: DASHBOARDS ====================
  const isMaster = currentUser.role === 'SUPERADMIN';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col selection:bg-blue-500/30">
      
      {/* HEADER COMPARTILHADO */}
      <header className="p-6 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 ${isMaster ? 'bg-red-600' : 'bg-blue-600'} rounded-xl flex items-center justify-center shadow-lg`}>
            {isMaster ? <ShieldAlert size={20} className="text-white"/> : <Dumbbell size={20} className="text-white"/>}
          </div>
          <h1 className="font-black text-xl tracking-tighter">EVO<span className={isMaster ? 'text-red-500' : 'text-blue-500'}>{isMaster ? 'MASTER' : 'TRAINER'}</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
             <span className="text-xs font-black text-white">{currentUser.name}</span>
             <span className={`text-[8px] font-black uppercase tracking-widest ${isMaster ? 'text-red-400' : 'text-emerald-500'}`}>{isMaster ? 'Platform Owner' : 'Premium Coach'}</span>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={18}/>
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full pb-40">
        
        {/* ==========================================
            VIEW: SUPERADMIN (MASTER)
           ========================================== */}
        {isMaster && (
          <div className="space-y-10 animate-fade-in">
             <div className="flex justify-between items-end">
               <div>
                 <h2 className="text-4xl font-black text-white tracking-tight">Painel de Controle <span className="text-red-600 underline decoration-red-600/30">Global</span></h2>
                 <p className="text-slate-500 mt-2 font-medium italic">Gerenciando {trainers.length} personais ativos na plataforma.</p>
               </div>
               <div className="bg-red-600/10 border border-red-600/20 px-6 py-4 rounded-3xl text-center">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Faturamento Plataforma</p>
                  <p className="text-2xl font-black text-white mt-1">R$ {trainers.length * 99},00</p>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainers.map(t => (
                  <div key={t.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl hover:border-red-600/50 transition-all group">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-red-500 text-2xl group-hover:bg-red-600 group-hover:text-white transition-all">{t.name[0]}</div>
                           <div>
                             <h3 className="font-black text-lg">{t.name}</h3>
                             <p className="text-xs text-slate-500">{t.email}</p>
                           </div>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-1 rounded-lg font-black uppercase">{t.plano}</span>
                     </div>
                     <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-4 rounded-2xl text-center border border-slate-800">
                           <p className="text-[8px] font-black text-slate-500 uppercase">Alunos</p>
                           <p className="text-xl font-black text-white mt-1">{t._count?.alunos || 0}</p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl text-center border border-slate-800">
                           <p className="text-[8px] font-black text-slate-500 uppercase">Status</p>
                           <p className="text-xl font-black text-emerald-500 mt-1">Ativo</p>
                        </div>
                     </div>
                     <div className="mt-6 pt-6 border-t border-slate-800 flex gap-2">
                        <button className="flex-1 bg-slate-800 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all">Gerenciar Assinatura</button>
                        <button className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Ban size={18}/></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* ==========================================
            VIEW: PERSONAL (ADMIN)
           ========================================== */}
        {!isMaster && (
          <>
            {/* DASHBOARD TAB */}
            {tabAtiva === 'dashboard' && (
              <div className="space-y-10 animate-fade-in">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h2 className="text-4xl font-black text-white tracking-tight italic">Evo<span className="text-blue-500">Analytics</span></h2>
                      <p className="text-slate-500 mt-1 font-medium italic">Visão geral da sua consultoria.</p>
                    </div>
                    <div className="flex gap-3">
                       <button onClick={() => setTabAtiva('ia')} className="bg-slate-900 border border-slate-800 text-blue-500 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl">
                         <Sparkles size={16} /> IA Center
                       </button>
                       <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                         <Plus size={16} /> Novo Aluno
                       </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Alunos Ativos" value={alunos.length} icon={Users} color="bg-blue-500" trend="+4" />
                    <StatCard title="Faturamento Bruto" value={`R$ ${alunos.length * 120}`} icon={DollarSign} color="bg-emerald-500" trend="+R$ 240" />
                    <StatCard title="Taxa de Treinos" value="89%" icon={Target} color="bg-indigo-500" />
                    <StatCard title="Renovações" value="12" icon={Clock} color="bg-amber-500" />
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full"></div>
                       <h3 className="font-black text-xl mb-8 flex items-center gap-2"><Activity className="text-blue-500" /> Atletas em Destaque</h3>
                       <div className="space-y-6">
                          {alunos.slice(0, 5).map(a => (
                            <div key={a.id} className="flex items-center justify-between group cursor-pointer">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-blue-400 group-hover:scale-110 transition-all">{a.name[0]}</div>
                                  <div>
                                    <p className="text-sm font-black text-white">{a.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Treinando há 4 meses</p>
                                  </div>
                               </div>
                               <button onClick={() => { setAlunoSelecionado(a); setShowGerenciarTreinosModal(true); }} className="p-3 bg-slate-800/50 rounded-xl text-slate-500 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-all"><List size={18}/></button>
                            </div>
                          ))}
                       </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-700 to-blue-900 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-2xl shadow-indigo-900/40 relative overflow-hidden">
                       <Sparkles size={180} className="absolute -bottom-12 -right-12 text-white opacity-10 rotate-12" />
                       <div className="relative z-10">
                          <Zap size={30} className="text-yellow-400 mb-6" />
                          <h3 className="text-3xl font-black text-white leading-tight italic">EvoIntelligence <br/> Power</h3>
                          <p className="text-blue-100 text-sm mt-6 font-medium leading-relaxed opacity-80 italic">"Gere periodizações de nível mundial em 5 segundos usando nossa IA integrada."</p>
                       </div>
                       <button onClick={() => setTabAtiva('ia')} className="bg-white text-blue-900 font-black py-5 rounded-2xl mt-12 text-[10px] uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px] transition-all active:scale-95 relative z-10">Conectar Claude MCP</button>
                    </div>
                 </div>
              </div>
            )}

            {/* ALUNOS TAB */}
            {tabAtiva === 'alunos' && (
              <div className="space-y-10 animate-fade-in">
                 <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <h2 className="text-4xl font-black">Sua <span className="text-blue-500">Tropa</span></h2>
                    <div className="relative w-full md:w-96">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                       <input type="text" placeholder="Localizar atleta..." value={busca} onChange={e => setBusca(e.target.value)} className="w-full p-4 pl-12 rounded-2xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-blue-500 shadow-xl font-medium" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {alunos.filter(a => a.name.toLowerCase().includes(busca.toLowerCase())).map(aluno => (
                      <div key={aluno.id} className="bg-slate-900/60 border border-slate-800 p-8 rounded-[3rem] shadow-xl flex flex-col gap-8 hover:translate-y-[-5px] transition-all duration-500">
                         <div className="flex justify-between items-start">
                            <div className="flex items-center gap-5">
                               <div className="w-16 h-16 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 rounded-[1.5rem] flex items-center justify-center font-black text-blue-400 text-2xl border border-blue-500/20">{aluno.name[0]}</div>
                               <div>
                                 <h3 className="font-black text-xl leading-none">{aluno.name}</h3>
                                 <p className="text-xs text-slate-500 mt-2 font-medium">{aluno.email}</p>
                               </div>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950 p-4 rounded-2xl text-center border border-slate-800/50">
                               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Treinos no Banco</p>
                               <p className="text-xl font-black text-white mt-1">{aluno._count?.workouts || 0}</p>
                            </div>
                            <div className="bg-slate-950 p-4 rounded-2xl text-center border border-slate-800/50">
                               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sequência</p>
                               <p className="text-xl font-black text-orange-500 mt-1">{aluno.streak || 0} dias</p>
                            </div>
                         </div>

                         <div className="flex gap-2">
                            <button onClick={() => { setAlunoSelecionado(aluno); setShowTreinoModal(true); }} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all">Montar Ficha</button>
                            <button onClick={() => { setAlunoSelecionado(aluno); setShowGerenciarTreinosModal(true); }} className="p-5 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition-all"><List size={22}/></button>
                            <button className="p-5 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={22}/></button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* IA CENTER TAB */}
            {tabAtiva === 'ia' && (
              <div className="max-w-3xl mx-auto space-y-10 animate-fade-in">
                 <div className="bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-950 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden text-center">
                    <Sparkles size={80} className="mx-auto text-white mb-8 animate-pulse" />
                    <h2 className="text-5xl font-black text-white italic tracking-tighter">IA Prescritora Elite</h2>
                    <p className="text-blue-100 text-sm mt-6 font-medium max-w-lg mx-auto opacity-80 leading-relaxed italic">"Conecte o Claude MCP no seu desktop para automatizar a montagem de treinos biomecânicos e links de vídeo direto no banco de dados."</p>
                 </div>
                 
                 <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl space-y-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-3">Atleta Alvo da Inteligência</label>
                      <select value={iaAlunoId} onChange={e => setIaAlunoId(e.target.value)} className="w-full p-6 bg-slate-950 border border-slate-800 rounded-2xl text-white font-black text-lg outline-none focus:border-blue-500 appearance-none shadow-inner cursor-pointer">
                        <option value="">Selecione da sua consultoria...</option>
                        {alunos.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>

                    <div className="p-8 bg-blue-500/10 border border-blue-500/20 rounded-[2.5rem] flex items-center gap-6">
                       <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"><Globe className="text-white" size={32} /></div>
                       <div>
                          <h4 className="text-white font-black text-lg">Pronto para Comandos</h4>
                          <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">Abra o Claude Desktop, ative o servidor e diga: <br/> <span className="text-blue-400 italic">"Claude, monte o treino de hoje para o ${alunos.find(a => a.id === parseInt(iaAlunoId))?.name || 'seu aluno'} e envie agora."</span></p>
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* DOCK BAR (MODERNO) */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-2xl border border-white/5 px-10 py-5 rounded-full flex gap-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100]">
        {[
          { id: 'dashboard', icon: BarChart3, label: 'Dash' },
          { id: 'alunos', icon: Users, label: 'Atletas' },
          { id: 'ia', icon: Sparkles, label: 'IA Center' },
          { id: 'perfil', icon: Settings, label: 'Ajustes' }
        ].map(item => (
          <button key={item.id} onClick={() => setTabAtiva(item.id)} className={`flex flex-col items-center gap-2 group transition-all transform active:scale-90 ${tabAtiva === item.id ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}>
            <item.icon size={26} className={tabAtiva === item.id ? (isMaster ? 'text-red-500' : 'text-blue-500') : 'text-white'} strokeWidth={tabAtiva === item.id ? 2.5 : 2} />
            <span className={`text-[7px] font-black uppercase tracking-widest ${tabAtiva === item.id ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* MODAL: GERENCIAR FICHAS (PDF) */}
      {showGerenciarTreinosModal && alunoSelecionado && (
        <div className="fixed inset-0 bg-black/98 z-[500] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[4rem] w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[40px]"></div>
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">{alunoSelecionado.name}</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Dossiê de Treinamento</p>
              </div>
              <button onClick={() => setShowGerenciarTreinosModal(false)} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><X size={28}/></button>
            </div>
            
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {(!alunoSelecionado.workouts || alunoSelecionado.workouts.length === 0) ? (
                <div className="text-center py-16 text-slate-700 font-black uppercase text-xs tracking-widest border-2 border-dashed border-slate-800 rounded-[2rem]">Banco de dados vazio.</div>
              ) : (
                alunoSelecionado.workouts.map((w: any) => (
                  <div key={w.id} className="bg-slate-950 p-6 rounded-[2.5rem] border border-slate-800 flex justify-between items-center group hover:border-blue-500/50 transition-all shadow-inner">
                    <div>
                      <p className="font-black text-blue-400 uppercase text-sm tracking-tight">{w.title}</p>
                      <div className="flex gap-3 text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-widest">
                         <span>{w.dayOfWeek}</span>
                         <span className="text-slate-800">•</span>
                         <span>{w.duration || '60m'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => exportarPDF(w, alunoSelecionado)} className="p-5 bg-emerald-600 text-white rounded-[1.5rem] shadow-xl shadow-emerald-900/20 active:scale-90 transition-all"><Download size={22}/></button>
                       <button className="p-5 bg-red-600/10 text-red-500 rounded-[1.5rem] hover:bg-red-600 hover:text-white transition-all"><Trash2 size={22}/></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-10 pt-10 border-t border-slate-800">
               <button onClick={() => { setShowGerenciarTreinosModal(false); setShowTreinoModal(true); }} className="w-full py-5 bg-blue-600/10 text-blue-500 font-black rounded-3xl text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Criar nova ficha manual</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST PREMIUM */}
      {toastMsg && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] animate-bounce">
          <div className="bg-blue-600 text-white px-10 py-5 rounded-full font-black shadow-[0_20px_50px_rgba(37,99,235,0.4)] flex items-center gap-4 text-sm">
             <CheckCircle2 size={20} /> {toastMsg}
          </div>
        </div>
      )}

    </div>
  );
}