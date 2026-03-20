'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, LogOut, CheckCircle2, Flame, Play, X, User as UserIcon, Plus, Activity, Dumbbell,
  Trash2, Ban, Unlock, Home, List, AlertTriangle, Pencil, Link as LinkIcon, Lock, Camera, Save, Search,
  Download, Sparkles, Youtube, ChevronRight, MessageCircle, Crown, Check, ShieldAlert, Zap, 
  TrendingUp, DollarSign, Target, Clock, Filter, BarChart3, Settings, Globe
} from 'lucide-react';

const API_URL = "https://evotrainer.onrender.com/api";

export default function App() {
  // --- ESTADOS GERAIS ---
  const [currentUser, setCurrentUser] = useState<any>(null); 
  const [token, setToken] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [tabAtiva, setTabAtiva] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  // --- ESTADOS MASTER (SUPERADMIN) ---
  const [trainers, setTrainers] = useState<any[]>([]);
  const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [trainerSelecionado, setTrainerSelecionado] = useState<any>(null);
  const [formTrainer, setFormTrainer] = useState({ name: '', email: '', password: '', phone: '', plano: 'START' });

  // --- ESTADOS PERSONAL (ADMIN) ---
  const [alunos, setAlunos] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [showAddAlunoModal, setShowAddAlunoModal] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<any>(null);
  const [showTreinoModal, setShowTreinoModal] = useState(false);
  const [showGerenciarTreinosModal, setShowGerenciarTreinosModal] = useState(false);
  const [formAluno, setFormAluno] = useState({ name: '', email: '', phone: '', weight: '', height: '', level: 'Intermediário', anamnese: '', restricoes: '' });

  // --- HELPER FUNCTIONS ---
  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };
  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });

  // --- LOGIN ---
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
        showToast("Acesso Liberado!");
      } else { showToast(data.error || "Erro ao logar."); }
    } catch (e) { showToast("Erro de rede."); } finally { setIsLoggingIn(false); }
  };

  // --- BUSCAR DADOS DO BANCO ---
  const fetchData = async () => {
    if (!token || !currentUser) return;
    setIsLoading(true);
    try {
      if (currentUser.role === 'SUPERADMIN') {
        const res = await fetch(`${API_URL}/superadmin/trainers`, { headers: getAuthHeaders() });
        if (res.ok) setTrainers(await res.json());
      } else {
        const res = await fetch(`${API_URL}/alunos`, { headers: getAuthHeaders() });
        if (res.ok) setAlunos(await res.json());
      }
    } catch (e) { showToast("Erro ao carregar dados."); }
    finally { setIsLoading(false); }
  };

  // --- CRIAR PERSONAL (MASTER) ---
  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/superadmin/trainers`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(formTrainer)
      });
      if (res.ok) {
        showToast("Personal cadastrado!");
        setShowAddTrainerModal(false);
        fetchData();
      }
    } catch (e) { showToast("Erro ao criar."); }
  };

  // --- CRIAR ALUNO (PERSONAL) ---
  const handleCreateAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/alunos`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(formAluno)
      });
      if (res.ok) {
        showToast("Atleta adicionado ao banco!");
        setShowAddAlunoModal(false);
        fetchData();
      }
    } catch (e) { showToast("Erro ao criar aluno."); }
  };

  // --- ALTERAR PLANO (MASTER) ---
  const handleUpdatePlan = async (trainerId: number, novoPlano: string) => {
    try {
      const res = await fetch(`${API_URL}/superadmin/trainers/${trainerId}/plano`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ plano: novoPlano })
      });
      if (res.ok) { showToast("Plano atualizado!"); setShowEditPlanModal(false); fetchData(); }
    } catch (e) { showToast("Erro."); }
  };

  useEffect(() => {
    const sToken = localStorage.getItem('treino_ai_token');
    const sUser = localStorage.getItem('treino_ai_user');
    if (sToken && sUser) { setToken(sToken); setCurrentUser(JSON.parse(sUser)); }
  }, []);

  useEffect(() => { if (currentUser) fetchData(); }, [currentUser, tabAtiva]);

  // ==================== VIEW: LOGIN ====================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl text-center relative z-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-xl"><Dumbbell className="text-white" size={40} /></div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter italic">EVO<span className="text-blue-500">TRAINER</span></h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="E-mail" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 transition-all" />
            <input type="password" placeholder="Senha" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 transition-all" />
            <button disabled={isLoggingIn} className="w-full p-5 bg-blue-600 rounded-2xl font-black text-white shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs">
               {isLoggingIn ? <Activity className="animate-spin mx-auto" /> : 'Entrar no Sistema'}
            </button>
          </form>
        </div>
        {toastMsg && <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-4 rounded-full font-black shadow-2xl z-[100]">{toastMsg}</div>}
      </div>
    );
  }

  const isMaster = currentUser.role === 'SUPERADMIN';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans selection:bg-blue-500/30">
      
      {/* HEADER */}
      <header className="p-6 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 ${isMaster ? 'bg-red-600' : 'bg-blue-600'} rounded-xl flex items-center justify-center shadow-lg`}>
            {isMaster ? <ShieldAlert size={20} className="text-white"/> : <Dumbbell size={20} className="text-white"/>}
          </div>
          <h1 className="font-black text-xl tracking-tighter uppercase leading-none">EVO<span className={isMaster ? 'text-red-500' : 'text-blue-500'}>{isMaster ? 'MASTER' : 'TRAINER'}</span></h1>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:bg-red-500 transition-all shadow-xl active:scale-90"><LogOut size={18}/></button>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full pb-40">
        
        {/* DASHBOARD MASTER */}
        {isMaster && tabAtiva === 'dashboard' && (
          <div className="space-y-10 animate-fade-in">
             <div className="flex justify-between items-center">
               <h2 className="text-4xl font-black italic tracking-tight">Painel do <span className="text-red-600">Dono</span></h2>
               <div className="bg-red-600/10 border border-red-600/20 px-6 py-4 rounded-3xl text-center hidden sm:block">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Faturamento Estimado</p>
                  <p className="text-2xl font-black text-white mt-1">R$ {trainers.length * 99},00</p>
               </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Personais Ativos" value={trainers.length} icon={Users} color="bg-red-500" />
                <StatCard title="Novos Hoje" value="2" icon={TrendingUp} color="bg-emerald-500" />
                <StatCard title="Limite de IA" value="Ilimitado" icon={Zap} color="bg-amber-500" />
                <StatCard title="Atividade Alunos" value="842" icon={Activity} color="bg-blue-500" />
             </div>
          </div>
        )}

        {/* LISTA DE PERSONAIS (MASTER) */}
        {isMaster && tabAtiva === 'alunos' && (
          <div className="space-y-8 animate-fade-in">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black italic">Gestão de <span className="text-red-500">Personais</span></h2>
                <button onClick={() => setShowAddTrainerModal(true)} className="bg-red-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-red-500 active:scale-95 transition-all"><Plus size={16} /> Novo Cadastro</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainers.map(t => (
                  <div key={t.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-xl hover:border-red-600/50 transition-all group">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-red-500 text-2xl border border-slate-700">{t.name[0]}</div>
                        <div><h3 className="font-black text-lg">{t.name}</h3><p className="text-xs text-slate-500">{t.email}</p></div>
                     </div>
                     <div className="mt-8 flex justify-between items-center">
                        <span className="bg-red-600/10 text-red-500 text-[10px] px-3 py-1 rounded-lg font-black uppercase">{t.plano}</span>
                        <button onClick={() => { setTrainerSelecionado(t); setShowEditPlanModal(true); }} className="p-4 bg-slate-800 rounded-2xl text-white hover:bg-red-600 transition-all"><Settings size={20}/></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* DASHBOARD COACH (PERSONAL) */}
        {!isMaster && tabAtiva === 'dashboard' && (
          <div className="space-y-10 animate-fade-in">
             <div className="flex justify-between items-end">
               <h2 className="text-4xl font-black italic">Evo<span className="text-blue-500">Coach</span></h2>
               <button onClick={() => setShowAddAlunoModal(true)} className="bg-blue-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg active:scale-95 transition-all"><Plus size={16} /> Novo Aluno</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Atletas" value={alunos.length} icon={Users} color="bg-blue-500" />
                <StatCard title="Faturamento Bruto" value={`R$ ${alunos.length * 150}`} icon={DollarSign} color="bg-emerald-500" />
                <StatCard title="Treinos Mes" value="48" icon={Activity} color="bg-indigo-500" />
                <StatCard title="Retenção" value="94%" icon={Target} color="bg-amber-500" />
             </div>
          </div>
        )}

        {/* LISTA DE ALUNOS (PERSONAL) */}
        {!isMaster && tabAtiva === 'alunos' && (
          <div className="space-y-10 animate-fade-in">
             <h2 className="text-3xl font-black">Sua <span className="text-blue-500">Tropa</span></h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {alunos.filter(a => a.name.toLowerCase().includes(busca.toLowerCase())).map(aluno => (
                  <div key={aluno.id} className="bg-slate-900/60 border border-slate-800 p-8 rounded-[3rem] shadow-xl flex flex-col gap-6 hover:translate-y-[-5px] transition-all">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 rounded-[1.5rem] flex items-center justify-center font-black text-blue-400 text-2xl border border-blue-500/20">{aluno.name[0]}</div>
                        <div><h3 className="font-black text-xl">{aluno.name}</h3><p className="text-xs text-slate-500 mt-1">{aluno.email}</p></div>
                     </div>
                     <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all">Montar Ficha</button>
                        <button onClick={() => { setAlunoSelecionado(aluno); setShowGerenciarTreinosModal(true); }} className="p-4 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition-all"><List size={22}/></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

      </main>

      {/* DOCK BAR */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-2xl border border-white/5 px-10 py-5 rounded-full flex gap-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100]">
        {[
          { id: 'dashboard', icon: BarChart3, label: 'Dash' },
          { id: 'alunos', icon: Users, label: isMaster ? 'Personais' : 'Atletas' },
          { id: 'ia', icon: Sparkles, label: 'IA Center' },
          { id: 'perfil', icon: Settings, label: 'Perfil' }
        ].map(item => (
          <button key={item.id} onClick={() => setTabAtiva(item.id)} className={`flex flex-col items-center gap-2 transition-all transform active:scale-90 ${tabAtiva === item.id ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}>
            <item.icon size={26} className={tabAtiva === item.id ? (isMaster ? 'text-red-500' : 'text-blue-500') : 'text-white'} strokeWidth={tabAtiva === item.id ? 2.5 : 2} />
            <span className={`text-[7px] font-black uppercase tracking-widest ${tabAtiva === item.id ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* MODAL: NOVO PERSONAL (MASTER ONLY) */}
      {showAddTrainerModal && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in">
           <div className="bg-slate-900 border border-slate-800 p-10 rounded-[4rem] w-full max-w-md shadow-2xl">
              <h3 className="text-3xl font-black text-white mb-6 tracking-tight">Novo Personal</h3>
              <form onSubmit={handleCreateTrainer} className="space-y-4">
                 <input type="text" placeholder="Nome Completo" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-red-500" value={formTrainer.name} onChange={e => setFormTrainer({...formTrainer, name: e.target.value})} />
                 <input type="email" placeholder="E-mail de Login" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-red-500" value={formTrainer.email} onChange={e => setFormTrainer({...formTrainer, email: e.target.value})} />
                 <input type="password" placeholder="Senha Inicial" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-red-500" value={formTrainer.password} onChange={e => setFormTrainer({...formTrainer, password: e.target.value})} />
                 <select className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-black uppercase text-xs" value={formTrainer.plano} onChange={e => setFormTrainer({...formTrainer, plano: e.target.value})}><option value="START">START</option><option value="PRO">PRO</option><option value="ELITE">ELITE</option></select>
                 <button type="submit" className="w-full py-6 bg-red-600 text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all">ATIVAR ACESSO</button>
                 <button type="button" onClick={() => setShowAddTrainerModal(false)} className="w-full py-4 text-slate-500 font-bold text-xs">CANCELAR</button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL: EDITAR PLANO (MASTER ONLY) */}
      {showEditPlanModal && trainerSelecionado && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md">
           <div className="bg-slate-900 border border-slate-800 p-10 rounded-[4rem] w-full max-w-md shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Alterar Plano</h3>
              <p className="text-xs text-slate-500 mb-8 uppercase font-bold tracking-widest">Treinador: {trainerSelecionado.name}</p>
              <div className="space-y-3">
                 {['GRATIS', 'START', 'PRO', 'ELITE'].map(p => (
                   <button key={p} onClick={() => handleUpdatePlan(trainerSelecionado.id, p)} className={`w-full p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${trainerSelecionado.plano === p ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-red-600/50'}`}>PLANO {p}</button>
                 ))}
              </div>
              <button onClick={() => setShowEditPlanModal(false)} className="w-full mt-8 py-4 text-slate-500 font-black text-[10px] uppercase tracking-widest">Cancelar</button>
           </div>
        </div>
      )}

      {/* MODAL: NOVO ALUNO (PERSONAL ONLY) */}
      {showAddAlunoModal && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md">
           <div className="bg-slate-900 border border-slate-800 p-10 rounded-[4rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800">
                <div><h3 className="text-3xl font-black text-white">Novo Atleta</h3><p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1">Prontuário Biomecânico para IA</p></div>
                <button onClick={() => setShowAddAlunoModal(false)} className="p-3 bg-slate-800 rounded-2xl text-slate-400"><X size={28}/></button>
              </div>
              <form onSubmit={handleCreateAluno} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nome Completo" required className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 font-bold" value={formAluno.name} onChange={e => setFormAluno({...formAluno, name: e.target.value})} />
                    <input type="email" placeholder="E-mail (Login)" required className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500" value={formAluno.email} onChange={e => setFormAluno({...formAluno, email: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <input type="number" placeholder="Peso kg" className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-center font-bold" value={formAluno.weight} onChange={e => setFormAluno({...formAluno, weight: e.target.value})} />
                    <input type="number" placeholder="Altura cm" className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-center font-bold" value={formAluno.height} onChange={e => setFormAluno({...formAluno, height: e.target.value})} />
                    <select className="col-span-2 p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-black" value={formAluno.level} onChange={e => setFormAluno({...formAluno, level: e.target.value})}><option>Iniciante</option><option>Intermediário</option><option>Avançado</option></select>
                 </div>
                 <textarea placeholder="Anamnese: Lesões, dores ou histórico esportivo..." className="w-full p-6 bg-slate-950 border border-slate-800 rounded-[2rem] text-white text-sm min-h-[120px] outline-none focus:border-blue-500 font-medium" value={formAluno.anamnese} onChange={e => setFormAluno({...formAluno, anamnese: e.target.value})}></textarea>
                 <button type="submit" className="w-full py-6 bg-blue-600 text-white font-black rounded-[1.5rem] shadow-2xl shadow-blue-900/40 active:scale-95 transition-all uppercase tracking-widest">Cadastrar e Sincronizar</button>
              </form>
           </div>
        </div>
      )}

      {toastMsg && <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-10 py-5 rounded-full font-black shadow-2xl animate-bounce">{toastMsg}</div>}
    </div>
  );
}