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
  const [trainers, setTrainers] = useState<any[]>([]);
  
  // States da IA
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

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [recoverEmail, setRecoverEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [formAluno, setFormAluno] = useState({ name: '', email: '', phone: '', weight: '', height: '', level: 'Intermediário', anamnese: '', price: '' });
  const [formTrainer, setFormTrainer] = useState({ name: '', email: '', phone: '', plano: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  const isMaster = currentUser?.role === 'SUPERADMIN';
  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };
  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });

  // LÓGICA DE CRÉDITOS DA IA
  const isIlimitado = currentUser?.plano === 'PRO' || currentUser?.plano === 'ELITE'; 
  const usosRestantes = 5 - (currentUser?.iaUsadaMes || 0);
  const iaOffline = !isIlimitado && !isMaster && usosRestantes <= 0;
  
  let iaStatusText = "Online";
  if (isMaster) iaStatusText = "Online (Master)";
  else if (isIlimitado) iaStatusText = "Ilimitado";
  else if (iaOffline) iaStatusText = "Offline (Upgrade)";
  else iaStatusText = `${usosRestantes}/5 Testes`;

  // CÁLCULO DE FATURAMENTO
  const faturamentoAtletas = alunos.reduce((acc, aluno) => acc + (parseFloat(aluno.price) || 0), 0);
  const faturamentoMaster = trainers.reduce((acc, t) => {
    if (t.plano === 'PRO') return acc + 39.90; // Exato: apenas quem paga cai no faturamento real
    return acc;
  }, 0);
  const faturamentoReal = isMaster ? faturamentoMaster : faturamentoAtletas;

  const fetchData = async () => {
    if (!token || !currentUser) return;
    try {
      // 1. Atualiza os dados do usuário para ver os créditos da IA em tempo real
      const resMe = await fetch(`${API_URL}/me`, { headers: getAuthHeaders() });
      if (resMe.ok) {
         const userData = await resMe.json();
         setCurrentUser(userData);
         localStorage.setItem('treino_ai_user', JSON.stringify(userData));
      }

      // 2. Busca Alunos ou Personais
      const ep = isMaster ? '/superadmin/trainers' : '/alunos';
      const res = await fetch(`${API_URL}${ep}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        isMaster ? setTrainers(data) : setAlunos(data);
      }
    } catch (e) { console.error(e); }
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
    } catch (e) { showToast("Servidor acordando..."); } finally { setIsLoggingIn(false); }
  };

  const handleRecoverPassword = async () => {
    if(!recoverEmail) return showToast("Preencha o e-mail.");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/recover-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: recoverEmail }) });
      const data = await res.json();
      if (res.ok) { showToast(data.message); setShowRecoverModal(false); setRecoverEmail(''); } 
      else { showToast(data.error); }
    } catch (e) { showToast("Erro de rede."); } finally { setIsLoading(false); }
  };

  // Funções Coach
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
    if(!confirm("Remover aluno permanentemente?")) return;
    const res = await fetch(`${API_URL}/alunos/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (res.ok) { showToast("Aluno Removido!"); fetchData(); }
  };

  // Funções Master
  const updateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/superadmin/trainers/${trainerSelecionado.id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ name: formTrainer.name, email: formTrainer.email, phone: formTrainer.phone }) });
    if (res.ok) { showToast("Personal Atualizado!"); setShowEditTrainerModal(false); fetchData(); }
  };
  const updatePlan = async (id: number, plano: string) => {
    const res = await fetch(`${API_URL}/superadmin/trainers/${id}/plano`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ plano }) });
    if (res.ok) { showToast("Plano Atualizado!"); setShowEditPlanModal(false); fetchData(); }
  };
  const deleteTrainer = async (id: number) => {
    if(!confirm("ATENÇÃO: Remover este Personal excluirá permanentemente todos os alunos e treinos dele. Prosseguir?")) return;
    const res = await fetch(`${API_URL}/superadmin/trainers/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (res.ok) { showToast("Personal Removido!"); fetchData(); }
  };

  const deletePlanilha = async (planilhaId: number) => {
    if(!confirm("Deletar esta planilha do dossiê?")) return;
    const res = await fetch(`${API_URL}/treinos/${planilhaId}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (res.ok) { showToast("Planilha Excluída!"); setAlunoSelecionado((prev: any) => ({ ...prev, workouts: prev.workouts.filter((w: any) => w.id !== planilhaId) })); fetchData(); }
  };
  const changePassword = async () => {
    const res = await fetch(`${API_URL}/perfil/senha`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(passwordForm) });
    if (res.ok) { showToast("Senha alterada!"); setShowPasswordModal(false); setPasswordForm({ currentPassword: '', newPassword: '' }); } else showToast("Senha atual incorreta.");
  };

  const gerarSemanaIA = async () => {
    if (iaOffline) return; // Segurança extra caso o usuário force o botão
    const prompt = (document.getElementById('comandoIA') as HTMLTextAreaElement).value;
    if (!iaAlunoId || !prompt) return showToast("Dados incompletos.");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/ai/gerar-autonomo`, { 
        method: 'POST', headers: getAuthHeaders(), 
        body: JSON.stringify({ alunoId: iaAlunoId, comandoPersonal: prompt, frequencia: iaFrequencia, ciclo: iaCiclo, semanas: iaSemanas }) 
      });
      const data = await res.json();
      if (res.ok) { 
        showToast("Periodização Criada!"); 
        setTabAtiva('alunos'); 
        fetchData(); // Atualiza a contagem da IA imediatamente
      } else {
        showToast(data.error || "Erro na Engine IA.");
      }
    } catch (e) { showToast("Erro de rede."); } finally { setIsLoading(false); }
  };

  const calcularDataRevisao = (dataCriacao: string, semanas: string) => {
    const numSemanas = parseInt(semanas.split(' ')[0]) || 4;
    const data = new Date(dataCriacao); data.setDate(data.getDate() + (numSemanas * 7)); return data.toLocaleDateString('pt-BR');
  };

  const exportarPDF = (treino: any, aluno: any) => {
    const primaryColor = "#2563eb";
    const dataCriado = new Date(treino.createdAt).toLocaleDateString('pt-BR');
    const dataRevisao = calcularDataRevisao(treino.createdAt, treino.duration || '4 Semanas');
    const rows = treino.exercises?.map((ex: any, i: number) => {
      const youtubeLink = ex.youtubeId ? `https://www.youtube.com/watch?v=${ex.youtubeId}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' execução biomecânica')}`;
      return `<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 16px; font-weight: 800; color: ${primaryColor}; font-size: 18px;">${String(i + 1).padStart(2, '0')}</td><td style="padding: 16px;"><div style="font-weight: 800; color: #1e293b; font-size: 16px; text-transform: uppercase;">${ex.name}</div><div style="color: #64748b; font-size: 13px; margin-top: 4px;">Séries: ${ex.sets} | Carga: ${ex.weight}</div></td><td style="padding: 16px; text-align: right;"><a href="${youtubeLink}" target="_blank" style="background: #ff0000; color: white; padding: 10px 15px; border-radius: 8px; text-decoration: none; font-weight: 900; font-size: 10px;">VÍDEO 🎬</a></td></tr>`;
    }).join('');

    const html = `<html><head><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap'); body { font-family: 'Inter', sans-serif; margin: 0; background: #f8fafc; } .header { background: ${primaryColor}; color: white; padding: 40px; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; } .container { max-width: 800px; margin: -20px auto 40px; background: white; border-radius: 30px; box-shadow: 0 20px 25px rgba(0,0,0,0.1); overflow: hidden; } table { width: 100%; border-collapse: collapse; }</style></head>
      <body>
        <div class="header"><div style="display:flex; justify-content:space-between; align-items:center;"><div><h1 style="margin:0; font-weight:900; font-style:italic;">EVOTRAINER</h1><p style="margin:5px 0 0; font-weight:700; text-transform:uppercase; font-size:12px;">Periodização de Elite</p></div><div style="text-align:right;"><div style="font-weight:900; font-size:20px;">${aluno.name.toUpperCase()}</div><div style="font-size:12px;">Ficha: ${treino.title}</div></div></div></div>
        <div class="container"><div style="padding:20px 30px; background: #eff6ff; display:flex; gap:20px; border-bottom: 1px solid #e2e8f0;"><div style="flex:1"><span style="font-size:10px; font-weight:900; color:#3b82f6; text-transform:uppercase;">Enviado em</span><br/><strong style="color:#1e3a8a">${dataCriado}</strong></div><div style="flex:1"><span style="font-size:10px; font-weight:900; color:#ef4444; text-transform:uppercase;">Data de Revisão</span><br/><strong style="color:#991b1b">${dataRevisao}</strong></div></div><div style="padding:20px 30px; border-bottom:2px solid #f1f5f9; display:flex; gap:20px;"><div style="flex:1; background:#f8fafc; padding:15px; border-radius:15px; border:1px solid #e2e8f0;"><span style="font-size:10px; font-weight:900; color:#64748b; display:block; text-transform:uppercase;">Nível</span><span style="font-weight:800; color:${primaryColor};">${aluno.level}</span></div><div style="flex:1; background:#f8fafc; padding:15px; border-radius:15px; border:1px solid #e2e8f0;"><span style="font-size:10px; font-weight:900; color:#64748b; display:block; text-transform:uppercase;">Peso</span><span style="font-weight:800; color:${primaryColor};">${aluno.weight || '--'}kg</span></div></div><table><tbody>${rows}</tbody></table></div>
        <div style="text-align:center; padding: 20px; font-size:12px; color: #64748b;"><strong>EVOTRAINER™</strong> - Ciência e Resultado</div>
        <script>window.onload=()=>window.print()</script>
      </body></html>`;
    const win = window.open('', '_blank'); win?.document.write(html); win?.document.close();
  };

  const enviarWhatsApp = (aluno: any, treino: any) => {
    const cleanPhone = aluno.phone?.replace(/\D/g, '');
    const dataRev = calcularDataRevisao(treino.createdAt, treino.duration || '4 Semanas');
    const msg = encodeURIComponent(`Fala ${aluno.name.split(' ')[0]}! 💪 Seu novo protocolo "${treino.title}" já está disponível no EvoTrainer.\n\n📅 Nossa próxima revisão de treino será em: *${dataRev}*.\nBora esmagar!`);
    window.open(`https://wa.me/55${cleanPhone}?text=${msg}`, '_blank');
  };

  useEffect(() => {
    const t = localStorage.getItem('treino_ai_token');
    const u = localStorage.getItem('treino_ai_user');
    if (t && u) { setToken(t); setCurrentUser(JSON.parse(u)); }
  }, []);

  useEffect(() => { if (currentUser) fetchData(); }, [currentUser, tabAtiva]);

  // ================= TELA DE LOGIN PÚBLICA =================
  if (!currentUser) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center font-sans relative">
       <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative z-10">
          <Dumbbell className="text-blue-500 mx-auto mb-6" size={50} />
          <h1 className="text-4xl font-black text-white italic mb-8 uppercase tracking-tighter">EVO<span className="text-blue-500">TRAINER</span></h1>
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
               <button type="button" onClick={() => setShowRecoverModal(true)} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-500 transition-all">Esqueceu a Senha?</button>
            </div>
            <button className="w-full p-6 bg-blue-600 rounded-3xl font-black text-white uppercase active:scale-95 transition-all shadow-xl mt-4 hover:bg-blue-500">{isLoggingIn ? 'Sincronizando...' : 'Entrar no Dashboard'}</button>
          </form>
       </div>

       {showRecoverModal && (
         <div className="fixed inset-0 bg-black/98 z-[800] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in text-slate-50">
            <div className="bg-slate-900 border border-slate-800 p-10 md:p-12 rounded-[3rem] w-full max-w-md shadow-2xl text-center relative">
               <button onClick={() => setShowRecoverModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-all"><X size={24}/></button>
               <h3 className="text-2xl font-black text-white mb-2 italic uppercase tracking-tighter">Recuperar Acesso</h3>
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8">Enviaremos instruções seguras</p>
               <div className="space-y-4 text-left">
                  <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">E-mail Cadastrado</label>
                     <input type="email" required className="w-full p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 font-bold transition-all" value={recoverEmail} onChange={e => setRecoverEmail(e.target.value)} />
                  </div>
                  <button onClick={handleRecoverPassword} disabled={isLoading} className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl active:scale-95 shadow-xl transition-all uppercase tracking-widest text-[11px] mt-4 hover:bg-blue-500">
                    {isLoading ? <Activity className="animate-spin mx-auto" size={20} /> : 'Enviar Instruções'}
                  </button>
               </div>
            </div>
         </div>
       )}
       {toastMsg && <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-10 py-5 rounded-full font-black shadow-[0_20px_50px_rgba(37,99,235,0.5)] flex items-center gap-4 text-sm animate-bounce border border-white/10"><CheckCircle2 size={24} /> {toastMsg}</div>}
    </div>
  );

  // ================= RENDERIZAÇÃO: DASHBOARD LOGADO =================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      <header className="p-6 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-black text-xl italic tracking-tighter uppercase leading-none">EVO<span className={isMaster ? 'text-red-500' : 'text-blue-500'}>{isMaster ? 'MASTER' : 'TRAINER'}</span></h1>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:bg-red-500 transition-all border border-slate-700 shadow-xl"><LogOut size={18}/></button>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full pb-40 animate-fade-in">
        
        {/* DASHBOARD TAB */}
        {tabAtiva === 'dashboard' && (
          <div className="space-y-10">
             <h2 className="text-4xl font-black italic tracking-tight uppercase text-white text-center sm:text-left">Dashboard</h2>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title={isMaster ? "Total Personais" : "Total Alunos"} value={isMaster ? trainers.length : alunos.length} icon={Users} color="bg-blue-500" />
                <StatCard title={isMaster ? "Receita (SaaS)" : "Faturamento"} value={`R$ ${faturamentoReal.toFixed(2).replace('.',',')}`} icon={DollarSign} color="bg-emerald-500" />
                <StatCard title="Engine IA" value={iaStatusText} icon={Zap} color={iaOffline ? "bg-red-500" : "bg-indigo-500"} />
                <StatCard title="Status" value="OK" icon={Target} color="bg-amber-500" />
             </div>
          </div>
        )}

        {/* ALUNOS / PERSONAIS TAB */}
        {tabAtiva === 'alunos' && (
          <div className="space-y-10">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black italic uppercase">{isMaster ? 'Gestão de Personais' : 'Gestão de Alunos'}</h2>
                {!isMaster && (
                  <button onClick={() => { setFormAluno({ name: '', email: '', phone: '', weight: '', height: '', level: 'Intermediário', anamnese: '', price: '' }); setShowAddAlunoModal(true); }} className="bg-blue-600 px-8 py-5 rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all"><Plus size={16} className="inline mr-2" /> Incluir Aluno</button>
                )}
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(isMaster ? trainers : alunos).map(item => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[3.5rem] shadow-xl hover:border-slate-700 transition-all flex flex-col gap-6 relative">
                     
                     {/* TAG DE PREÇO (ALUNO) */}
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
                          {isMaster && <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-widest">Plano: {item.plano} | Alunos: {item._count?.alunos || 0}</p>}
                        </div>
                     </div>
                     <div className="flex gap-2 mt-2">
                        {isMaster ? (
                          <>
                            <button onClick={() => { setTrainerSelecionado(item); setShowEditPlanModal(true); }} className="flex-1 bg-slate-800 text-white p-5 rounded-2xl font-black text-[10px] uppercase shadow-xl active:scale-95 hover:bg-slate-700 transition-all">Alterar Plano</button>
                            <button onClick={() => { setTrainerSelecionado(item); setFormTrainer({ name: item.name, email: item.email, phone: item.phone || '', plano: item.plano }); setShowEditTrainerModal(true); }} className="p-5 bg-blue-600/10 text-blue-500 rounded-2xl shadow-xl hover:bg-blue-600 hover:text-white transition-all" title="Editar Personal"><Edit2 size={22}/></button>
                            <button onClick={() => deleteTrainer(item.id)} className="p-5 bg-red-600/10 text-red-500 rounded-2xl shadow-xl hover:bg-red-600 hover:text-white transition-all" title="Deletar Personal"><Trash2 size={22}/></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setAlunoSelecionado(item); setShowGerenciarTreinosModal(true); }} className="flex-1 bg-blue-600 text-white p-5 rounded-2xl font-black text-[10px] uppercase shadow-xl active:scale-95 hover:bg-blue-500 transition-all">Gerenciar Treino</button>
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

        {/* EVOINTELLIGENCE™ TAB (COM TRAVA DE TESTE) */}
        {tabAtiva === 'ia' && (
           <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-40 text-center">
              <div className={`bg-gradient-to-br ${iaOffline ? 'from-red-700 to-red-950 border-red-500/30' : 'from-indigo-700 to-blue-900 border-white/10'} p-16 rounded-[4rem] shadow-2xl relative overflow-hidden border text-center transition-all`}>
                 {iaOffline ? (
                   <Lock size={100} className="mx-auto text-red-200 mb-8" />
                 ) : (
                   <Sparkles size={100} className="mx-auto text-white mb-8 animate-pulse" />
                 )}
                 <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">EvoIntelligence™</h2>
                 <p className="text-white/80 mt-4 leading-relaxed italic text-lg">
                   {iaOffline ? "Você atingiu o limite de testes. Faça o upgrade para continuar." : "Engine Autônoma de Periodização Semanal"}
                 </p>
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
                        {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} dias na semana</option>)}
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
                        {[1,2,3,4,5,6,8,12].map(n => <option key={n} value={n}>{n} Semanas</option>)}
                      </select>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4">5. Comando da Periodização</label>
                    <textarea disabled={iaOffline} id="comandoIA" placeholder="Ex: Monte um ABCDE focado em hipertrofia máxima, priorizando ombros..." className="w-full p-8 bg-slate-950 border-2 border-slate-800 rounded-[3rem] text-white font-medium text-lg min-h-[200px] outline-none shadow-inner"></textarea>
                 </div>
                 
                 <button 
                    onClick={iaOffline ? () => window.open('https://wa.me/5521987708652?text=Oi, quero assinar o plano Mensal do EvoTrainer!', '_blank') : gerarSemanaIA} 
                    disabled={isLoading && !iaOffline} 
                    className={`w-full py-10 font-black rounded-[2.5rem] shadow-2xl active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-4 ${iaOffline ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-white text-blue-900 hover:bg-blue-50'}`}
                 >
                    {isLoading ? <Activity className="animate-spin" size={30} /> : (iaOffline ? <><Lock size={24} /> Fazer Upgrade (R$ 39,90)</> : <><Zap size={24} /> Ativar Engine Biomecânica</>)}
                 </button>
              </div>
           </div>
        )}

        {/* PERFIL TAB PROTEGIDA */}
        {tabAtiva === 'perfil' && (
          <div className="max-w-2xl mx-auto space-y-10 text-center animate-fade-in pb-40">
             <h2 className="text-4xl font-black italic uppercase tracking-tight text-center">Configurações</h2>
             <div className="bg-slate-900 border border-slate-800 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
                <div className="w-32 h-32 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center text-5xl font-black mx-auto mb-8 border-4 border-blue-500/20 shadow-2xl">
                   {getInitial()}
                </div>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{currentUser?.name || 'Usuário'}</h3>
                <p className="text-slate-500 text-lg mt-2 mb-4">{currentUser?.email || ''}</p>
                {!isMaster && <p className="text-blue-500 text-xs font-black uppercase tracking-widest mb-10 border border-blue-500/20 bg-blue-500/5 inline-block px-4 py-2 rounded-full">Plano: {currentUser?.plano}</p>}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <button onClick={() => setShowPasswordModal(true)} className="bg-slate-800 p-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 border border-slate-700 active:scale-95 transition-all hover:bg-red-600"><Lock size={18}/> Mudar Senha</button>
                   {iaOffline ? (
                      <button onClick={() => window.open('https://wa.me/5521987708652?text=Oi, quero assinar o plano Mensal do EvoTrainer!', '_blank')} className="bg-emerald-600 p-6 rounded-[2rem] font-black text-[11px] text-white uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-emerald-500"><Crown size={18}/> Assinar Premium</button>
                   ) : (
                      <button className="bg-slate-800 p-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 border border-slate-700 opacity-50 cursor-not-allowed"><Camera size={18}/> Foto Perfil</button>
                   )}
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

      {/* MODAL MASTER: EDITAR PERSONAL */}
      {showEditTrainerModal && isMaster && trainerSelecionado && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in text-slate-50">
           <div className="bg-slate-900 border border-slate-800 p-10 rounded-[4rem] w-full max-w-2xl shadow-2xl relative">
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800">
                 <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Editar Personal</h3>
                 <button onClick={() => setShowEditTrainerModal(false)} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><X size={28}/></button>
              </div>
              <form onSubmit={updateTrainer} className="space-y-6 text-left">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Nome Completo</label>
                      <input type="text" required className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500" value={formTrainer.name} onChange={e => setFormTrainer({...formTrainer, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">E-mail Profissional</label>
                      <input type="email" required className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500" value={formTrainer.email} onChange={e => setFormTrainer({...formTrainer, email: e.target.value})} />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">WhatsApp</label>
                    <input type="tel" required className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500" value={formTrainer.phone} onChange={e => setFormTrainer({...formTrainer, phone: e.target.value})} />
                 </div>
                 <button type="submit" className="w-full py-8 bg-blue-600 text-white font-black rounded-[2.5rem] shadow-2xl uppercase tracking-widest text-[12px] active:scale-95 transition-all mt-4 hover:bg-blue-500">Atualizar Personal</button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL MASTER: EDITAR PLANO */}
      {showEditPlanModal && isMaster && trainerSelecionado && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in text-slate-50">
           <div className="bg-slate-900 border border-slate-800 p-12 rounded-[4rem] w-full max-w-md shadow-2xl text-center relative">
              <button onClick={() => setShowEditPlanModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-white"><X size={24}/></button>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">Alterar Plano</h3>
              <p className="text-slate-500 mb-10 font-medium uppercase tracking-widest">{trainerSelecionado.name}</p>
              <div className="space-y-4">
                 {['TESTE', 'MENSAL'].map(p => {
                   const bdValue = p === 'TESTE' ? 'GRATIS' : 'PRO';
                   return (
                     <button key={p} onClick={() => updatePlan(trainerSelecionado.id, bdValue)} className={`w-full p-6 rounded-3xl font-black text-[12px] uppercase border transition-all ${trainerSelecionado.plano === bdValue ? 'bg-red-600 text-white border-red-600 shadow-2xl' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>PLANO {p}</button>
                   );
                 })}
              </div>
           </div>
        </div>
      )}

      {/* MODAIS COACH: INCLUIR / EDITAR ALUNO */}
      {(showAddAlunoModal || showEditAlunoModal) && !isMaster && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in text-slate-50">
           <div className="bg-slate-900 border border-slate-800 p-10 rounded-[4rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative">
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800">
                 <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{showAddAlunoModal ? 'Incluir Aluno' : 'Editar Aluno'}</h3>
                 <button onClick={() => { setShowAddAlunoModal(false); setShowEditAlunoModal(false); }} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><X size={28}/></button>
              </div>
              <form onSubmit={showAddAlunoModal ? createAluno : updateAluno} className="space-y-6 text-left">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Nome Completo</label>
                      <input type="text" required className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500" value={formAluno.name} onChange={e => setFormAluno({...formAluno, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">E-mail de Login</label>
                      <input type="email" required className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500" value={formAluno.email} onChange={e => setFormAluno({...formAluno, email: e.target.value})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">WhatsApp</label>
                      <input type="tel" required className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500" value={formAluno.phone} onChange={e => setFormAluno({...formAluno, phone: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Valor Mensalidade</label>
                      <div className="relative">
                         <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">R$</span>
                         <input type="number" step="0.01" className="w-full p-6 pl-14 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-blue-500" value={formAluno.price} onChange={e => setFormAluno({...formAluno, price: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Nível de Treino</label>
                      <select className="w-full p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-black outline-none focus:border-blue-500 appearance-none" value={formAluno.level} onChange={e => setFormAluno({...formAluno, level: e.target.value})}>
                         <option>Iniciante</option><option>Intermediário</option><option>Avançado</option>
                      </select>
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Prontuário Médico / Restrições (IA)</label>
                    <textarea className="w-full p-8 bg-slate-950 border border-slate-800 rounded-[2.5rem] text-white min-h-[150px] outline-none focus:border-blue-500" value={formAluno.anamnese} onChange={e => setFormAluno({...formAluno, anamnese: e.target.value})}></textarea>
                 </div>
                 
                 <button type="submit" className="w-full py-8 bg-blue-600 text-white font-black rounded-[2.5rem] shadow-2xl uppercase tracking-widest text-[12px] active:scale-95 transition-all mt-4 hover:bg-blue-500">
                    {showAddAlunoModal ? 'Salvar e Integrar IA' : 'Atualizar Dados do Aluno'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL COACH: GERENCIAR TREINOS */}
      {showGerenciarTreinosModal && !isMaster && alunoSelecionado && (
        <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 backdrop-blur-md animate-fade-in text-slate-50">
           <div className="bg-slate-900 border border-slate-800 p-12 rounded-[4rem] w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-8">
                <div><h3 className="text-3xl font-black text-white tracking-tight uppercase italic">{alunoSelecionado.name}</h3><p className="text-[10px] text-blue-500 font-black uppercase mt-2 tracking-widest">Dossiê de Periodização</p></div>
                <button onClick={() => setShowGerenciarTreinosModal(false)} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white"><X size={28}/></button>
              </div>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {(!alunoSelecionado.workouts || alunoSelecionado.workouts.length === 0) ? (
                  <div className="text-center py-20 text-slate-700 font-black uppercase text-xs tracking-widest border-2 border-dashed border-slate-800 rounded-[2rem]">Nenhuma planilha no banco.</div>
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
                          <button onClick={() => exportarPDF(w, alunoSelecionado)} className="p-4 bg-blue-600 text-white rounded-xl shadow-xl active:scale-90 hover:bg-blue-500 transition-all"><Download size={18}/></button>
                          <button onClick={() => enviarWhatsApp(alunoSelecionado, w)} className="p-4 bg-emerald-600 text-white rounded-xl shadow-xl active:scale-90 hover:bg-emerald-500 transition-all"><MessageCircle size={18}/></button>
                          <button onClick={() => deletePlanilha(w.id)} className="p-4 bg-red-600/20 text-red-500 rounded-xl shadow-xl active:scale-90 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
           </div>
        </div>
      )}

      {toastMsg && <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-10 py-5 rounded-full font-black shadow-[0_20px_50px_rgba(37,99,235,0.5)] flex items-center gap-4 text-sm animate-bounce border border-white/10"><CheckCircle2 size={24} /> {toastMsg}</div>}
    </div>
  );
}