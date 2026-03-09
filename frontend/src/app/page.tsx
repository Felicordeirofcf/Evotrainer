'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, LogOut, CheckCircle2, Flame, Play, 
  Video, X, User as UserIcon, Plus, Activity, Dumbbell,
  Trash2, Ban, Unlock, Home, Calendar, List, AlertTriangle, Pencil, Link as LinkIcon, Lock, Camera, Save, Search,
  Download // Importado para o banner de instalação
} from 'lucide-react';

// ==========================================
// 🚀 CONFIGURAÇÃO DA API (SEGURA E DINÂMICA)
// ==========================================
const getBaseUrl = () => {
  // Corrigido: Verificação de segurança para evitar "process is not defined"
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return 'https://evotrainer.onrender.com';
};

const BASE_URL = getBaseUrl();

const API_URL = BASE_URL.endsWith('/') 
  ? `${BASE_URL}api` 
  : `${BASE_URL}/api`;

export default function App() {
  // --- ESTADOS DE AUTENTICAÇÃO ---
  const [currentUser, setCurrentUser] = useState<any>(null); 
  const [token, setToken] = useState<string | null>(null);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // --- ESTADOS PWA (INSTALAÇÃO) ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // --- ESTADOS ADMIN ---
  const [alunos, setAlunos] = useState<any[]>([]);
  const [buscaAluno, setBuscaAluno] = useState(''); 
  const [showAddModal, setShowAddModal] = useState(false);
  const [novoAluno, setNovoAluno] = useState({ name: '', email: '', password: '' });

  const [showTreinoModal, setShowTreinoModal] = useState(false);
  const [showGerenciarTreinosModal, setShowGerenciarTreinosModal] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<any>(null);
  const [isCriandoTreino, setIsCriandoTreino] = useState(false);
  
  const [isEditingTreino, setIsEditingTreino] = useState(false);
  const [treinoEditId, setTreinoEditId] = useState<number | null>(null);

  const [novoTreino, setNovoTreino] = useState({
    title: '', duration: '', dayOfWeek: 'Segunda', exercises: [{ name: '', sets: '', weight: '', youtubeId: '', isConjugado: false, conjugadoCom: '' }]
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [treinoParaExcluir, setTreinoParaExcluir] = useState<{id: number, title: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- ESTADOS ALUNO ---
  const [treinosAluno, setTreinosAluno] = useState<any[]>([]);
  const [treinoIniciado, setTreinoIniciado] = useState(false);
  const [exerciciosFeitos, setExerciciosFeitos] = useState<number[]>([]);
  const [videoAtivo, setVideoAtivo] = useState<string | null>(null);
  const [alunoTabAtiva, setAlunoTabAtiva] = useState('home'); 

  // --- ESTADOS PERFIL E SENHA ---
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '', email: '', phone: '', age: '', weight: '', height: '', goal: 'Hipertrofia', notes: ''
  });
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  const diasCompletos = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const diasCurtos = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const [diaAtivo, setDiaAtivo] = useState(diasCompletos[new Date().getDay()]);

  // --- EFEITOS E FUNÇÕES BASE ---
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const simularUploadFoto = () => {
    showToast("Funcionalidade de foto em breve!");
  };

  // --- LÓGICA DE INSTALAÇÃO PWA ---
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('treino_ai_token');
    const savedUser = localStorage.getItem('treino_ai_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        age: currentUser.age || '',
        weight: currentUser.weight || '',
        height: currentUser.height || '',
        goal: currentUser.goal || 'Hipertrofia',
        notes: currentUser.notes || ''
      });
    }
  }, [currentUser]);

  const getAuthHeaders = () => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  // --- SISTEMA DE LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return showToast("Preencha todos os campos.");
    
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
        setLoginPassword('');
        showToast("Bem-vindo de volta!");
      } else {
        showToast(data.error || "Erro no login.");
      }
    } catch (error) {
      showToast(`Erro ao ligar com o servidor.`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('treino_ai_token');
    localStorage.removeItem('treino_ai_user');
    setTreinoIniciado(false);
  };

  // --- FUNÇÕES DA API ---
  const fetchAlunos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/alunos`, { headers: getAuthHeaders() });
      if (response.ok) setAlunos(await response.json());
    } catch (error) {
      showToast("Erro ao ligar à API.");
    } finally {
      setIsLoading(false);
    }
  };

  const criarAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/alunos`, {
        method: 'POST', 
        headers: getAuthHeaders(), 
        body: JSON.stringify(novoAluno)
      });
      if (res.ok) {
        showToast("Aluno registado com sucesso!");
        setShowAddModal(false); 
        setNovoAluno({ name: '', email: '', password: '' }); 
        fetchAlunos();
      } else {
        const data = await res.json();
        showToast(data.error || "Erro ao criar aluno.");
      }
    } catch (error) { showToast("Erro de ligação."); }
  };

  const toggleStatusAluno = async (alunoId: number, statusAtual: string) => {
    const novoStatus = statusAtual === 'Bloqueado' ? 'Ativo' : 'Bloqueado';
    try {
      const res = await fetch(`${API_URL}/alunos/${alunoId}/status`, {
        method: 'PUT', 
        headers: getAuthHeaders(), 
        body: JSON.stringify({ status: novoStatus })
      });
      if (res.ok) { showToast(`Estado atualizado para ${novoStatus}!`); fetchAlunos(); }
    } catch (error) { showToast("Erro ao alterar estado."); }
  };

  const excluirAluno = async (alunoId: number, nome: string) => {
    if (!window.confirm(`ATENÇÃO: Tem a certeza absoluta que quer APAGAR o aluno "${nome}"? Esta ação vai apagar todo o histórico e fichas de treino dele e não pode ser desfeita.`)) {
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/alunos/${alunoId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (res.ok) {
        showToast(`Aluno ${nome} apagado com sucesso.`);
        fetchAlunos(); 
      } else {
        showToast("Erro ao apagar aluno.");
      }
    } catch (error) {
      showToast("Erro de ligação ao servidor.");
    }
  };

  const executarExclusaoTreino = async () => {
    if (!treinoParaExcluir) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/treinos/${treinoParaExcluir.id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        showToast("Treino apagado!");
        fetchAlunos(); 
        if (showGerenciarTreinosModal && alunoSelecionado) {
           setAlunoSelecionado({
             ...alunoSelecionado,
             workouts: alunoSelecionado.workouts.filter((w: any) => w.id !== treinoParaExcluir.id)
           });
        }
        setShowDeleteModal(false);
        setTreinoParaExcluir(null);
      }
    } catch (error) { showToast("Erro ao apagar treino."); } finally { setIsDeleting(false); }
  };

  const confirmarExclusao = (workoutId: number, title: string) => {
    setTreinoParaExcluir({ id: workoutId, title: title });
    setShowDeleteModal(true);
  };

  const abrirModalEdicao = async (treino: any) => {
    setShowGerenciarTreinosModal(false); 
    setIsEditingTreino(true);
    setTreinoEditId(treino.id);
    
    let exercisesToEdit = treino.exercises;

    if (!exercisesToEdit) {
      try {
        const res = await fetch(`${API_URL}/treinos/aluno/${alunoSelecionado.id}`, { headers: getAuthHeaders() });
        if (res.ok) {
          const treinosCompletos = await res.json();
          const treinoCompleto = treinosCompletos.find((t: any) => t.id === treino.id);
          if (treinoCompleto) {
            exercisesToEdit = treinoCompleto.exercises;
          }
        }
      } catch (error) { console.error("Erro ao buscar detalhes da ficha:", error); }
    }
    
    setNovoTreino({
      title: treino.title,
      duration: treino.duration,
      dayOfWeek: treino.dayOfWeek,
      exercises: exercisesToEdit && exercisesToEdit.length > 0 
        ? exercisesToEdit.map((e:any) => ({...e})) 
        : [{ name: '', sets: '', weight: '', youtubeId: '', isConjugado: false, conjugadoCom: '' }]
    });
    
    setShowTreinoModal(true); 
  };

  const salvarTreino = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoSelecionado) return;
    setIsCriandoTreino(true);
    showToast(isEditingTreino ? "A atualizar treino..." : `A procurar vídeos para ${alunoSelecionado.name}...`);
    
    try {
      const payload = { ...novoTreino, userId: alunoSelecionado.id };
      const url = isEditingTreino ? `${API_URL}/treinos/${treinoEditId}` : `${API_URL}/treinos`;
      const metodo = isEditingTreino ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: metodo, 
        headers: getAuthHeaders(), 
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        showToast(isEditingTreino ? "Treino atualizado com sucesso!" : "Treino atribuído com vídeos!");
        setShowTreinoModal(false); 
        setAlunoSelecionado(null);
        setIsEditingTreino(false);
        setTreinoEditId(null);
        setNovoTreino({ title: '', duration: '', dayOfWeek: 'Segunda', exercises: [{ name: '', sets: '', weight: '', youtubeId: '', isConjugado: false, conjugadoCom: '' }] });
        fetchAlunos();
      }
    } catch (error) { showToast("Erro."); } finally { setIsCriandoTreino(false); }
  };

  const fetchTreinosAluno = async () => {
    if (currentUser?.status === 'Bloqueado') { setTreinosAluno([]); return; }
    try {
      const res = await fetch(`${API_URL}/treinos/aluno/${currentUser.id}`, { headers: getAuthHeaders() });
      if (res.ok) setTreinosAluno(await res.json());
    } catch (error) { console.error(error); }
  };

  const finalizarTreino = async (nomeDoTreino: string) => {
    try {
      const res = await fetch(`${API_URL}/treinos/finalizar`, {
        method: 'POST', 
        headers: getAuthHeaders(), 
        body: JSON.stringify({ userId: currentUser.id, workoutName: nomeDoTreino })
      });
      if (res.ok) {
        const result = await res.json();
        showToast(result.message);
        setCurrentUser({ ...currentUser, streak: result.novaOfensiva });
        localStorage.setItem('treino_ai_user', JSON.stringify({ ...currentUser, streak: result.novaOfensiva }));
        setTreinoIniciado(false); setExerciciosFeitos([]); setAlunoTabAtiva('home');
      }
    } catch (error) { showToast("Erro ao guardar o treino."); }
  };

  const salvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/alunos/${currentUser.id}/perfil`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileForm)
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
        localStorage.setItem('treino_ai_user', JSON.stringify(updatedUser));
        showToast("Perfil atualizado com sucesso!");
      } else { showToast("Erro ao salvar perfil."); }
    } catch (error) { showToast("Erro de ligação."); } finally { setIsSavingProfile(false); }
  };

  const mudarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) return showToast("A nova senha e a confirmação não coincidem.");
    setIsChangingPassword(true);
    try {
      const res = await fetch(`${API_URL}/alunos/${currentUser.id}/senha`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.new })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Senha alterada com sucesso!");
        setPasswordForm({ current: '', new: '', confirm: '' });
      } else { showToast(data.error || "Erro ao alterar a senha."); }
    } catch (error) { showToast("Erro ao conectar ao servidor."); } finally { setIsChangingPassword(false); }
  };

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') fetchAlunos();
    if (currentUser?.role === 'STUDENT') fetchTreinosAluno();
  }, [currentUser]);

  const alunosFiltrados = alunos.filter(aluno => 
    aluno.name.toLowerCase().includes(buscaAluno.toLowerCase()) || 
    aluno.email.toLowerCase().includes(buscaAluno.toLowerCase())
  );

  const getGroupedExercises = (exercisesArray: any[]) => {
    const grouped: any[] = [];
    const skipIndices = new Set(); 
    exercisesArray.forEach((ex, idx) => {
      if (skipIndices.has(idx)) return; 
      const group = { main: { ...ex, originalIndex: idx }, partners: [] as any[] };
      if (ex.isConjugado && ex.conjugadoCom && ex.conjugadoCom.trim() !== '') {
        const partnerIdx = exercisesArray.findIndex((e, i) => 
            i !== idx && !skipIndices.has(i) && e.name.trim().toLowerCase() === ex.conjugadoCom.trim().toLowerCase() && e.name.trim() !== ''
        );
        if (partnerIdx !== -1) {
          group.partners.push({ ...exercisesArray[partnerIdx], originalIndex: partnerIdx });
          skipIndices.add(partnerIdx); 
        }
      }
      grouped.push(group);
    });
    return grouped;
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const n = [...novoTreino.exercises];
    n[index] = { ...n[index], [field]: value };
    setNovoTreino({...novoTreino, exercises: n});
  };

  const updatePartnerName = (partnerOriginalIndex: number, parentOriginalIndex: number, newName: string) => {
    const n = [...novoTreino.exercises];
    n[partnerOriginalIndex] = { ...n[partnerOriginalIndex], name: newName };
    n[parentOriginalIndex] = { ...n[parentOriginalIndex], conjugadoCom: newName }; 
    setNovoTreino({...novoTreino, exercises: n});
  };

  const removerExercicio = (indexToRemove: number) => {
    const n = [...novoTreino.exercises];
    const removedName = n[indexToRemove].name;
    n.splice(indexToRemove, 1);
    n.forEach(ex => {
      if (ex.conjugadoCom === removedName) {
        ex.isConjugado = false;
        ex.conjugadoCom = '';
      }
    });
    setNovoTreino({...novoTreino, exercises: n});
  };

  const toggleConjugado = (index: number) => {
    const n = [...novoTreino.exercises];
    n[index].isConjugado = !n[index].isConjugado;
    if(!n[index].isConjugado) n[index].conjugadoCom = ''; 
    setNovoTreino({ ...novoTreino, exercises: n });
  };

  const toggleDone = (id: number) => {
    if (exerciciosFeitos.includes(id)) {
      setExerciciosFeitos(exerciciosFeitos.filter(i => i !== id));
    } else {
      setExerciciosFeitos([...exerciciosFeitos, id]);
    }
  };

  // ==================== COMPONENTES UI ====================

  const InstallBanner = () => {
    if (!showInstallBanner) return null;
    return (
      <div className="fixed bottom-24 left-4 right-4 z-[110] bg-blue-600 p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-blue-400 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl text-white"><Download size={24} /></div>
          <div><p className="text-white font-black text-sm">Instalar EvoTrainer</p><p className="text-blue-100 text-[10px]">Acede rápido pela tela inicial!</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowInstallBanner(false)} className="text-white/70 p-2"><X size={18}/></button>
          <button onClick={handleInstallClick} className="bg-white text-blue-600 font-bold px-4 py-2 rounded-xl text-xs shadow-lg active:scale-95 transition-transform uppercase">Instalar</button>
        </div>
      </div>
    );
  };

  const YoutubeModal = () => {
    if (!videoAtivo) return null;
    return (
      <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col justify-center animate-fade-in">
        <button onClick={() => setVideoAtivo(null)} className="absolute top-6 right-6 text-white p-2 z-50 bg-slate-800 rounded-full"><X size={24} /></button>
        <div className="w-full aspect-video bg-black mt-10 relative shadow-[0_0_50px_rgba(0,0,0,1)]"><iframe className="w-full h-full absolute inset-0" src={`https://www.youtube.com/embed/${videoAtivo}?autoplay=1&rel=0`} allowFullScreen></iframe></div>
      </div>
    );
  };

  // ==================== RENDERIZAÇÃO ====================

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-50">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-8 animate-fade-in">
          
          <div className="text-center flex flex-col items-center">
            <img src="/logo.jpg" alt="EvoTrainer Logo" className="w-48 h-auto object-contain drop-shadow-[0_0_25px_rgba(59,130,246,0.4)] mb-2 rounded-xl" />
            <p className="text-slate-400 mt-2 font-medium">Acesso Restrito</p>
          </div>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input type="email" required placeholder="O seu E-mail" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input type="password" required placeholder="A sua Senha" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <button type="submit" disabled={isLoggingIn} className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              {isLoggingIn ? <Activity className="animate-spin" /> : 'ENTRAR NA CONTA'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- ECRÃ DO ADMIN ---
  if (currentUser.role === 'ADMIN') {
    const groupedBuilderExercises = getGroupedExercises(novoTreino.exercises);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 p-4 sm:p-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 mb-6 sm:mb-8 shadow-xl">
            <div className="flex items-center gap-4">
              <img src="/logo.jpg" alt="EvoTrainer" className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">EVO<span className="text-blue-500">TRAINER</span></h1>
                <p className="text-[10px] sm:text-sm text-slate-400 mt-0.5">Painel de Gestão • {currentUser.name}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-800 p-3 sm:px-4 sm:py-2 rounded-xl sm:rounded-lg transition-colors"><LogOut size={20} /> <span className="hidden sm:inline">Sair</span></button>
          </header>

          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] sm:rounded-2xl overflow-hidden shadow-xl">
            {/* Header da Tabela com Barra de Pesquisa */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Users className="text-blue-500"/> Gestão de Alunos</h2>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Procurar aluno..." 
                    value={buscaAluno}
                    onChange={(e) => setBuscaAluno(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl sm:rounded-lg py-3 sm:py-2 pl-9 pr-3 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white font-bold p-3 sm:px-4 sm:py-2 rounded-xl sm:rounded-lg flex items-center gap-2 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 whitespace-nowrap active:scale-95">
                  <Plus size={20} /> <span className="hidden sm:inline">Adicionar Aluno</span>
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {isLoading ? <div className="text-center py-8"><Activity className="animate-spin w-8 h-8 text-blue-500 mx-auto"/></div> : 
               alunosFiltrados.length === 0 ? (
                 <p className="text-center text-slate-400 py-8">Nenhum aluno encontrado.</p>
               ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {alunosFiltrados.map(aluno => (
                    <div key={aluno.id} className={`bg-slate-950 p-5 rounded-[1.5rem] border border-slate-800 shadow-md flex flex-col gap-4 ${aluno.status === 'Bloqueado' ? 'opacity-50' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-800 text-blue-500 font-black rounded-full flex items-center justify-center">{aluno.name.charAt(0)}</div>
                          <div>
                            <p className="font-bold text-white leading-tight">{aluno.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{aluno.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${aluno.status === 'Bloqueado' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>{aluno.status}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800/50">
                          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Fichas</p>
                          <p className="text-lg font-black text-cyan-400">{aluno._count?.workouts || 0}</p>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800/50">
                          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Sequência</p>
                          <p className="text-lg font-black text-orange-400">{aluno.streak} d</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/50">
                        <button onClick={() => { 
                          setAlunoSelecionado(aluno); 
                          setIsEditingTreino(false);
                          setNovoTreino({ title: '', duration: '', dayOfWeek: 'Segunda', exercises: [{ name: '', sets: '', weight: '', youtubeId: '', isConjugado: false, conjugadoCom: '' }] });
                          setShowTreinoModal(true); 
                        }} className="flex-1 bg-cyan-600/10 text-cyan-400 p-3 rounded-xl flex justify-center active:bg-cyan-600 active:text-white transition-all"><Plus size={18}/></button>
                        <button onClick={() => { 
                          setAlunoSelecionado(aluno); 
                          const alunoAtualizado = alunos.find(a => a.id === aluno.id);
                          if(alunoAtualizado) setAlunoSelecionado(alunoAtualizado);
                          setShowGerenciarTreinosModal(true); 
                        }} className="flex-1 bg-slate-800 text-slate-400 p-3 rounded-xl flex justify-center active:bg-blue-600 active:text-white transition-all"><List size={18}/></button>
                        <button onClick={() => toggleStatusAluno(aluno.id, aluno.status)} className="flex-1 bg-slate-800 text-slate-400 p-3 rounded-xl flex justify-center active:bg-yellow-600 active:text-white transition-all">{aluno.status === 'Bloqueado' ? <Unlock size={18}/> : <Ban size={18}/>}</button>
                        <button onClick={() => excluirAluno(aluno.id, aluno.name)} className="flex-1 bg-red-600/10 text-red-500 p-3 rounded-xl flex justify-center active:bg-red-600 active:text-white transition-all"><Trash2 size={18}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Confirmar Exclusão de TREINO */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[210] backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] w-full max-w-sm text-center shadow-2xl animate-fade-in">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-red-500 w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">Apagar Treino?</h3>
              <p className="text-slate-400 text-xs mb-8 leading-relaxed">
                Tem a certeza que deseja apagar permanentemente o treino <strong className="text-white">"{treinoParaExcluir?.title}"</strong>? 
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors uppercase tracking-widest text-[10px]">Cancelar</button>
                <button onClick={executarExclusaoTreino} disabled={isDeleting} className="flex-1 py-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition-colors flex justify-center items-center uppercase tracking-widest text-[10px]">
                  {isDeleting ? <Activity className="animate-spin w-5 h-5" /> : 'Sim, Apagar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Gerenciar Treinos */}
        {showGerenciarTreinosModal && alunoSelecionado && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[150] backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-fade-in max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800 shrink-0">
                <h3 className="text-xl font-bold flex items-center gap-2"><List className="text-blue-500"/> Fichas</h3>
                <button onClick={() => setShowGerenciarTreinosModal(false)} className="p-2 bg-slate-800 rounded-xl text-slate-500"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {alunoSelecionado.workouts?.length === 0 ? <p className="text-slate-500 text-center py-8 font-bold uppercase text-[10px] tracking-widest">Nenhum treino atribuído.</p> : 
                  alunoSelecionado.workouts?.map((w: any) => (
                    <div key={w.id} className="bg-slate-950 border border-slate-800 p-5 rounded-[1.5rem] flex justify-between items-center group hover:border-slate-700 transition-colors">
                      <div>
                        <p className="font-black text-cyan-400">{w.title}</p>
                        <p className="text-[10px] text-slate-500 font-black mt-1 uppercase tracking-widest">{w.dayOfWeek} • {w.duration}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => abrirModalEdicao(w)} className="p-3 bg-blue-600/10 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Pencil size={18} /></button>
                        <button onClick={() => { setTreinoParaExcluir({ id: w.id, title: w.title }); setShowDeleteModal(true); }} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* Modal Novo Aluno */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[150] backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-fade-in">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><UserIcon className="text-blue-500"/> Registar Aluno</h3>
              <form onSubmit={criarAluno} className="flex flex-col gap-4">
                <input type="text" required placeholder="Nome Completo" value={novoAluno.name} onChange={e => setNovoAluno({...novoAluno, name: e.target.value})} className="bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white focus:border-blue-500 outline-none font-bold" />
                <input type="email" required placeholder="E-mail de acesso" value={novoAluno.email} onChange={e => setNovoAluno({...novoAluno, email: e.target.value})} className="bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white focus:border-blue-500 outline-none" />
                
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Senha de acesso (opcional)</p>
                  <input type="text" placeholder="Padrão: 123456" value={novoAluno.password} onChange={e => setNovoAluno({...novoAluno, password: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-blue-500 outline-none" />
                </div>

                <div className="flex gap-2 mt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest">Cancelar</button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-4 rounded-[1.2rem] shadow-lg uppercase text-[10px] tracking-widest active:scale-95 transition-transform">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Criar/Editar Treino */}
        {showTreinoModal && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[150] overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-[2.5rem] w-full max-w-2xl my-8 shadow-2xl animate-fade-in relative">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 leading-none">
                    <Dumbbell className="text-cyan-500"/> 
                    {isEditingTreino ? 'Editar Ficha' : 'Criar Ficha'}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-2 font-black uppercase tracking-widest">{alunoSelecionado?.name.split(' ')[0]}</p>
                </div>
                <button onClick={() => { setShowTreinoModal(false); setIsEditingTreino(false); }} className="p-2 bg-slate-800 rounded-xl text-slate-500"><X size={20}/></button>
              </div>
              
              <form onSubmit={salvarTreino} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1 flex flex-col gap-1.5"><label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Nome</label><input type="text" required placeholder="Ex: Perna Foco Glúteo" value={novoTreino.title} onChange={e => setNovoTreino({...novoTreino, title: e.target.value})} className="bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition-colors font-bold" /></div>
                  <div className="flex flex-col gap-1.5"><label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Duração</label><input type="text" required placeholder="45 min" value={novoTreino.duration} onChange={e => setNovoTreino({...novoTreino, duration: e.target.value})} className="bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition-colors" /></div>
                  <div className="flex flex-col gap-1.5"><label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Dia</label>
                    <select required value={novoTreino.dayOfWeek} onChange={e => setNovoTreino({...novoTreino, dayOfWeek: e.target.value})} className="bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition-colors cursor-pointer font-bold">
                      <option value="Segunda">Segunda</option>
                      <option value="Terça">Terça</option>
                      <option value="Quarta">Quarta</option>
                      <option value="Quinta">Quinta</option>
                      <option value="Sexta">Sexta</option>
                      <option value="Sábado">Sábado</option>
                      <option value="Domingo">Domingo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-slate-500 mb-4 flex items-center gap-2 uppercase text-[10px] tracking-[0.2em] px-1"><List size={14}/> Lista de Exercícios</h4>
                  
                  <div className="max-h-[45vh] overflow-y-auto pr-1 space-y-4 custom-scrollbar">
                    {novoTreino.exercises.map((ex, idx) => (
                      <div key={idx} className="flex flex-col gap-4 bg-slate-950 p-5 rounded-[2rem] border border-slate-800 shadow-md relative">
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => toggleConjugado(idx)} title="Conjugar com outro exercício" className={`p-3 rounded-xl transition-all shadow-lg ${ex.isConjugado ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/40 scale-110' : 'bg-slate-800 text-slate-500'}`}>
                             <LinkIcon size={18} />
                          </button>
                          
                          <input type="text" required placeholder="Nome do Exercício" value={ex.name} onChange={e => updateExercise(idx, 'name', e.target.value)} className="flex-1 bg-transparent border-b border-slate-800 text-white font-black outline-none focus:border-blue-500 pb-1" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pl-14">
                           <div className="flex flex-col gap-1.5"><label className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Séries</label><input type="text" required placeholder="3x12" value={ex.sets} onChange={e => updateExercise(idx, 'sets', e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs outline-none focus:border-blue-500 transition-colors" /></div>
                           <div className="flex flex-col gap-1.5"><label className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Carga</label><input type="text" placeholder="Carga" value={ex.weight} onChange={e => updateExercise(idx, 'weight', e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs outline-none focus:border-blue-500 transition-colors" /></div>
                        </div>

                        {ex.isConjugado && (
                          <div className="pl-14 flex flex-col gap-2 mt-1">
                             <span className="text-[9px] text-cyan-400 font-black uppercase flex items-center gap-1.5 tracking-widest"><LinkIcon size={10}/> Bi-Set Com:</span>
                             <select 
                               value={ex.conjugadoCom || ''} 
                               onChange={e => updateExercise(idx, 'conjugadoCom', e.target.value)}
                               className="bg-slate-900 border border-cyan-500/30 rounded-xl p-3 text-white text-xs outline-none font-bold"
                             >
                               <option value="">Escolher exercício parceiro...</option>
                               {novoTreino.exercises.map((e, i) => (
                                 i !== idx && e.name.trim() !== '' ? (
                                   <option key={i} value={e.name}>{e.name}</option>
                                 ) : null
                               ))}
                             </select>
                          </div>
                        )}
                        
                        <button type="button" onClick={() => removerExercicio(idx)} className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full border-4 border-slate-900 active:scale-90 transition-all"><X size={14}/></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setNovoTreino({...novoTreino, exercises: [...novoTreino.exercises, {name: '', sets: '', weight: '', youtubeId: '', isConjugado: false, conjugadoCom: ''}]})} className="w-full py-5 border-2 border-dashed border-slate-800 rounded-[2rem] text-cyan-500 font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-2 active:bg-slate-800/50 transition-all"><Plus size={16}/> Adicionar Novo Exercício</button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button type="submit" disabled={isCriandoTreino} className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-[0_15px_40px_rgba(37,99,235,0.4)] active:scale-95 transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-widest">
                    {isCriandoTreino ? <Activity className="animate-spin" size={24} /> : <Save size={24} />}
                    {isCriandoTreino ? 'A processar...' : 'Salvar Ficha'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- ECRÃ DO ALUNO ---
  const aluno = currentUser;
  const treinoSelecionado = treinosAluno.find(t => t.dayOfWeek === diaAtivo);
  const groupedTreinoSelecionado = treinoSelecionado ? getGroupedExercises(treinoSelecionado.exercises || []) : [];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-50 md:items-center md:justify-center">
      <div className="w-full h-screen md:h-[850px] md:max-w-md bg-slate-900 md:rounded-[40px] md:border-[8px] border-slate-800 flex flex-col relative overflow-hidden shadow-2xl">
        {toastMsg && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[130] bg-blue-600 text-white font-bold px-4 py-2 rounded-full shadow-lg text-sm whitespace-nowrap animate-fade-in">{toastMsg}</div>}
        
        {/* CONVITE DE INSTALAÇÃO PWA */}
        <InstallBanner />
        <YoutubeModal />

        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10 shadow-sm">
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center text-cyan-400 font-black text-xl border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
               {aluno.name.charAt(0).toUpperCase()}
             </div>
             <div>
               <h2 className="text-lg font-bold leading-tight">Olá, {aluno.name.split(' ')[0]}</h2>
               <p className="text-xs text-slate-400 uppercase font-black tracking-widest">Pronto para esmagar? 💪</p>
             </div>
           </div>
           <button onClick={handleLogout} className="text-slate-400 hover:text-white bg-slate-800 p-2.5 rounded-full transition-colors"><LogOut size={18}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pb-28 custom-scrollbar">
          
          {/* TAB: INÍCIO */}
          {alunoTabAtiva === 'home' && !treinoIniciado && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/10 p-5 rounded-3xl border border-orange-500/20 flex items-center justify-between shadow-lg">
                <div><p className="text-sm text-orange-400 font-bold uppercase tracking-wider">A sua Sequência</p><p className="text-4xl font-black mt-1 text-white">{aluno.streak} <span className="text-lg font-medium text-slate-300">dias</span></p></div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] animate-pulse"><Flame className="text-white w-8 h-8" /></div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase flex items-center gap-2"><Calendar size={16}/> Dia do Treino</h3>
                <div className="flex justify-between">
                  {diasCurtos.map((diaLetra, i) => {
                    const nomeCompleto = diasCompletos[i];
                    const isAtivo = diaAtivo === nomeCompleto;
                    const temTreino = treinosAluno.some(t => t.dayOfWeek === nomeCompleto);
                    
                    return (
                      <div key={i} onClick={() => setDiaAtivo(nomeCompleto)} className="flex flex-col items-center gap-1 cursor-pointer">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                          ${isAtivo ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/40' : 
                            temTreino ? 'bg-slate-800 border border-blue-500/50 text-cyan-400' : 'bg-slate-800/50 text-slate-500'}`}>
                          {diaLetra}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-2 transition-all duration-300">
                {!treinoSelecionado ? (
                  <div className="bg-slate-800/30 border border-slate-700/50 p-10 rounded-3xl flex flex-col items-center text-center gap-4 animate-fade-in">
                    <div className="bg-slate-800 p-4 rounded-full"><Calendar className="w-10 h-10 text-slate-500" /></div>
                    <p className="text-slate-400 text-lg">Descanso merecido para <strong>{diaAtivo}</strong>! Recuperação também é treino.</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-1 rounded-3xl shadow-xl shadow-blue-500/20 animate-fade-in transform hover:scale-[1.02] transition-transform">
                    <div className="bg-slate-900 p-6 rounded-[22px] flex flex-col gap-2 relative overflow-hidden">
                      <div className="absolute -right-6 -top-6 text-slate-800/40 transform rotate-12"><Dumbbell size={120} /></div>
                      <span className="bg-blue-500/20 text-cyan-400 px-3 py-1.5 rounded-lg text-xs font-black w-fit uppercase tracking-widest relative z-10 border border-blue-500/20">Ficha de {treinoSelecionado.dayOfWeek}</span>
                      <h3 className="text-3xl font-black text-white leading-tight mt-3 relative z-10">{treinoSelecionado.title}</h3>
                      <p className="text-slate-400 text-sm relative z-10 font-medium mt-1">{treinoSelecionado.duration} • {treinoSelecionado.exercises?.length || 0} exercícios</p>
                      
                      <div className="mt-4 mb-6 relative z-10 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                        {groupedTreinoSelecionado.slice(0,3).map((group:any, i:number) => (
                           <div key={i} className="mb-2 last:mb-0">
                             <p className="text-slate-200 text-sm font-bold truncate flex items-center gap-2">
                               <CheckCircle2 size={14} className="text-blue-500" /> {group.main.name}
                             </p>
                             {group.partners.map((p:any) => (
                               <p key={p.id} className="text-cyan-400 text-xs truncate flex items-center gap-2 pl-6 mt-1 opacity-90 font-medium">
                                 <LinkIcon size={10} /> + {p.name}
                               </p>
                             ))}
                           </div>
                        ))}
                        {groupedTreinoSelecionado.length > 3 && <p className="text-slate-500 text-xs mt-3 pt-2 border-t border-slate-800 font-bold">+ {groupedTreinoSelecionado.length - 3} blocos restantes</p>}
                      </div>

                      <button onClick={() => { setExerciciosFeitos([]); setTreinoIniciado(true); }} className="w-full bg-blue-600 text-white font-black text-xl py-4 rounded-xl flex items-center justify-center gap-2 relative z-10 transition-transform active:scale-95 shadow-lg shadow-blue-600/30 uppercase tracking-widest"><Play fill="currentColor" /> Iniciar Treino</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: FICHAS */}
          {alunoTabAtiva === 'treinos' && !treinoIniciado && (
            <div className="animate-fade-in flex flex-col gap-6">
              <h2 className="text-2xl font-black flex items-center gap-2"><List className="text-cyan-500"/> Suas Fichas</h2>
              {treinosAluno.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl text-center mt-4">
                  <p className="text-slate-400">Nenhuma ficha disponível de momento. Aguarde o seu Personal enviar.</p>
                </div>
              ) : 
                treinosAluno.map((t: any) => (
                  <div key={t.id} className="bg-slate-800 border border-slate-700 p-1 rounded-2xl shadow-lg active:scale-[0.98] transition-all">
                     <div className="bg-slate-900 p-5 rounded-[14px]">
                       <div className="mb-4 pb-4 border-b border-slate-800">
                         <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider bg-blue-500/10 px-2 py-1 rounded tracking-widest">{t.dayOfWeek}</span>
                         <h3 className="text-2xl font-black text-white mt-2 leading-tight">{t.title}</h3>
                         <p className="text-sm text-slate-400 mt-1 uppercase font-black text-[10px] tracking-widest">{t.duration} • {t.exercises?.length} exercícios</p>
                       </div>
                       <button onClick={() => { setDiaAtivo(t.dayOfWeek); setAlunoTabAtiva('home'); }} className="bg-slate-800 hover:bg-blue-600 text-white font-bold py-4 rounded-xl text-md w-full transition-colors flex justify-center items-center gap-2 border border-slate-700 hover:border-blue-500 uppercase tracking-widest">
                         <Play size={18} fill="currentColor"/> Treinar Ficha
                       </button>
                     </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* TAB: PERFIL DO ALUNO */}
          {alunoTabAtiva === 'perfil' && !treinoIniciado && (
            <div className="flex flex-col gap-6 animate-fade-in pb-8">
               <h2 className="text-2xl font-black flex items-center gap-2"><UserIcon className="text-cyan-500"/> O seu Perfil</h2>

               {/* Avatar Section */}
               <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                     <div className="w-24 h-24 bg-blue-600/20 text-cyan-400 rounded-full flex items-center justify-center text-4xl font-black border-2 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'U'}
                     </div>
                     <button onClick={simularUploadFoto} className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-full shadow-lg transition-transform active:scale-95">
                       <Camera size={16} />
                     </button>
                  </div>
                  <h3 className="text-xl font-black text-white mt-4 relative z-10">{profileForm.name}</h3>
                  <div className="absolute top-0 right-0 p-4 opacity-5"><UserIcon size={120} /></div>
               </div>

               {/* Formulário de Dados Pessoais */}
               <form onSubmit={salvarPerfil} className="flex flex-col gap-5">
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col gap-4 shadow-lg">
                     <div className="flex flex-col gap-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp</label>
                       <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} placeholder="(11) 99999-9999" className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition-colors font-bold" />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Peso (kg)</label>
                          <input type="number" value={profileForm.weight} onChange={e => setProfileForm({...profileForm, weight: e.target.value})} placeholder="Ex: 75" className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 text-center font-bold" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Altura (cm)</label>
                          <input type="number" value={profileForm.height} onChange={e => setProfileForm({...profileForm, height: e.target.value})} placeholder="Ex: 175" className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 text-center font-bold" />
                        </div>
                     </div>
                  </div>
                  <button type="submit" disabled={isSavingProfile} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-md py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest">
                    {isSavingProfile ? <Activity className="animate-spin"/> : <Save size={20} />} SALVAR PERFIL
                  </button>
               </form>

               {/* Alterar Senha */}
               <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Lock size={14}/> Segurança</h3>
                  <form onSubmit={mudarSenha} className="flex flex-col gap-3">
                    <input type="password" required value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} placeholder="Senha Atual" className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 text-sm" />
                    <input type="password" required value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} placeholder="Nova Senha" className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 text-sm" />
                    <input type="password" required value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} placeholder="Confirmar Nova" className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 text-sm" />
                    <button type="submit" disabled={isChangingPassword} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl mt-2 text-xs uppercase tracking-widest">
                      {isChangingPassword ? <Activity className="animate-spin mx-auto"/> : 'ALTERAR SENHA'}
                    </button>
                  </form>
               </div>
            </div>
          )}

          {/* ECRÃ DE TREINO (A EXECUTAR) */}
          {treinoIniciado && treinoSelecionado && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="mb-4 flex justify-between items-center bg-slate-950/80 backdrop-blur-md sticky top-0 py-4 z-20 rounded-b-xl border-b border-slate-800 -mt-6 px-2">
                <div><span className="text-cyan-400 text-[10px] font-black uppercase tracking-widest block mb-0.5">Modo Foco</span><h2 className="text-xl font-black leading-tight text-white">{treinoSelecionado.title}</h2></div>
                <button onClick={() => setTreinoIniciado(false)} className="text-[10px] text-red-400 hover:text-red-300 font-black bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg transition-colors uppercase">Sair</button>
              </div>

              <div className="flex flex-col gap-6">
                {groupedTreinoSelecionado.map((group, idx) => {
                  const isMainDone = exerciciosFeitos.includes(group.main.id);
                  return (
                    <div key={group.main.id} className={`p-5 rounded-[2.5rem] border flex flex-col gap-4 transition-all duration-500 shadow-xl ${isMainDone ? 'bg-blue-600/10 border-blue-500/30' : 'bg-slate-800 border-slate-700'}`}>
                      <div className="flex items-center gap-4">
                        <button onClick={() => toggleDone(group.main.id)} className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${isMainDone ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'border-slate-600 text-slate-400 bg-slate-900 hover:border-blue-500'}`}>
                          {isMainDone ? <CheckCircle2 size={30} /> : <span className="font-black text-2xl">{idx + 1}</span>}
                        </button>
                        <div className="flex-1">
                          <h4 className={`font-black text-lg leading-tight ${isMainDone ? 'text-blue-500/50 line-through' : 'text-white'}`}>{group.main.name}</h4>
                          <div className="flex gap-2 text-[10px] mt-2 text-slate-500 font-black uppercase tracking-widest"><span>{group.main.sets}</span>{group.main.weight && <span>• {group.main.weight}</span>}</div>
                        </div>
                        {group.main.youtubeId && (
                           <button onClick={() => setVideoAtivo(group.main.youtubeId)} className="p-3.5 bg-red-600/10 text-red-500 rounded-2xl active:scale-90 transition-all">
                             <Video size={22} />
                           </button>
                        )}
                      </div>
                      {group.partners.map((partner: any) => {
                         const isPartnerDone = exerciciosFeitos.includes(partner.id);
                         return (
                            <div key={partner.id} className={`ml-4 pl-6 border-l-2 flex items-center gap-4 transition-all duration-300 ${isPartnerDone ? 'border-cyan-500/20' : 'border-cyan-500/50'}`}>
                                <button onClick={() => toggleDone(partner.id)} className={`w-2 h-2 rounded-full ${isPartnerDone ? 'bg-cyan-500/30' : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'}`}></button>
                                <div className="flex-1">
                                    <h4 className={`font-black text-sm leading-tight ${isPartnerDone ? 'text-cyan-400/40 line-through' : 'text-cyan-400'}`}>{partner.name}</h4>
                                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-0.5">{partner.sets}</p>
                                </div>
                                {partner.youtubeId && (
                                   <button onClick={() => setVideoAtivo(partner.youtubeId)} className="text-red-500/50 p-2"><Video size={18} /></button>
                                )}
                            </div>
                         );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pb-10">
                <button onClick={() => finalizarTreino(treinoSelecionado.title)} disabled={exerciciosFeitos.length < treinoSelecionado.exercises?.length} className={`w-full py-6 rounded-[2rem] font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-3 ${exerciciosFeitos.length >= treinoSelecionado.exercises?.length ? 'bg-blue-600 text-white active:scale-95' : 'bg-slate-800 text-slate-600'}`}>
                   {exerciciosFeitos.length >= treinoSelecionado.exercises?.length ? <><Flame fill="currentColor"/> CONCLUIR 🔥</> : `Faltam ${treinoSelecionado.exercises?.length - exerciciosFeitos.length} Blocos`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* NAVEGAÇÃO INFERIOR */}
        {!treinoIniciado && (
          <div className="absolute bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50 flex justify-around items-center p-4 pb-10 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            {[
              { id: 'home', icon: Home, label: 'Início' },
              { id: 'treinos', icon: Dumbbell, label: 'Fichas' },
              { id: 'perfil', icon: UserIcon, label: 'Perfil' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setAlunoTabAtiva(tab.id)} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${alunoTabAtiva === tab.id ? 'text-blue-500 scale-110' : 'text-slate-600 hover:text-slate-400'}`}>
                <tab.icon size={tab.id === 'treinos' ? 26 : 24} strokeWidth={alunoTabAtiva === tab.id ? 2.5 : 2} />
                <span className="text-[9px] font-black uppercase tracking-[0.1em]">{tab.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}