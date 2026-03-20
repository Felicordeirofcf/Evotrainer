'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, LogOut, X, User as UserIcon, Plus, Activity, Dumbbell, Trash2, Settings, List, 
  Search, Download, Sparkles, Youtube, ChevronRight, MessageCircle, Crown, Zap, 
  DollarSign, Target, Lock, Camera, BarChart3, Globe, Phone, CheckCircle2, Edit2, Calendar
} from 'lucide-react';

const API_URL = "https://evotrainer.onrender.com/api";

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-[2.5rem] shadow-xl transition-all">
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
  const [tabAtiva, setTabAtiva] = useState('dashboard');
  const [toastMsg, setToastMsg] = useState('');
  const [alunos, setAlunos] = useState<any[]>([]);
  const [iaAlunoId, setIaAlunoId] = useState('');
  const [iaFrequencia, setIaFrequencia] = useState('3');
  const [isLoading, setIsLoading] = useState(false);

  const [showAddAlunoModal, setShowAddAlunoModal] = useState(false);
  const [showEditAlunoModal, setShowEditAlunoModal] = useState(false);
  const [showGerenciarTreinosModal, setShowGerenciarTreinosModal] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<any>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [formAluno, setFormAluno] = useState({ name: '', email: '', phone: '', weight: '', height: '', level: 'Intermediário', anamnese: '' });

  const isMaster = currentUser?.role === 'SUPERADMIN';
  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };
  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });

  const fetchData = async () => {
    if (!token || !currentUser) return;
    const res = await fetch(`${API_URL}/alunos`, { headers: getAuthHeaders() });
    if (res.ok) setAlunos(await res.json());
  };

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
    } catch (e) { showToast("Erro no servidor."); } finally { setIsLoggingIn(false); }
  };

  const createAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/alunos`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(formAluno) });
    if (res.ok) { showToast("Aluno Incluído!"); setShowAddAlunoModal(false); fetchData(); }
  };

  const updateAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/alunos/${alunoSelecionado.id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(formAluno) });
    if (res.ok) { showToast("Dados Atualizados!"); setShowEditAlunoModal(false); fetchData(); }
  };

  const deleteAluno = async (id: number) => {
    if(!confirm("Remover aluno e treinos permanentemente?")) return;
    const res = await fetch(`${API_URL}/alunos/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (res.ok) { showToast("Aluno Removido!"); fetchData(); }
  };

  const gerarSemanaIA = async () => {
    const prompt = (document.getElementById('comandoIA') as HTMLTextAreaElement).value;
    if (!iaAlunoId || !prompt) return showToast("Dados incompletos.");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/ai/gerar-autonomo`, { 
        method: 'POST', 
        headers: getAuthHeaders(), 
        body: JSON.stringify({ alunoId: iaAlunoId, comandoPersonal: prompt, frequencia: iaFrequencia }) 
      });
      if (res.ok) { showToast("Planilha Semanal Criada!"); setTabAtiva('alunos'); fetchData(); }
      else showToast("Erro na Engine IA.");
    } catch (e) { showToast("Erro de rede."); } finally { setIsLoading(false); }
  };

  const exportarPDF = (treino: any, aluno: any) => {
    const primaryColor = "#2563eb";
    const rows = treino.exercises?.map((ex: any, i: number) => {
      const youtubeLink = ex.youtubeId ? `https://www.youtube.com/watch?v=${ex.youtubeId}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' execução biomecânica')}`;
      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 16px; font-weight: 800; color: ${primaryColor}; font-size: 18px;">${String(i + 1).padStart(2, '0')}</td>
          <td style="padding: 16px;">
            <div style="font-weight: 800; color: #1e293b; font-size: 16px; text-transform: uppercase;">${ex.name}</div>
            <div style="color: #64748b; font-size: 13px; margin-top: 4px;">P: ${ex.sets} | I: ${ex.weight}</div>
          </td>
          <td style="padding: 16px; text-align: right;"><a href="${youtubeLink}" target="_blank" style="background: #ff0000; color: white; padding: 10px 15px; border-radius: 8px; text-decoration: none; font-weight: 900; font-size: 10px;">VÍDEO 🎬</a></td>
        </tr>`;
    }).join('');
    const html = `<html><head><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap'); body { font-family: 'Inter', sans-serif; margin: 0; background: #f8fafc; } .header { background: ${primaryColor}; color: white; padding: 40px; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; } .container { max-width: 800px; margin: -20px auto 40px; background: white; border-radius: 30px; box-shadow: 0 20px 25px rgba(0,0,0,0.1); overflow: hidden; } table { width: 100%; border-collapse: collapse; }</style></head>
      <body>
        <div class="header"><div style="display:flex; justify-content:space-between; align-items:center;"><div><h1 style="margin:0; font-weight:900; font-style:italic;">EVOTRAINER</h1><p style="margin:5px 0 0; font-weight:700; text-transform:uppercase; font-size:12px;">Planilha de Elite</p></div><div style="text-align:right;"><div style="font-weight:900; font-size:20px;">${aluno.name.toUpperCase()}</div><div style="font-size:12px;">Ficha: ${treino.title}</div></div></div></div>
        <div class="container"><div style="padding:30px; border-bottom:2px solid #f1f5f9; display:flex; gap:20px;"><div style="flex:1; background:#f8fafc; padding:15px; border-radius:15px; border:1px solid #e2e8f0;"><span style="font-size:10px; font-weight:900; color:#64748b; display:block; text-transform:uppercase;">Nível</span><span style="font-weight:800; color:${primaryColor};">${aluno.level}</span></div><div style="flex:1; background:#f8fafc; padding:15px; border-radius:15px; border:1px solid #e2e8f0;"><span style="font-size:10px; font-weight:900; color:#64748b; display:block; text-transform:uppercase;">Peso</span><span style="font-weight:800; color:${primaryColor};">${aluno.weight}kg</span></div></div><table><tbody>${rows}</tbody></table></div>
        <script>window.onload=()=>window.print()</script>
      </body></html>`;
    const win = window.open('', '_blank'); win?.document.write(html); win?.document.close();
  };

  useEffect(() => {
    const t = localStorage.getItem('treino_ai_token');
    const u = localStorage.getItem('treino_ai_user');
    if (t && u) { setToken(t); setCurrentUser(JSON.parse(u)); }
  }, []);

  useEffect(() => { if (currentUser) fetchData(); }, [currentUser, tabAtiva]);

  if (!currentUser) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center font-sans">
       <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl">
          <Dumbbell className="text-blue-500 mx-auto mb-6" size={50} />
          <h1 className="text-4xl font-black text-white italic mb-8 uppercase tracking-tighter">EVO<span className="text-blue-500">TRAINER</span></h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="E-mail" className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none font-bold" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
            <input type="password" placeholder="Senha" className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none font-bold" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
            <button className="w-full p-6 bg-blue-600 rounded-3xl font-black text-white uppercase active:scale-95 transition-all shadow-xl">{isLoggingIn ? 'Sincronizando...' : 'Entrar no Dashboard'}</button>
          </form>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      <header className="p-6 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-black text-xl italic tracking-tighter uppercase leading-none">EVO<span className={isMaster ? 'text-red-500' : 'text-blue-500'}>{isMaster ? 'MASTER' : 'TRAINER'}</span></h1>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:bg-red-500 transition-all border border-slate-700 shadow-xl"><LogOut size={18}/></button>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full pb-40 animate-fade-in">
        
        {tabAtiva === 'dashboard' && (
          <div className="space-y-10">
             <h2 className="text-4xl font-black italic tracking-tight uppercase text-white text-center sm:text-left">Dashboard</h2>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Alunos" value={alunos.length} icon={Users} color="bg-blue-500" />
                <StatCard title="Faturamento" value={`R$ ${alunos.length * 150}`} icon={DollarSign} color="bg-emerald-500" />
                <StatCard title="Engine IA" value="Online" icon={Zap} color="bg-indigo-500" />
                <StatCard title="Métrica" value="98%" icon={Target} color="bg-amber-500" />
             </div>
          </div>
        )}

        {tabAtiva === 'alunos' && (
          <div className="space-y-10">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black italic uppercase">Gestão de Alunos</h2>
                <button onClick={() => { setFormAluno({ name: '', email: '', phone: '', weight: '', height: '', level: 'Intermediário', anamnese: '' }); setShowAddAlunoModal(true); }} className="bg-blue-600 px-8 py-5 rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all"><Plus size={16} /> Incluir Aluno</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {alunos.map(a => (
                  <div key={a.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[3.5rem] shadow-xl hover:border-slate-700 transition-all flex flex-col gap-6">
                     <div className="flex items-center gap-5">
                        <div className={`w-16 h-16 rounded-[1.5rem] bg-blue-600/10 text-blue-500 flex items-center justify-center font-black text-2xl border border-blue-500/10`}>{a.name[0]}</div>
                        <div><h3 className="font-black text-xl leading-none">{a.name}</h3><p className="text-xs text-slate-500 mt-2">{a.email}</p></div>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => { setAlunoSelecionado(a); setShowGerenciarTreinosModal(true); }} className="flex-1 bg-blue-600 text-white p-5 rounded-2xl font-black text-[10px] uppercase shadow-xl active:scale-95">Gerenciar</button>
                        <button onClick={() => { setAlunoSelecionado(a); setFormAluno({ name: a.name, email: a.email, phone: a.phone || '', weight: a.weight || '', height: a.height || '', level: a.level || 'Intermediário', anamnese: a.anamnese || '' }); setShowEditAlunoModal(true); }} className="p-5 bg-blue-600/10 text-blue-500 rounded-2xl shadow-xl hover:bg-blue-600 hover:text-white transition-all"><Edit2 size={22}/></button>
                        <button onClick={() => deleteAluno(a.id)} className="p-5 bg-red-600/10 text-red-500 rounded-2xl shadow-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={22}/></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {tabAtiva === 'ia' && (
           <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-40 text-center">
              <div className="bg-gradient-to-br from-indigo-700 to-blue-900 p-16 rounded-[4rem] shadow-2xl relative overflow-hidden border border-white/10">
                 <Sparkles size={100} className="mx-auto text-white mb-8 animate-pulse" />
                 <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">EvoIntelligence™</h2>
                 <p className="text-blue-100 mt-4 opacity-80 leading-relaxed italic text-lg">Engine Autônoma de Periodização Semanal</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3.5rem] shadow-2xl text-left space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4">1. Selecionar Aluno</label>
                      <select value={iaAlunoId} onChange={e => setIaAlunoId(e.target.value)} className="w-full p-8 bg-slate-950 border-2 border-slate-800 rounded-[2rem] text-white font-black text-xl outline-none focus:border-blue-500 cursor-pointer appearance-none">
                        <option value="">Acessar lista...</option>
                        {alunos.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4">2. Dias de Treino/Semana</label>
                      <select value={iaFrequencia} onChange={e => setIaFrequencia(e.target.value)} className="w-full p-8 bg-slate-950 border-2 border-slate-800 rounded-[2rem] text-white font-black text-xl outline-none focus:border-blue-500 cursor-pointer appearance-none">
                        {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} dias na semana</option>)}
                      </select>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4">3. Comando da Periodização</label>
                    <textarea id="comandoIA" placeholder="Ex: Monte um ABCDE focado em hipertrofia máxima, priorizando ombros..." className="w-full p-8 bg-slate-950 border-2 border-slate-800 rounded-[3rem] text-white font-medium text-lg min-h-[200px] outline-none shadow-inner"></textarea>
                 </div>
                 <button onClick={gerarSemanaIA} disabled={isLoading} className="w-full py-10 bg-white text-blue-900 font-black rounded-[2.5rem] shadow-2xl active:scale-95 transition-all uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-blue-50">
                    {isLoading ? <Activity className="animate-spin" size={30} /> : <><Zap size={24} /> Ativar Engine Biomecânica</>}
                 </button>
              </div>
           </div>
        )}

        {tabAtiva === 'perfil' && (
          <div className="max-w-2xl mx-auto space-y-10 text-center animate-fade-in pb-40">
             <h2 className="text-4xl font-black italic uppercase tracking-tight text-center">Ajustes</h2>
             <div className="bg-slate-900 border border-slate-800 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
                <div className="w-32 h-32 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center text-5xl font-black mx-auto mb-8 border-4 border-blue-500/20 shadow-2xl">
                   {currentUser?.name[0]}
                </div>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{currentUser?.name}</h3>
                <p className="text-slate-500 text-lg mt-2 mb-10">{currentUser?.email}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <button className="bg-slate-800 p-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 border border-slate-700 active:scale-95 transition-all hover:bg-red-600"><Lock size={18}/> Mudar Senha</button>
                   <button className="bg-slate-800 p-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 border border-slate-700 opacity-50 cursor-not-allowed"><Camera size={18}/> Foto Perfil</button>
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

      {/* MODAIS: INCLUIR E EDITAR ALUNO */}
      {(showAddAlunoModal || showEditAlunoModal) && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in text-slate-50">
           <div className="bg-slate-900 border border-slate-800 p-10 rounded-[4rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800"><h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{showAddAlunoModal ? 'Incluir Aluno' : 'Editar Aluno'}</h3><button onClick={() => { setShowAddAlunoModal(false); setShowEditAlunoModal(false); }} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><X size={28}/></button></div>
              <form onSubmit={showAddAlunoModal ? createAluno : updateAluno} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nome Completo" required className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold outline-none" value={formAluno.name} onChange={e => setFormAluno({...formAluno, name: e.target.value})} />
                    <input type="email" placeholder="E-mail de Login" required className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold outline-none" value={formAluno.email} onChange={e => setFormAluno({...formAluno, email: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="tel" placeholder="WhatsApp (DDD + Número)" required className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold outline-none" value={formAluno.phone} onChange={e => setFormAluno({...formAluno, phone: e.target.value})} />
                    <select className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-black" value={formAluno.level} onChange={e => setFormAluno({...formAluno, level: e.target.value})}><option>Iniciante</option><option>Intermediário</option><option>Avançado</option></select>
                 </div>
                 <textarea placeholder="Anamnese / Histórico Médico / Restrições para a IA..." className="w-full p-8 bg-slate-950 border border-slate-800 rounded-[2.5rem] text-white min-h-[150px] outline-none" value={formAluno.anamnese} onChange={e => setFormAluno({...formAluno, anamnese: e.target.value})}></textarea>
                 <button type="submit" className="w-full py-7 bg-blue-600 text-white font-black rounded-[2rem] shadow-2xl uppercase tracking-widest text-[12px]">{showAddAlunoModal ? 'Salvar e Integrar IA' : 'Atualizar Dados'}</button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL: GERENCIAR ALUNO (DOSSIÊ) */}
      {showGerenciarTreinosModal && alunoSelecionado && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in text-slate-50">
           <div className="bg-slate-900 border border-slate-800 p-12 rounded-[4rem] w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-8">
                <div><h3 className="text-3xl font-black text-white tracking-tight uppercase italic">{alunoSelecionado.name}</h3><p className="text-[10px] text-blue-500 font-black uppercase mt-2 tracking-widest">Dossiê de Fichas</p></div>
                <button onClick={() => setShowGerenciarTreinosModal(false)} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white"><X size={28}/></button>
              </div>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {(!alunoSelecionado.workouts || alunoSelecionado.workouts.length === 0) ? (
                  <div className="text-center py-20 text-slate-700 font-black uppercase text-xs tracking-widest border-2 border-dashed border-slate-800 rounded-[2rem]">Nenhuma ficha no banco.</div>
                ) : (
                  alunoSelecionado.workouts.map((w: any) => (
                    <div key={w.id} className="bg-slate-950 p-6 rounded-[2.5rem] border border-slate-800 flex justify-between items-center group hover:border-blue-500/50 transition-all shadow-inner">
                      <p className="font-black text-blue-400 uppercase text-sm tracking-tight">{w.title}</p>
                      <div className="flex gap-2">
                        <button onClick={() => exportarPDF(w, alunoSelecionado)} className="p-4 bg-blue-600 text-white rounded-xl shadow-xl active:scale-90"><Download size={18}/></button>
                        <button onClick={() => enviarWhatsApp(alunoSelecionado, w.title)} className="p-4 bg-emerald-600 text-white rounded-xl shadow-xl active:scale-90"><MessageCircle size={18}/></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>
      )}

      {toastMsg && <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-10 py-5 rounded-full font-black shadow-2xl border border-white/10 animate-bounce">{toastMsg}</div>}
    </div>
  );
}