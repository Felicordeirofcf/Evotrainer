'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, LogOut, CheckCircle2, Flame, Play, 
  Video, X, User as UserIcon, Plus, Activity, Dumbbell,
  Trash2, Ban, Unlock, Home, Calendar, List, AlertTriangle, Pencil, Link as LinkIcon, Lock, Camera, Save, Search
} from 'lucide-react';

// ==========================================
// 🚀 CONFIGURAÇÃO DA REDE LOCAL
// ==========================================
const MEU_IP = '192.168.1.2'; 

const API_URL = typeof window !== 'undefined' 
  ? `http://${MEU_IP}:3001/api`
  : 'http://localhost:3001/api';


export default function App() {
  // --- ESTADOS DE AUTENTICAÇÃO ---
  const [currentUser, setCurrentUser] = useState<any>(null); 
  const [token, setToken] = useState<string | null>(null);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // --- ESTADOS ADMIN ---
  const [alunos, setAlunos] = useState<any[]>([]);
  const [buscaAluno, setBuscaAluno] = useState(''); // NOVO: Estado para a pesquisa
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
      showToast(`Erro ao ligar com o servidor em ${API_URL}.`);
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

  // NOVO: Função para apagar o aluno do banco de dados
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
        fetchAlunos(); // Atualiza a lista
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

  // NOVO: Filtragem dos Alunos na tabela
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
      <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 mb-8 shadow-lg">
            <div className="flex items-center gap-4">
              <img src="/logo.jpg" alt="EvoTrainer" className="w-14 h-14 rounded-xl object-cover border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
              <div>
                <h1 className="text-2xl font-black text-white">EVO<span className="text-blue-500">TRAINER</span></h1>
                <p className="text-sm text-slate-400 mt-0.5">Painel de Gestão • {currentUser.name}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-800 px-4 py-2 rounded-lg transition-colors"><LogOut size={20} /> Sair</button>
          </header>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* NOVO: Header da Tabela com Barra de Pesquisa */}
            <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Users className="text-blue-500"/> Gestão de Alunos</h2>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Procurar aluno..." 
                    value={buscaAluno}
                    onChange={(e) => setBuscaAluno(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 whitespace-nowrap">
                  <Plus size={20} /> <span className="hidden sm:inline">Adicionar Aluno</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto p-4">
              {isLoading ? <div className="text-center py-8"><Activity className="animate-spin w-8 h-8 text-blue-500 mx-auto"/></div> : 
               alunosFiltrados.length === 0 ? (
                 <p className="text-center text-slate-400 py-8">Nenhum aluno encontrado.</p>
               ) : (
                <table className="w-full text-left">
                  <thead className="text-slate-400 text-sm uppercase">
                    <tr>
                      <th className="px-4 py-3">Aluno</th>
                      <th className="px-4 py-3">Fichas</th>
                      <th className="px-4 py-3">Sequência 🔥</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-right">Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {alunosFiltrados.map(aluno => (
                      <tr key={aluno.id} className={`hover:bg-slate-800/50 transition-colors ${aluno.status === 'Bloqueado' ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-4"><p className="font-bold text-white text-lg">{aluno.name}</p><p className="text-xs text-slate-400">{aluno.email}</p></td>
                        <td className="px-4 py-4 font-bold text-cyan-400">{aluno._count?.workouts || 0} Treinos</td>
                        <td className="px-4 py-4 font-bold text-orange-400">{aluno.streak} dias</td>
                        <td className="px-4 py-4"><span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-white">{aluno.status}</span></td>
                        <td className="px-4 py-4 flex items-center justify-end gap-1">
                          <button onClick={() => { 
                            setAlunoSelecionado(aluno); 
                            setIsEditingTreino(false);
                            setNovoTreino({ title: '', duration: '', dayOfWeek: 'Segunda', exercises: [{ name: '', sets: '', weight: '', youtubeId: '', isConjugado: false, conjugadoCom: '' }] });
                            setShowTreinoModal(true); 
                          }} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-2.5 rounded-lg flex items-center gap-1 shadow-lg shadow-cyan-500/20 transition-all ml-1">
                            <Dumbbell size={16} /> <span className="hidden lg:inline">Nova Ficha</span>
                          </button>
                          
                          <button onClick={() => { 
                            setAlunoSelecionado(aluno); 
                            const alunoAtualizado = alunos.find(a => a.id === aluno.id);
                            if(alunoAtualizado) setAlunoSelecionado(alunoAtualizado);
                            setShowGerenciarTreinosModal(true); 
                          }} className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-2.5 rounded-lg flex items-center gap-1 transition-colors ml-1">
                            <List size={16} /> <span className="hidden lg:inline">Ver Fichas</span>
                          </button>
                          
                          <button onClick={() => toggleStatusAluno(aluno.id, aluno.status)} title="Bloquear/Desbloquear" className="p-2.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors ml-1">
                            {aluno.status === 'Bloqueado' ? <Unlock size={18} /> : <Ban size={18} />}
                          </button>

                          {/* NOVO: Botão de Apagar Aluno */}
                          <button onClick={() => excluirAluno(aluno.id, aluno.name)} title="Apagar Aluno Permanente" className="p-2.5 rounded-lg bg-slate-800 text-slate-500 hover:bg-red-500/20 hover:text-red-500 transition-colors ml-1">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Modal Confirmar Exclusão de TREINO */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] w-full max-w-sm text-center shadow-2xl animate-fade-in">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-red-500 w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Apagar Treino?</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Tem a certeza que deseja apagar permanentemente o treino <strong className="text-white">"{treinoParaExcluir?.title}"</strong>? 
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors">Cancelar</button>
                <button onClick={executarExclusaoTreino} disabled={isDeleting} className="flex-1 py-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition-colors flex justify-center items-center">
                  {isDeleting ? <Activity className="animate-spin w-5 h-5" /> : 'Sim, Apagar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Gerenciar Treinos */}
        {showGerenciarTreinosModal && alunoSelecionado && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                <h3 className="text-xl font-bold flex items-center gap-2"><List className="text-blue-500"/> Fichas de {alunoSelecionado.name.split(' ')[0]}</h3>
                <button onClick={() => setShowGerenciarTreinosModal(false)} className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg"><X /></button>
              </div>
              <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {alunoSelecionado.workouts?.length === 0 ? <p className="text-slate-500 text-center py-4">Nenhum treino atribuído.</p> : 
                  alunoSelecionado.workouts?.map((w: any) => (
                    <div key={w.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex justify-between items-center group hover:border-slate-700 transition-colors">
                      <div>
                        <p className="font-bold text-cyan-400 text-lg">{w.title}</p>
                        <p className="text-xs text-slate-400 mt-1">Dia: {w.dayOfWeek} • {w.duration}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => abrirModalEdicao(w)} className="bg-blue-500/10 text-blue-400 p-2.5 rounded-lg hover:bg-blue-500 hover:text-white transition-colors" title="Editar Ficha">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => confirmarExclusao(w.id, w.title)} className="bg-red-500/10 text-red-500 p-2.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Apagar Ficha">
                          <Trash2 size={18} />
                        </button>
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
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><UserIcon className="text-blue-500"/> Registar Aluno</h3>
              <form onSubmit={criarAluno} className="flex flex-col gap-4">
                <input type="text" required placeholder="Nome Completo" value={novoAluno.name} onChange={e => setNovoAluno({...novoAluno, name: e.target.value})} className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                <input type="email" required placeholder="E-mail de acesso" value={novoAluno.email} onChange={e => setNovoAluno({...novoAluno, email: e.target.value})} className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                
                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                  <p className="text-xs text-slate-400 mb-2">Senha de acesso (opcional)</p>
                  <input type="text" placeholder="Padrão: 123456" value={novoAluno.password} onChange={e => setNovoAluno({...novoAluno, password: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none" />
                </div>

                <div className="flex justify-end gap-3 mt-2"><button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button><button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-lg transition-colors">Guardar</button></div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Criar/Editar Treino */}
        {showTreinoModal && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-4xl my-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {isEditingTreino ? <Pencil className="text-blue-500"/> : <Dumbbell className="text-cyan-500"/>} 
                  {isEditingTreino ? 'Editar Ficha de Treino' : `Criar Ficha para ${alunoSelecionado?.name.split(' ')[0]}`}
                </h3>
                <button onClick={() => { setShowTreinoModal(false); setIsEditingTreino(false); }} className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg"><X /></button>
              </div>
              
              <form onSubmit={salvarTreino} className="flex flex-col gap-6">
                <div className="flex gap-4">
                  <input type="text" required placeholder="Nome (Ex: Perna Foco Glúteo)" value={novoTreino.title} onChange={e => setNovoTreino({...novoTreino, title: e.target.value})} className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-4 text-white outline-none focus:border-blue-500 transition-colors text-lg font-bold" />
                  <input type="text" required placeholder="Duração (45 min)" value={novoTreino.duration} onChange={e => setNovoTreino({...novoTreino, duration: e.target.value})} className="w-1/4 bg-slate-950 border border-slate-700 rounded-lg p-4 text-white outline-none focus:border-blue-500 transition-colors" />
                  <select required value={novoTreino.dayOfWeek} onChange={e => setNovoTreino({...novoTreino, dayOfWeek: e.target.value})} className="w-1/4 bg-slate-950 border border-slate-700 rounded-lg p-4 text-white outline-none focus:border-blue-500 transition-colors cursor-pointer">
                    <option value="Segunda">Segunda</option>
                    <option value="Terça">Terça</option>
                    <option value="Quarta">Quarta</option>
                    <option value="Quinta">Quinta</option>
                    <option value="Sexta">Sexta</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                  </select>
                </div>

                <div>
                  <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><List size={18}/> Lista de Exercícios</h4>
                  
                  {groupedBuilderExercises.map((group, groupIdx) => (
                    <div key={group.main.originalIndex} className="flex flex-col gap-2 mb-4 bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-md">
                      
                      <div className="flex gap-3 items-start">
                        <button type="button" onClick={() => toggleConjugado(group.main.originalIndex)} title="Conjugar com outro exercício" className={`mt-1 p-2 rounded-lg transition-colors ${group.main.isConjugado ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/40' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-cyan-400'}`}>
                           <LinkIcon size={20} />
                        </button>
                        
                        <div className="flex-1 flex flex-col gap-3">
                          <div className="flex gap-2">
                            <input type="text" required placeholder="Exercício Principal" value={group.main.name} onChange={e => updateExercise(group.main.originalIndex, 'name', e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded p-3 text-white outline-none focus:border-blue-500 transition-colors font-bold" />
                            <input type="text" required placeholder="Séries (3x12)" value={group.main.sets} onChange={e => updateExercise(group.main.originalIndex, 'sets', e.target.value)} className="w-32 bg-slate-900 border border-slate-700 rounded p-3 text-white outline-none focus:border-blue-500 transition-colors" />
                            <input type="text" placeholder="Carga" value={group.main.weight} onChange={e => updateExercise(group.main.originalIndex, 'weight', e.target.value)} className="w-32 bg-slate-900 border border-slate-700 rounded p-3 text-white outline-none focus:border-blue-500 transition-colors" />
                          </div>

                          {group.main.isConjugado && (
                            <div className="flex items-center gap-3 bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/30">
                               <span className="text-sm text-cyan-400 font-bold flex items-center gap-2"><LinkIcon size={14}/> Ligar com:</span>
                               <select 
                                 value={group.main.conjugadoCom || ''} 
                                 onChange={e => updateExercise(group.main.originalIndex, 'conjugadoCom', e.target.value)}
                                 className="bg-slate-900 border border-cyan-500/50 rounded p-2 text-white text-sm outline-none flex-1 cursor-pointer"
                               >
                                 <option value="">Selecione o exercício parceiro...</option>
                                 {novoTreino.exercises.map((e, i) => (
                                   i !== group.main.originalIndex && e.name.trim() !== '' ? (
                                     <option key={i} value={e.name}>{e.name}</option>
                                   ) : null
                                 ))}
                               </select>
                            </div>
                          )}
                        </div>
                        
                        <button type="button" onClick={() => removerExercicio(group.main.originalIndex)} className="mt-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors"><Trash2 size={20}/></button>
                      </div>

                      {group.partners.length > 0 && (
                        <div className="ml-[52px] pl-4 border-l-2 border-cyan-500/50 flex flex-col gap-3 mt-2 pt-2">
                           {group.partners.map(partner => (
                              <div key={partner.originalIndex} className="flex gap-2 items-center bg-cyan-900/10 p-3 rounded-lg border border-cyan-500/20">
                                <LinkIcon size={16} className="text-cyan-400 shrink-0" />
                                <input type="text" required placeholder="Exercício Secundário" value={partner.name} 
                                  onChange={e => updatePartnerName(partner.originalIndex, group.main.originalIndex, e.target.value)} 
                                  className="flex-1 bg-transparent text-cyan-300 outline-none font-bold" />
                                <input type="text" required placeholder="Séries" value={partner.sets} 
                                  onChange={e => updateExercise(partner.originalIndex, 'sets', e.target.value)} 
                                  className="w-24 bg-transparent border-l border-slate-700 pl-3 text-white outline-none" />
                                <input type="text" placeholder="Carga" value={partner.weight} 
                                  onChange={e => updateExercise(partner.originalIndex, 'weight', e.target.value)} 
                                  className="w-24 bg-transparent border-l border-slate-700 pl-3 text-white outline-none" />
                                <button type="button" onClick={() => removerExercicio(partner.originalIndex)} className="text-slate-500 hover:text-red-500 p-2"><X size={16}/></button>
                              </div>
                           ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <button type="button" onClick={() => setNovoTreino({...novoTreino, exercises: [...novoTreino.exercises, {name: '', sets: '', weight: '', youtubeId: '', isConjugado: false, conjugadoCom: ''}]})} className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold flex items-center justify-center gap-2 py-4 rounded-xl w-full transition-colors border border-dashed border-slate-600 hover:border-cyan-500 mt-2">
                    <Plus size={20}/> Adicionar Novo Exercício
                  </button>
                </div>
                
                <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-slate-800">
                  <button type="submit" disabled={isCriandoTreino} className="bg-blue-600 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 hover:bg-blue-500 disabled:opacity-50 text-lg shadow-lg shadow-blue-600/30 transition-all active:scale-95 w-full justify-center">
                    {isCriandoTreino ? <Activity className="animate-spin" size={24} /> : <Video size={24} />}
                    {isCriandoTreino ? 'A processar vídeos com IA...' : (isEditingTreino ? 'Atualizar Ficha de Treino' : 'Salvar e Gerar Vídeos')}
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

  const YoutubeModal = () => {
    if (!videoAtivo) return null;
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-center animate-fade-in">
        <button onClick={() => setVideoAtivo(null)} className="absolute top-6 right-6 text-white p-2 z-50 bg-slate-800 rounded-full hover:bg-red-500 transition-colors"><X size={24} /></button>
        <div className="w-full aspect-video bg-black mt-10 relative shadow-[0_0_50px_rgba(0,0,0,1)]"><iframe className="w-full h-full absolute inset-0" src={`https://www.youtube.com/embed/${videoAtivo}?autoplay=1&rel=0`} allowFullScreen></iframe></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-50 md:items-center md:justify-center">
      <div className="w-full h-screen md:h-[850px] md:max-w-md bg-slate-900 md:rounded-[40px] md:border-[8px] border-slate-800 flex flex-col relative overflow-hidden shadow-2xl">
        {toastMsg && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white font-bold px-4 py-2 rounded-full shadow-lg text-sm whitespace-nowrap">{toastMsg}</div>}
        <YoutubeModal />

        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10 shadow-sm">
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center text-cyan-400 font-black text-xl border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
               {aluno.name.charAt(0).toUpperCase()}
             </div>
             <div>
               <h2 className="text-lg font-bold leading-tight">Olá, {aluno.name.split(' ')[0]}</h2>
               <p className="text-xs text-slate-400">Pronto para esmagar?</p>
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
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]"><Flame className="text-white w-8 h-8" /></div>
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

                      <button onClick={() => setTreinoIniciado(true)} className="w-full bg-blue-600 text-white font-black text-xl py-4 rounded-xl flex items-center justify-center gap-2 relative z-10 transition-transform active:scale-95 shadow-lg shadow-blue-600/30"><Play fill="currentColor" /> INICIAR TREINO</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: FICHAS */}
          {alunoTabAtiva === 'treinos' && !treinoIniciado && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><List className="text-cyan-500"/> Suas Fichas</h2>
              {treinosAluno.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl text-center mt-4">
                  <p className="text-slate-400">Nenhuma ficha disponível de momento. Aguarde o seu Personal enviar.</p>
                </div>
              ) : 
                <div className="flex flex-col gap-6">
                  {treinosAluno.map((t: any) => {
                    const gruposFicha = getGroupedExercises(t.exercises || []);
                    
                    return (
                    <div key={t.id} className="bg-slate-800 border border-slate-700 p-1 rounded-2xl shadow-lg">
                       <div className="bg-slate-900 p-5 rounded-[14px]">
                         <div className="mb-4 pb-4 border-b border-slate-800">
                           <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider bg-blue-500/10 px-2 py-1 rounded">{t.dayOfWeek}</span>
                           <h3 className="text-2xl font-black text-white mt-2">{t.title}</h3>
                           <p className="text-sm text-slate-400 mt-1">{t.duration} • {t.exercises?.length} exercícios</p>
                         </div>
                         
                         <div className="flex flex-col gap-2 mb-6">
                           {gruposFicha.map((group: any, idx: number) => (
                             <div key={idx} className="flex flex-col bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                               
                               <div className="flex justify-between items-center">
                                 <div className="flex-1 pr-2">
                                   <p className="font-bold text-white text-sm">{group.main.name}</p>
                                   <p className="text-xs text-slate-400 mt-0.5"><span className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-300">{group.main.sets}</span> {group.main.weight ? `• ${group.main.weight}` : ''}</p>
                                 </div>
                                 {group.main.youtubeId && (
                                   <button onClick={() => setVideoAtivo(group.main.youtubeId)} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors" title="Ver execução">
                                     <Video size={18} />
                                   </button>
                                 )}
                               </div>

                               {group.partners.map((partner: any) => (
                                  <div key={partner.originalIndex} className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700/50 pl-2">
                                      <div className="flex-1 pr-2">
                                          <p className="font-bold text-cyan-400 flex items-center gap-1 text-sm">
                                              <LinkIcon size={12} /> {partner.name}
                                          </p>
                                          <p className="text-xs text-slate-400 mt-0.5"><span className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-300">{partner.sets}</span> {partner.weight ? `• ${partner.weight}` : ''}</p>
                                      </div>
                                      {partner.youtubeId && (
                                          <button onClick={() => setVideoAtivo(partner.youtubeId)} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors" title="Ver execução">
                                              <Video size={18} />
                                          </button>
                                      )}
                                  </div>
                               ))}
                             </div>
                           ))}
                         </div>

                         <button onClick={() => { setDiaAtivo(t.dayOfWeek); setAlunoTabAtiva('home'); }} className="bg-slate-800 hover:bg-blue-600 text-white font-bold py-4 rounded-xl text-md w-full transition-colors flex justify-center items-center gap-2 border border-slate-700 hover:border-blue-500">
                           <Play size={18} fill="currentColor"/> Treinar Ficha
                         </button>
                       </div>
                    </div>
                  )})}
                </div>
              }
            </div>
          )}

          {/* TAB: PERFIL DO ALUNO */}
          {alunoTabAtiva === 'perfil' && !treinoIniciado && (
            <div className="flex flex-col gap-6 animate-fade-in pb-8">
               <h2 className="text-2xl font-black flex items-center gap-2"><UserIcon className="text-cyan-500"/> O seu Perfil</h2>

               {/* Avatar Section */}
               <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
                  <div className="relative">
                     <div className="w-24 h-24 bg-blue-600/20 text-cyan-400 rounded-full flex items-center justify-center text-4xl font-black border-2 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'U'}
                     </div>
                     <button onClick={simularUploadFoto} className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-full shadow-lg transition-transform active:scale-95">
                       <Camera size={16} />
                     </button>
                  </div>
                  <p className="text-slate-400 text-xs mt-3 font-medium">Toque para alterar a foto</p>
               </div>

               {/* Formulário de Dados Pessoais */}
               <form onSubmit={salvarPerfil} className="flex flex-col gap-5">
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col gap-4 shadow-lg">
                     <h3 className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-1">Dados Pessoais</h3>
                     <div className="flex flex-col gap-1.5">
                       <label className="text-xs text-slate-500 font-bold">Nome Completo</label>
                       <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition-colors font-medium" />
                     </div>
                     <div className="flex flex-col gap-1.5">
                       <label className="text-xs text-slate-500 font-bold">E-mail</label>
                       <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition-colors font-medium" />
                     </div>
                     <div className="flex flex-col gap-1.5">
                       <label className="text-xs text-slate-500 font-bold">WhatsApp</label>
                       <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} placeholder="(11) 99999-9999" className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition-colors font-medium" />
                     </div>
                  </div>

                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col gap-4 shadow-lg">
                     <h3 className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-1">Fisiologia</h3>
                     <div className="grid grid-cols-3 gap-3">
                       <div className="flex flex-col gap-1.5">
                         <label className="text-xs text-slate-500 font-bold">Idade</label>
                         <input type="number" value={profileForm.age} onChange={e => setProfileForm({...profileForm, age: e.target.value})} placeholder="Anos" className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 text-center font-bold" />
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <label className="text-xs text-slate-500 font-bold">Peso (kg)</label>
                         <input type="number" value={profileForm.weight} onChange={e => setProfileForm({...profileForm, weight: e.target.value})} placeholder="Ex: 75" className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 text-center font-bold" />
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <label className="text-xs text-slate-500 font-bold">Altura (cm)</label>
                         <input type="number" value={profileForm.height} onChange={e => setProfileForm({...profileForm, height: e.target.value})} placeholder="Ex: 175" className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 text-center font-bold" />
                       </div>
                     </div>
                  </div>

                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col gap-4 shadow-lg">
                     <h3 className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-1">Ficha Técnica</h3>
                     <div className="flex flex-col gap-1.5">
                       <label className="text-xs text-slate-500 font-bold">Objetivo Principal</label>
                       <select value={profileForm.goal} onChange={e => setProfileForm({...profileForm, goal: e.target.value})} className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 font-medium appearance-none cursor-pointer">
                          <option value="Hipertrofia">💪 Ganho de Massa (Hipertrofia)</option>
                          <option value="Emagrecimento">🔥 Perda de Gordura (Emagrecimento)</option>
                          <option value="Condicionamento">🏃 Condicionamento Físico</option>
                          <option value="Manutenção">🧘 Saúde e Manutenção</option>
                       </select>
                     </div>
                     <div className="flex flex-col gap-1.5">
                       <label className="text-xs text-slate-500 font-bold">Lesões ou Observações</label>
                       <textarea value={profileForm.notes} onChange={e => setProfileForm({...profileForm, notes: e.target.value})} placeholder="Ex: Dor no joelho direito..." rows={3} className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 resize-none font-medium text-sm"></textarea>
                     </div>
                  </div>

                  <button type="submit" disabled={isSavingProfile} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50">
                    {isSavingProfile ? <Activity className="animate-spin"/> : <Save size={20} />} 
                    {isSavingProfile ? 'A GUARDAR...' : 'SALVAR ALTERAÇÕES'}
                  </button>
               </form>

               {/* Formulário de Segurança (Alterar Senha) */}
               <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col gap-4 shadow-lg mt-2">
                  <h3 className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2"><Lock size={16}/> Segurança da Conta</h3>
                  <form onSubmit={mudarSenha} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-500 font-bold">Senha Atual</label>
                      <input type="password" required value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} placeholder="••••••••" className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-500 font-bold">Nova Senha</label>
                      <input type="password" required value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} placeholder="••••••••" className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-500 font-bold">Confirmar Nova Senha</label>
                      <input type="password" required value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} placeholder="••••••••" className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    
                    <button type="submit" disabled={isChangingPassword} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl mt-2 transition-all active:scale-95 disabled:opacity-50 border border-slate-700">
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
                <button onClick={() => setTreinoIniciado(false)} className="text-xs text-red-400 hover:text-red-300 font-bold bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg transition-colors">Parar Treino</button>
              </div>

              <div className="flex flex-col gap-6">
                {groupedTreinoSelecionado.map((group: any, idx: number) => {
                  const isMainDone = exerciciosFeitos.includes(group.main.id);

                  return (
                    <div key={group.main.id} className="relative flex flex-col gap-2 bg-slate-900 p-2 rounded-[24px] border border-slate-800 shadow-lg">
                      
                      <div className={`p-4 rounded-[18px] border flex items-center gap-4 transition-all duration-300 w-full z-10 
                        ${isMainDone ? 'bg-blue-600/10 border-blue-500/30' : 'bg-slate-800 border-slate-700'}`}>
                        
                        <button onClick={() => toggleDone(group.main.id)} className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-[3px] transition-all duration-300 ${isMainDone ? 'bg-blue-600 border-blue-500 text-white scale-110 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'border-slate-600 text-slate-400 bg-slate-900 hover:border-blue-500 hover:text-cyan-400'}`}>
                          {isMainDone ? <CheckCircle2 size={28} /> : <span className="font-black text-xl">{idx + 1}</span>}
                        </button>
                        
                        <div className="flex-1">
                          <h4 className={`font-black text-lg leading-tight ${isMainDone ? 'text-blue-500 line-through opacity-50' : 'text-white'}`}>{group.main.name}</h4>
                          <div className="flex gap-2 text-sm mt-2 text-slate-400"><span className="bg-slate-950 text-slate-300 px-2 py-1 rounded font-bold border border-slate-800">{group.main.sets}</span>{group.main.weight && <span className="bg-slate-950 text-slate-300 px-2 py-1 rounded font-bold border border-slate-800">{group.main.weight}</span>}</div>
                        </div>
                        
                        {group.main.youtubeId && (
                           <button onClick={() => setVideoAtivo(group.main.youtubeId)} className={`p-3.5 rounded-xl transition-colors border ${isMainDone ? 'bg-slate-950 border-slate-800 text-slate-600' : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white shadow-md'}`}>
                             <Video size={24} />
                           </button>
                        )}
                      </div>

                      {group.partners.map((partner: any) => {
                         const isPartnerDone = exerciciosFeitos.includes(partner.id);
                         return (
                            <div key={partner.id} className={`p-4 rounded-[18px] border flex items-center gap-4 transition-all duration-300 w-[calc(100%-1rem)] ml-4 z-10 
                                ${isPartnerDone ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-800 border-cyan-500/30'}`}>
                                
                                <button onClick={() => toggleDone(partner.id)} className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-[3px] transition-all duration-300 ${isPartnerDone ? 'bg-cyan-500 border-cyan-500 text-slate-950 scale-110 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'border-slate-600 text-cyan-400 bg-slate-900 hover:border-cyan-500'}`}>
                                    {isPartnerDone ? <CheckCircle2 size={24} /> : <LinkIcon size={20} />}
                                </button>
                                
                                <div className="flex-1">
                                    <h4 className={`font-black text-md leading-tight ${isPartnerDone ? 'text-cyan-500 line-through opacity-50' : 'text-cyan-300'}`}>{partner.name}</h4>
                                    <div className="flex gap-2 text-sm mt-2 text-slate-400"><span className="bg-slate-950 text-slate-300 px-2 py-1 rounded font-bold border border-slate-800">{partner.sets}</span>{partner.weight && <span className="bg-slate-950 text-slate-300 px-2 py-1 rounded font-bold border border-slate-800">{partner.weight}</span>}</div>
                                </div>
                                
                                {partner.youtubeId && (
                                   <button onClick={() => setVideoAtivo(partner.youtubeId)} className={`p-3 rounded-xl transition-colors border ${isPartnerDone ? 'bg-slate-950 border-slate-800 text-slate-600' : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white shadow-md'}`}>
                                     <Video size={20} />
                                   </button>
                                )}
                            </div>
                         );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <button onClick={() => finalizarTreino(treinoSelecionado.title)} disabled={exerciciosFeitos.length !== treinoSelecionado.exercises?.length} className={`w-full py-5 rounded-2xl font-black text-xl transition-all duration-300 ${exerciciosFeitos.length === treinoSelecionado.exercises?.length ? 'bg-blue-600 text-white shadow-[0_10px_40px_rgba(37,99,235,0.4)] hover:bg-blue-500 active:scale-95' : 'bg-slate-800 text-slate-600'}`}>
                   {exerciciosFeitos.length === treinoSelecionado.exercises?.length ? 'FINALIZAR TREINO 🔥' : `Faltam ${treinoSelecionado.exercises?.length - exerciciosFeitos.length} exercícios`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* NAVEGAÇÃO INFERIOR */}
        {!treinoIniciado && (
          <div className="absolute bottom-0 left-0 w-full bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 flex justify-around items-center p-4 pb-6 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <button onClick={() => setAlunoTabAtiva('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 ${alunoTabAtiva === 'home' ? 'text-cyan-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
              <Home size={24} />
              <span className="text-[10px] font-black uppercase tracking-wider mt-1">Início</span>
            </button>
            <button onClick={() => setAlunoTabAtiva('treinos')} className={`flex flex-col items-center gap-1 transition-all duration-300 ${alunoTabAtiva === 'treinos' ? 'text-cyan-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
              <Dumbbell size={24} />
              <span className="text-[10px] font-black uppercase tracking-wider mt-1">Fichas</span>
            </button>
            <button onClick={() => setAlunoTabAtiva('perfil')} className={`flex flex-col items-center gap-1 transition-all duration-300 ${alunoTabAtiva === 'perfil' ? 'text-cyan-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
              <UserIcon size={24} />
              <span className="text-[10px] font-black uppercase tracking-wider mt-1">Perfil</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}