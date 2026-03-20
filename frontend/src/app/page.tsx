'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, LogOut, CheckCircle2, Flame, Play, X, User as UserIcon, Plus, Activity, Dumbbell,
  Trash2, Ban, Unlock, Home, List, AlertTriangle, Pencil, Link as LinkIcon, Lock, Camera, Save, Search,
  Download, Sparkles, Youtube, ChevronRight, MessageCircle, Crown, Check, ShieldAlert, Zap, 
  TrendingUp, DollarSign, Target, Clock, Filter, BarChart3, Settings, Globe
} from 'lucide-react';

// ==========================================
// CONFIGURAÇÕES TÉCNICAS (RENDER)
// ==========================================
const API_URL = "https://evotrainer.onrender.com/api";

const extractYouTubeId = (url: string) => {
  if (!url) return '';
  if (url.length === 11 && !url.includes('http')) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
};

// Componente de Card de Estatística
const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-[2rem] shadow-xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">+{trend}</span>}
    </div>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</p>
    <h3 className="text-2xl font-black text-white mt-1">{value}</h3>
  </div>
);

export default function App() {
  // --- ESTADOS DE SESSÃO ---
  const [currentUser, setCurrentUser] = useState<any>(null); 
  const [token, setToken] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [tabAtiva, setTabAtiva] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  // --- ESTADOS DO SUPERADMIN (MASTER) ---
  const [trainers, setTrainers] = useState<any[]>([]);
  const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [trainerSelecionado, setTrainerSelecionado] = useState<any>(null);

  // --- ESTADOS DO PERSONAL (ADMIN) ---
  const [alunos, setAlunos] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [showAddAlunoModal, setShowAddAlunoModal] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<any>(null);
  const [showTreinoModal, setShowTreinoModal] = useState(false);
  const [showGerenciarTreinosModal, setShowGerenciarTreinosModal] = useState(false);

  // ==========================================
  // FUNÇÕES DE COMUNICAÇÃO (API)
  // ==========================================

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };
  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });

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
        showToast("Acesso concedido!");
      } else { showToast(data.error || "Erro ao logar."); }
    } catch (e) { showToast("Erro de rede."); } finally { setIsLoggingIn(false); }
  };

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      if (currentUser.role === 'SUPERADMIN') {
        const res = await fetch(`${API_URL}/superadmin/trainers`, { headers: getAuthHeaders() });
        if (res.ok) setTrainers(await res.json());
      } else {
        const res = await fetch(`${API_URL}/alunos`, { headers: getAuthHeaders() });
        if (res.ok) setAlunos(await res.json());
      }
    } catch (e) {} finally { setIsLoading(false); }
  };

  const alterarPlano = async (trainerId: number, novoPlano: string) => {
    try {
      const res = await fetch(`${API_URL}/superadmin/trainers/${trainerId}/plano`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ plano: novoPlano })
      });
      if (res.ok) { showToast("Plano atualizado!"); setShowEditPlanModal(false); fetchData(); }
    } catch (e) { showToast("Erro ao mudar plano."); }
  };

  useEffect(() => {
    const sToken = localStorage.getItem('treino_ai_token');
    const sUser = localStorage.getItem('treino_ai_user');
    if (sToken && sUser) { setToken(sToken); setCurrentUser(JSON.parse(sUser)); }
  }, []);

  useEffect(() => { if (currentUser) fetchData(); }, [currentUser, tabAtiva]);

  // ==================== RENDER: LOGIN ====================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl text-center relative z-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-xl"><Dumbbell className="text-white" size={40} /></div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter italic">EVO<span className="text-blue-500">TRAINER</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10">Elite Management System</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="E-mail" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 transition-all" />
            <input type="password" placeholder="Senha" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 transition-all" />
            <button disabled={isLoggingIn} className="w-full p-5 bg-blue-600 rounded-2xl font-black text-white shadow-xl active:scale-95 transition-all">{isLoggingIn ? <Activity className="animate-spin mx-auto" /> : 'ACESSAR PAINEL'}</button>
          </form>
        </div>
        {toastMsg && <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-4 rounded-full font-black shadow-2xl z-[100]">{toastMsg}</div>}
      </div>
    );
  }

  const isMaster = currentUser.role === 'SUPERADMIN';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="p-6 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 ${isMaster ? 'bg-red-600' : 'bg-blue-600'} rounded-xl flex items-center justify-center shadow-lg`}>
            {isMaster ? <ShieldAlert size={20} className="text-white"/> : <Dumbbell size={20} className="text-white"/>}
          </div>
          <h1 className="font-black text-xl tracking-tighter">EVO<span className={isMaster ? 'text-red-500' : 'text-blue-500'}>{isMaster ? 'MASTER' : 'TRAINER'}</span></h1>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:bg-red-500 transition-all"><LogOut size={18}/></button>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full pb-40">
        
        {/* ==========================================
            VIEW: SUPERADMIN (MASTER)
           ========================================== */}
        {isMaster && (
          <div className="space-y-10 animate-fade-in">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black italic">Gestão da <span className="text-red-500">Plataforma</span></h2>
                <button onClick={() => setShowAddTrainerModal(true)} className="bg-red-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-600/20 active:scale-95 transition-all"><Plus size={16} /> Novo Personal</button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Personais Ativos" value={trainers.length} icon={Users} color="bg-red-500" />
                <StatCard title="Faturamento Bruto" value={`R$ ${trainers.length * 99}`} icon={DollarSign} color="bg-emerald-500" />
                <StatCard title="Total Alunos" value="482" icon={Target} color="bg-blue-500" />
                <StatCard title="Saúde do Banco" value="99.9%" icon={Activity} color="bg-indigo-500" />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-xl">
                   <h3 className="font-black text-xl mb-8">Todos os Treinadores</h3>
                   <div className="space-y-4">
                      {trainers.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-6 bg-slate-950/50 rounded-3xl border border-slate-800 hover:border-red-600/30 transition-all group">
                           <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-red-500 text-xl border border-slate-700">{t.name[0]}</div>
                              <div>
                                <p className="font-black text-white">{t.name}</p>
                                <p className="text-xs text-slate-500">{t.email}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-slate-500 uppercase">Plano Atual</p>
                                <span className="bg-red-600/10 text-red-500 text-[10px] px-3 py-1 rounded-lg font-black uppercase mt-1 inline-block">{t.plano}</span>
                              </div>
                              <button onClick={() => { setTrainerSelecionado(t); setShowEditPlanModal(true); }} className="p-4 bg-slate-800 rounded-2xl text-white hover:bg-red-600 transition-all shadow-xl"><Settings size={20}/></button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* ==========================================
            VIEW: PERSONAL (ADMIN)
           ========================================== */}
        {!isMaster && (
          <div className="space-y-10 animate-fade-in">
             {tabAtiva === 'dashboard' && (
                <>
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-3xl font-black italic">Coach <span className="text-blue-500">Dashboard</span></h2>
                      <p className="text-slate-500 font-medium italic mt-1">Gerencie sua tropa de elite.</p>
                    </div>
                    <button onClick={() => setShowAddAlunoModal(true)} className="bg-blue-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg active:scale-95 transition-all"><Plus size={16} /> Adicionar Aluno</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard title="Seus Atletas" value={alunos.length} icon={Users} color="bg-blue-500" />
                    <StatCard title="Faturamento Est." value={`R$ ${alunos.length * 150}`} icon={DollarSign} color="bg-emerald-500" />
                    <StatCard title="Treinos no Banco" value="128" icon={Activity} color="bg-indigo-500" />
                    <StatCard title="Renovação" value="88%" icon={Clock} color="bg-amber-500" />
                  </div>
                  <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px]"></div>
                     <h3 className="font-black text-xl mb-8 flex items-center gap-2"><Globe className="text-blue-500" /> Lista de Acompanhamento</h3>
                     <div className="space-y-4">
                        {alunos.map(a => (
                          <div key={a.id} className="flex items-center justify-between p-5 bg-slate-950/50 rounded-3xl border border-slate-800 hover:border-blue-500/30 transition-all cursor-pointer" onClick={() => { setAlunoSelecionado(a); setShowGerenciarTreinosModal(true); }}>
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-blue-400">{a.name[0]}</div>
                                <span className="font-black text-sm">{a.name}</span>
                             </div>
                             <ChevronRight size={18} className="text-slate-600" />
                          </div>
                        ))}
                     </div>
                  </div>
                </>
             )}

             {tabAtiva === 'ia' && (
                <div className="max-w-3xl mx-auto space-y-8">
                   <div className="bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-950 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden text-center">
                      <Sparkles size={80} className="mx-auto text-white mb-6 animate-pulse" />
                      <h2 className="text-4xl font-black text-white italic tracking-tighter">IA Prescritora Elite</h2>
                      <p className="text-blue-100 text-sm mt-6 font-medium max-w-lg mx-auto opacity-80 italic">"Conecte o Claude MCP e automatize a montagem de treinos biomecânicos direto no banco de dados."</p>
                   </div>
                   <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl space-y-6">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-3">Atleta Alvo</label>
                      <select value={iaAlunoId} onChange={e => setIaAlunoId(e.target.value)} className="w-full p-6 bg-slate-950 border border-slate-800 rounded-2xl text-white font-black text-lg outline-none focus:border-blue-500 appearance-none shadow-inner cursor-pointer">
                        <option value="">Selecione da consultoria...</option>
                        {alunos.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                      <div className="p-8 bg-blue-500/10 border border-blue-500/20 rounded-[2.5rem] flex items-center gap-6">
                         <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"><Globe className="text-white" size={32} /></div>
                         <p className="text-xs text-slate-300 leading-relaxed font-medium">Abra o Claude Desktop e diga: <br/> <span className="text-blue-400 font-bold italic">"Claude, monte o treino do ${alunos.find(a => a.id === parseInt(iaAlunoId))?.name || 'aluno'} usando as restrições médicas dele."</span></p>
                      </div>
                   </div>
                </div>
             )}
          </div>
        )}
      </main>

      {/* DOCK BAR */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-2xl border border-white/5 px-10 py-5 rounded-full flex gap-12 shadow-2xl z-[100]">
        {[
          { id: 'dashboard', icon: BarChart3, label: 'Home' },
          { id: 'alunos', icon: Users, label: isMaster ? 'Personais' : 'Atletas' },
          { id: 'ia', icon: Sparkles, label: 'IA Center' },
          { id: 'perfil', icon: Settings, label: 'Ajustes' }
        ].map(item => (
          <button key={item.id} onClick={() => setTabAtiva(item.id)} className={`flex flex-col items-center gap-2 group transition-all transform active:scale-90 ${tabAtiva === item.id ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}>
            <item.icon size={26} className={tabAtiva === item.id ? (isMaster ? 'text-red-500' : 'text-blue-500') : 'text-white'} strokeWidth={tabAtiva === item.id ? 2.5 : 2} />
            <span className={`text-[7px] font-black uppercase tracking-widest ${tabAtiva === item.id ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* MODAL: EDITAR PLANO (MASTER ONLY) */}
      {showEditPlanModal && trainerSelecionado && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md">
           <div className="bg-slate-900 border border-slate-800 p-10 rounded-[4rem] w-full max-w-md shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-2">Alterar Plano</h3>
              <p className="text-xs text-slate-500 mb-8">Personal: {trainerSelecionado.name}</p>
              <div className="space-y-3">
                 {['GRATIS', 'START', 'PRO', 'ELITE'].map(p => (
                   <button key={p} onClick={() => alterarPlano(trainerSelecionado.id, p)} className={`w-full p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${trainerSelecionado.plano === p ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-900/40' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-red-600/50'}`}>PLANO {p}</button>
                 ))}
              </div>
              <button onClick={() => setShowEditPlanModal(false)} className="w-full mt-8 py-4 text-slate-500 font-black text-[10px] uppercase tracking-widest">Cancelar</button>
           </div>
        </div>
      )}

      {/* MODAL: NOVO ALUNO (ADMIN ONLY - PRONTUÁRIO IA) */}
      {showAddAlunoModal && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md">
           <div className="bg-slate-900 border border-slate-800 p-10 rounded-[4rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800">
                <div><h3 className="text-3xl font-black text-white">Novo Atleta</h3><p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1">Dados Biométricos para IA</p></div>
                <button onClick={() => setShowAddAlunoModal(false)} className="p-3 bg-slate-800 rounded-2xl text-slate-400"><X size={28}/></button>
              </div>
              <form className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nome do Atleta" className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 font-bold" />
                    <input type="email" placeholder="Email de Acesso" className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500" />
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <input type="number" placeholder="Peso kg" className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-center font-bold" />
                    <input type="number" placeholder="Altura cm" className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-center font-bold" />
                    <select className="col-span-2 p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-black"><option>Iniciante</option><option>Intermediário</option><option>Avançado</option></select>
                 </div>
                 <textarea placeholder="Histórico Médico e Lesões (Anamnese)" className="w-full p-6 bg-slate-950 border border-slate-800 rounded-[2rem] text-white text-sm min-h-[120px] outline-none focus:border-blue-500 font-medium"></textarea>
                 <button className="w-full py-6 bg-blue-600 text-white font-black rounded-[1.5rem] shadow-2xl shadow-blue-900/40 active:scale-95 transition-all uppercase tracking-widest">Cadastrar Atleta</button>
              </form>
           </div>
        </div>
      )}

      {toastMsg && <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-10 py-5 rounded-full font-black shadow-2xl animate-bounce">{toastMsg}</div>}
    </div>
  );
}