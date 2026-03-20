'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, LogOut, X, User as UserIcon, Plus, Activity, Dumbbell, Trash2, Settings, Home, List, 
  Search, Download, Sparkles, Youtube, ChevronRight, MessageCircle, Crown, ShieldAlert, Zap, 
  TrendingUp, DollarSign, Target, Lock, Camera, Save, Globe, BarChart3
} from 'lucide-react';

const API_URL = "https://evotrainer.onrender.com/api";

// --- COMPONENTES AUXILIARES ---
const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-[2.5rem] shadow-xl">
    <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center mb-4`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</p>
    <h3 className="text-3xl font-black text-white mt-1">{value}</h3>
  </div>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null); 
  const [token, setToken] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [tabAtiva, setTabAtiva] = useState('dashboard');
  const [toastMsg, setToastMsg] = useState('');

  // Estados Master
  const [trainers, setTrainers] = useState<any[]>([]);
  const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [trainerSelecionado, setTrainerSelecionado] = useState<any>(null);

  // Estados Personal
  const [alunos, setAlunos] = useState<any[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<any>(null);
  const [showAddAlunoModal, setShowAddAlunoModal] = useState(false);
  const [showGerenciarTreinosModal, setShowGerenciarTreinosModal] = useState(false);
  const [formAluno, setFormAluno] = useState({ name: '', email: '', phone: '', weight: '', height: '', level: 'Intermediário', anamnese: '' });

  // Perfil
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '' });

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };
  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: loginEmail, password: loginPassword }) });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token); setCurrentUser(data.user);
        localStorage.setItem('treino_ai_token', data.token); localStorage.setItem('treino_ai_user', JSON.stringify(data.user));
      } else showToast(data.error);
    } catch (e) { showToast("Erro de conexão."); } finally { setIsLoggingIn(false); }
  };

  const fetchData = async () => {
    if (!token || !currentUser) return;
    const ep = currentUser.role === 'SUPERADMIN' ? '/superadmin/trainers' : '/alunos';
    const res = await fetch(`${API_URL}${ep}`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      currentUser.role === 'SUPERADMIN' ? setTrainers(data) : setAlunos(data);
    }
  };

  const updatePlan = async (id: number, plano: string) => {
    const res = await fetch(`${API_URL}/superadmin/trainers/${id}/plano`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ plano }) });
    if (res.ok) { showToast("Plano atualizado!"); setShowEditPlanModal(false); fetchData(); }
  };

  const createAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/alunos`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(formAluno) });
    if (res.ok) { showToast("Atleta cadastrado!"); setShowAddAlunoModal(false); fetchData(); }
  };

  const changePassword = async () => {
    const res = await fetch(`${API_URL}/perfil/senha`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(passwordForm) });
    if (res.ok) { showToast("Senha alterada!"); setShowPasswordModal(false); } else showToast("Erro.");
  };

  useEffect(() => {
    const t = localStorage.getItem('treino_ai_token');
    const u = localStorage.getItem('treino_ai_user');
    if (t && u) { setToken(t); setCurrentUser(JSON.parse(u)); }
  }, []);

  useEffect(() => { if (currentUser) fetchData(); }, [currentUser, tabAtiva]);

  if (!currentUser) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
       <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl">
          <Dumbbell className="text-blue-500 mx-auto mb-6" size={50} />
          <h1 className="text-4xl font-black text-white italic mb-8">EVO<span className="text-blue-500">TRAINER</span></h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="E-mail" className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
            <input type="password" placeholder="Senha" className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
            <button className="w-full p-6 bg-blue-600 rounded-3xl font-black text-white uppercase tracking-widest active:scale-95 transition-all">{isLoggingIn ? 'Entrando...' : 'Acessar Painel'}</button>
          </form>
       </div>
    </div>
  );

  const isMaster = currentUser.role === 'SUPERADMIN';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="p-6 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-black text-xl italic tracking-tighter uppercase">EVO<span className={isMaster ? 'text-red-500' : 'text-blue-500'}>{isMaster ? 'MASTER' : 'TRAINER'}</span></h1>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:bg-red-500 transition-all"><LogOut size={18}/></button>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full pb-40 animate-fade-in">
        
        {/* DASHBOARD TAB */}
        {tabAtiva === 'dashboard' && (
          <div className="space-y-10">
             <h2 className="text-4xl font-black italic tracking-tight">{isMaster ? 'Analytics Global' : 'Coach Dashboard'}</h2>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title={isMaster ? "Personais" : "Atletas"} value={isMaster ? trainers.length : alunos.length} icon={Users} color={isMaster ? "bg-red-500" : "bg-blue-500"} />
                <StatCard title="Ganhos Est." value={`R$ ${isMaster ? trainers.length * 99 : alunos.length * 120}`} icon={DollarSign} color="bg-emerald-500" />
                <StatCard title="Atividade" value="98%" icon={Activity} color="bg-indigo-500" />
                <StatCard title="Saúde" value="OK" icon={Target} color="bg-amber-500" />
             </div>
          </div>
        )}

        {/* ALUNOS / PERSONAIS TAB */}
        {tabAtiva === 'alunos' && (
          <div className="space-y-10">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black italic">{isMaster ? 'Gestão de Treinadores' : 'Sua Tropa'}</h2>
                <button onClick={() => isMaster ? setShowAddTrainerModal(true) : setShowAddAlunoModal(true)} className={`${isMaster ? 'bg-red-600' : 'bg-blue-600'} px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg active:scale-95 transition-all`}>
                  <Plus size={16} /> {isMaster ? 'Novo Personal' : 'Adicionar Aluno'}
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(isMaster ? trainers : alunos).map(item => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[3.5rem] shadow-xl hover:border-slate-700 transition-all flex flex-col gap-6">
                     <div className="flex items-center gap-5">
                        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl border border-white/5 ${isMaster ? 'bg-red-600/10 text-red-500' : 'bg-blue-600/10 text-blue-500'}`}>{item.name[0]}</div>
                        <div><h3 className="font-black text-xl">{item.name}</h3><p className="text-xs text-slate-500">{item.email}</p></div>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => { 
                          if(isMaster) { setTrainerSelecionado(item); setShowEditPlanModal(true); } 
                          else { setAlunoSelecionado(item); setShowGerenciarTreinosModal(true); }
                        }} className={`flex-1 ${isMaster ? 'bg-slate-800' : 'bg-blue-600'} text-white p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl`}>
                          {isMaster ? 'Editar Plano' : 'Gerenciar'}
                        </button>
                        <button className="p-5 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={22}/></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* IA CENTER */}
        {tabAtiva === 'ia' && (
           <div className="max-w-3xl mx-auto space-y-10 text-center">
              <div className="bg-gradient-to-br from-indigo-700 to-blue-900 p-12 rounded-[4rem] shadow-2xl">
                 <Sparkles size={60} className="mx-auto text-white mb-6 animate-pulse" />
                 <h2 className="text-4xl font-black italic text-white tracking-tighter">IA Prescritora Elite</h2>
                 <p className="text-blue-100 mt-4 opacity-80 leading-relaxed italic">"Claude, primeiro busque o aluno Bruno e depois monte o treino dele no EvoTrainer."</p>
              </div>
           </div>
        )}

        {/* PERFIL */}
        {tabAtiva === 'perfil' && (
          <div className="max-w-2xl mx-auto space-y-10 text-center">
             <div className="bg-slate-900 border border-slate-800 p-12 rounded-[4rem] shadow-2xl">
                <div className="w-32 h-32 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center text-5xl font-black mx-auto mb-8 border-4 border-blue-500/20 shadow-2xl">
                   {currentUser.name[0]}
                </div>
                <h3 className="text-3xl font-black text-white">{currentUser.name}</h3>
                <p className="text-slate-500 text-lg mt-2 mb-10">{currentUser.email}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <button onClick={() => setShowPasswordModal(true)} className="bg-slate-800 p-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-600 transition-all border border-slate-700"><Lock size={18}/> Mudar Senha</button>
                   <button className="bg-slate-800 p-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-700 transition-all border border-slate-700 opacity-50"><Camera size={18}/> Nova Foto</button>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* DOCK BAR */}
      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-3xl border border-white/10 px-12 py-6 rounded-full flex gap-14 shadow-2xl z-[100]">
        {[
          { id: 'dashboard', icon: BarChart3, label: 'DASH' },
          { id: 'alunos', icon: Users, label: isMaster ? 'PROS' : 'TROPA' },
          { id: 'ia', icon: Sparkles, label: 'IA' },
          { id: 'perfil', icon: UserIcon, label: 'CONTA' }
        ].map(item => (
          <button key={item.id} onClick={() => setTabAtiva(item.id)} className={`flex flex-col items-center gap-2 group transition-all transform active:scale-75 ${tabAtiva === item.id ? 'scale-125' : 'opacity-30 hover:opacity-100'}`}>
            <item.icon size={28} className={tabAtiva === item.id ? (isMaster ? 'text-red-500' : 'text-blue-500') : 'text-white'} strokeWidth={tabAtiva === item.id ? 2.5 : 2} />
            <span className={`text-[7px] font-black uppercase tracking-widest ${tabAtiva === item.id ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* MODAL: EDITAR PLANO (MASTER) */}
      {showEditPlanModal && trainerSelecionado && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in">
           <div className="bg-slate-900 border border-slate-800 p-12 rounded-[4rem] w-full max-w-md shadow-2xl text-center">
              <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Alterar Plano</h3>
              <p className="text-slate-500 mb-10 font-medium">Treinador: {trainerSelecionado.name}</p>
              <div className="space-y-4">
                 {['GRATIS', 'START', 'PRO', 'ELITE'].map(p => (
                   <button key={p} onClick={() => updatePlan(trainerSelecionado.id, p)} className={`w-full p-6 rounded-3xl font-black text-[12px] uppercase border transition-all ${trainerSelecionado.plano === p ? 'bg-red-600 text-white border-red-600' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-red-500'}`}>PLANO {p}</button>
                 ))}
              </div>
              <button onClick={() => setShowEditPlanModal(false)} className="w-full mt-10 text-slate-600 font-black text-[10px] uppercase">Fechar</button>
           </div>
        </div>
      )}

      {/* MODAL: MUDAR SENHA */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/98 z-[800] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in">
           <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] w-full max-w-md shadow-2xl text-center">
              <h3 className="text-2xl font-black text-white mb-6">Mudar Senha</h3>
              <div className="space-y-4">
                 <input type="password" placeholder="Senha Atual" className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} />
                 <input type="password" placeholder="Nova Senha" className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} />
                 <button onClick={changePassword} className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl active:scale-95 shadow-xl transition-all">ATUALIZAR SENHA</button>
                 <button onClick={() => setShowPasswordModal(false)} className="w-full mt-4 text-slate-500 font-bold text-xs uppercase">Cancelar</button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL: NOVO ALUNO (PERSONAL) */}
      {showAddAlunoModal && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in">
           <div className="bg-slate-900 border border-slate-800 p-10 rounded-[4rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800">
                <h3 className="text-3xl font-black text-white italic">Novo Atleta</h3>
                <button onClick={() => setShowAddAlunoModal(false)} className="p-3 bg-slate-800 rounded-2xl text-slate-400"><X size={28}/></button>
              </div>
              <form onSubmit={createAluno} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nome" required className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 font-bold" value={formAluno.name} onChange={e => setFormAluno({...formAluno, name: e.target.value})} />
                    <input type="email" placeholder="E-mail" required className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500" value={formAluno.email} onChange={e => setFormAluno({...formAluno, email: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <input type="number" placeholder="Peso kg" className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white text-center font-bold" value={formAluno.weight} onChange={e => setFormAluno({...formAluno, weight: e.target.value})} />
                    <input type="number" placeholder="Altura cm" className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white text-center font-bold" value={formAluno.height} onChange={e => setFormAluno({...formAluno, height: e.target.value})} />
                    <select className="col-span-2 p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-black" value={formAluno.level} onChange={e => setFormAluno({...formAluno, level: e.target.value})}><option>Iniciante</option><option>Intermediário</option><option>Avançado</option></select>
                 </div>
                 <textarea placeholder="Histórico Médico e Lesões..." className="w-full p-8 bg-slate-950 border border-slate-800 rounded-[2.5rem] text-white text-sm min-h-[150px] outline-none focus:border-blue-500 font-medium" value={formAluno.anamnese} onChange={e => setFormAluno({...formAluno, anamnese: e.target.value})}></textarea>
                 <button type="submit" className="w-full py-7 bg-blue-600 text-white font-black rounded-[2rem] shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em] text-xs">CADASTRAR ATLETA</button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL: GERENCIAR ALUNO (FICHAS E PDF) */}
      {showGerenciarTreinosModal && alunoSelecionado && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in">
           <div className="bg-slate-900 border border-slate-800 p-10 rounded-[4rem] w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                <div><h3 className="text-3xl font-black text-white">{alunoSelecionado.name}</h3><p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1">Gestão de Treinos</p></div>
                <button onClick={() => setShowGerenciarTreinosModal(false)} className="p-3 bg-slate-800 rounded-2xl text-slate-400"><X size={28}/></button>
              </div>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {(!alunoSelecionado.workouts || alunoSelecionado.workouts.length === 0) ? (
                  <div className="text-center py-10 text-slate-700 font-black uppercase text-xs">Nenhum treino no banco.</div>
                ) : (
                  alunoSelecionado.workouts.map((w: any) => (
                    <div key={w.id} className="bg-slate-950 p-6 rounded-[2.5rem] border border-slate-800 flex justify-between items-center group hover:border-blue-500/50 transition-all shadow-inner">
                      <p className="font-black text-blue-400 uppercase text-sm tracking-tight">{w.title}</p>
                      <button className="p-5 bg-emerald-600 text-white rounded-[1.5rem] shadow-xl active:scale-90 transition-all"><Download size={22}/></button>
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-10 py-5 rounded-full font-black shadow-2xl animate-bounce">
           {toastMsg}
        </div>
      )}
    </div>
  );
}