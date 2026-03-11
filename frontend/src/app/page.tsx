'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, LogOut, CheckCircle2, Flame, Play, 
  Video, X, User as UserIcon, Plus, Activity, Dumbbell,
  Trash2, Ban, Unlock, Home, Calendar, List, AlertTriangle, Pencil, Link as LinkIcon, Lock, Camera, Save, Search,
  Download, Sparkles, Youtube, Star, MessageSquare, FileText, ChevronRight, ChevronLeft, MessageCircle
} from 'lucide-react';

// ==========================================
// 🚀 CONFIGURAÇÃO DA API
// ==========================================
const getBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Deteção inteligente: se estiver a rodar localmente, usa o backend local automaticamente
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  return 'https://evotrainer.onrender.com';
};

const API_URL = getBaseUrl().endsWith('/') ? `${getBaseUrl()}api` : `${getBaseUrl()}/api`;

// Busca de Vídeo Camuflada
const buscarVideoNoYouTube = async (nomeExercicio: string) => {
  try {
    const query = `como fazer ${nomeExercicio} execução correta musculação`;
    const response = await fetch(`/api/youtube?q=${encodeURIComponent(query)}`);
    if (!response.ok) return ''; 
    const data = await response.json();
    return data.items?.[0]?.id?.videoId || '';
  } catch (error) { return ''; }
};

const extractYouTubeId = (url: string) => {
  if (!url) return '';
  if (url.length === 11 && !url.includes('http')) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
};

// ==========================================
// 🧩 COMPONENTES GLOBAIS UI
// ==========================================
const InstallBanner = ({ showInstallBanner, setShowInstallBanner, handleInstallClick }: any) => {
  if (!showInstallBanner) return null;
  return (
    <div className="fixed bottom-24 left-4 right-4 z-[110] bg-blue-600 p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-blue-400 animate-fade-in sm:max-w-sm sm:mx-auto">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-xl text-white"><Download size={24} /></div>
        <div><p className="text-white font-black text-sm">Instalar EvoTrainer</p><p className="text-blue-100 text-[10px]">Acesse rápido pela tela inicial!</p></div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setShowInstallBanner(false)} className="text-white/70 p-2"><X size={18}/></button>
        <button onClick={handleInstallClick} className="bg-white text-blue-600 font-bold px-4 py-2 rounded-xl text-xs shadow-lg active:scale-95 transition-transform uppercase">Instalar</button>
      </div>
    </div>
  );
};

const YoutubeModal = ({ videoAtivo, setVideoAtivo }: any) => {
  if (!videoAtivo) return null;
  const iframeSrc = videoAtivo.startsWith('SEARCH:') 
    ? `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(videoAtivo.replace('SEARCH:', ''))}&autoplay=1`
    : `https://www.youtube.com/embed/${videoAtivo}?autoplay=1&rel=0`;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[400] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col relative">
        <div className="p-5 flex justify-between items-center border-b border-slate-800 bg-slate-950">
          <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2"><Youtube size={18} className="text-red-500"/> Execução Correta</h3>
          <button onClick={() => setVideoAtivo(null)} className="bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white p-2 rounded-xl transition-colors"><X size={20} /></button>
        </div>
        <div className="w-full aspect-video bg-black relative"><iframe className="w-full h-full absolute inset-0" src={iframeSrc} allowFullScreen></iframe></div>
        <div className="p-4 bg-slate-950"><button onClick={() => setVideoAtivo(null)} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] transition-colors">Fechar Vídeo</button></div>
      </div>
    </div>
  );
};

const TourModal = ({ showTour, setShowTour, tourStep, setTourStep }: any) => {
  if (!showTour) return null;

  const tourSteps = [
    { 
      title: "Bem-vindo ao EvoTrainer! 🚀", 
      text: "Vamos fazer um tour rápido para você entender como nossa plataforma vai escalar a sua consultoria e economizar horas de trabalho.", 
      icon: <Sparkles size={60} className="text-blue-500 mx-auto" /> 
    },
    { 
      title: "1. Gestão de Alunos 👥", 
      text: "Na aba 'Alunos' você cadastra seus clientes. Cada aluno que você adicionar ganhará acesso a um App Exclusivo para visualizar os treinos.", 
      icon: <Users size={60} className="text-emerald-500 mx-auto" /> 
    },
    { 
      title: "2. Treino Inteligente 🧠", 
      text: "Vá na aba 'Inteligência' e deixe a nossa IA gerar as fichas para você. Ela entende de periodização, biomecânica e patologias.", 
      icon: <Activity size={60} className="text-indigo-500 mx-auto" /> 
    },
    { 
      title: "3. Vídeos Automáticos 📺", 
      text: "Adeus planilhas manuais! Para cada exercício gerado, nós buscamos e anexamos o vídeo correto de execução diretamente do YouTube.", 
      icon: <Youtube size={60} className="text-red-500 mx-auto" /> 
    },
    { 
      title: "4. A Visão do seu Aluno 📱", 
      text: "O seu aluno entra no aplicativo, clica no 'Modo Foco' e consegue marcar os exercícios que já fez. Eles também ganham 'foguinhos' de ofensiva a cada treino para gamificar a rotina!", 
      icon: (
        <div className="w-32 h-56 bg-slate-950 border-[6px] border-slate-800 rounded-[2rem] mx-auto overflow-hidden relative shadow-lg">
          <div className="absolute top-0 w-full h-4 bg-slate-800 rounded-b-xl flex justify-center"><div className="w-8 h-1 bg-slate-950 rounded-full mt-1"></div></div>
          <div className="mt-8 px-3 space-y-2">
            <div className="h-4 bg-blue-600/30 rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-slate-900 rounded-xl border border-slate-800 flex items-center px-2 gap-2">
               <div className="w-4 h-4 bg-blue-600 rounded-full"></div><div className="h-2 bg-slate-700 rounded w-1/2"></div>
            </div>
            <div className="h-10 bg-slate-900 rounded-xl border border-slate-800 flex items-center px-2 gap-2">
               <div className="w-4 h-4 bg-slate-700 rounded-full"></div><div className="h-2 bg-slate-700 rounded w-1/2"></div>
            </div>
            <div className="h-10 bg-blue-600 rounded-xl mt-6"></div>
          </div>
        </div>
      )
    },
    { 
      title: "Tudo Pronto! 🎉", 
      text: "O sistema agora é seu. Comece adicionando o seu primeiro aluno ou testando a Inteligência Artificial.", 
      icon: <CheckCircle2 size={60} className="text-blue-500 mx-auto" /> 
    }
  ];

  const current = tourSteps[tourStep];

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[500] flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-sm text-center p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-5">
          <Sparkles size={200} />
        </div>
        
        <div className="relative z-10">
          <div className="mb-6 h-24 flex items-center justify-center">
            {current.icon}
          </div>
          <h3 className="text-xl font-black text-white mb-4 leading-tight">{current.title}</h3>
          <p className="text-slate-400 text-sm font-medium leading-relaxed min-h-[5rem]">
            {current.text}
          </p>
          
          <div className="flex justify-center gap-2 mt-8 mb-6">
            {tourSteps.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all ${i === tourStep ? 'w-8 bg-blue-600' : 'w-2 bg-slate-800'}`}></div>
            ))}
          </div>

          <div className="flex gap-3">
            {tourStep > 0 && (
              <button onClick={() => setTourStep((prev: number) => prev - 1)} className="p-4 bg-slate-800 text-white rounded-2xl active:scale-95 transition-all">
                <ChevronLeft size={20}/>
              </button>
            )}
            {tourStep < tourSteps.length - 1 ? (
              <button onClick={() => setTourStep((prev: number) => prev + 1)} className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all uppercase tracking-widest text-xs">
                Próximo <ChevronRight size={18}/>
              </button>
            ) : (
              <button onClick={() => setShowTour(false)} className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all uppercase tracking-widest text-xs">
                VAMOS LÁ! <Flame size={18}/>
              </button>
            )}
          </div>
          
          <button onClick={() => setShowTour(false)} className="mt-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-slate-300">
            Pular Tour
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 APLICAÇÃO PRINCIPAL
// ==========================================
export default function App() {
  // --- ESTADOS DE AUTENTICAÇÃO ---
  const [currentUser, setCurrentUser] = useState<any>(null); 
  const [token, setToken] = useState<string | null>(null);
  
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Estados de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Estados de Cadastro (Personal)
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  // --- ESTADOS GERAIS ---
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // --- TOUR GUIADO (ONBOARDING) ---
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // --- ESTADOS ADMIN ---
  const [alunos, setAlunos] = useState<any[]>([]);
  const [buscaAluno, setBuscaAluno] = useState(''); 
  const [showAddModal, setShowAddModal] = useState(false);
  const [novoAluno, setNovoAluno] = useState({ name: '', email: '', password: '' });
  const [adminTabAtiva, setAdminTabAtiva] = useState('alunos'); 
  const [showTreinoModal, setShowTreinoModal] = useState(false);
  const [showGerenciarTreinosModal, setShowGerenciarTreinosModal] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<any>(null);
  const [isCriandoTreino, setIsCriandoTreino] = useState(false);
  const [isEditingTreino, setIsEditingTreino] = useState(false);
  const [treinoEditId, setTreinoEditId] = useState<number | null>(null);
  const [novoTreino, setNovoTreino] = useState({ title: '', duration: '', dayOfWeek: 'Segunda', exercises: [{ name: '', sets: '', weight: '', youtubeId: '', isConjugado: false, conjugadoCom: '' }] });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [treinoParaExcluir, setTreinoParaExcluir] = useState<{id: number, title: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- IA (TREINO INTELIGENTE) ---
  const [iaPrompt, setIaPrompt] = useState('');
  const [iaAlunoId, setIaAlunoId] = useState('');
  const [iaSplit, setIaSplit] = useState('ABC');
  const [iaFrequencia, setIaFrequencia] = useState('5');
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);

  // --- ESTADOS ALUNO ---
  const [treinosAluno, setTreinosAluno] = useState<any[]>([]);
  const [treinoIniciado, setTreinoIniciado] = useState(false);
  const [exerciciosFeitos, setExerciciosFeitos] = useState<number[]>([]);
  const [videoAtivo, setVideoAtivo] = useState<string | null>(null);
  const [alunoTabAtiva, setAlunoTabAtiva] = useState('home'); 
  const diasCompletos = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const diasCurtos = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const [diaAtivo, setDiaAtivo] = useState(diasCompletos[new Date().getDay()]);

  // --- ESTADOS PERFIL ---
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', age: '', weight: '', height: '', goal: 'Hipertrofia', notes: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  // --- FEEDBACK ---
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // --- UTILITÁRIOS ---
  const showToast = (msg: any) => {
    let textMessage = "Ocorreu um erro inesperado.";
    if (typeof msg === 'string') textMessage = msg;
    else if (msg && msg.error) textMessage = String(msg.error);
    else if (msg && msg.message) textMessage = String(msg.message);
    setToastMsg(textMessage);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const simularUploadFoto = () => showToast("Funcionalidade de foto em breve!");

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowInstallBanner(false);
    setDeferredPrompt(null);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('treino_ai_token');
    const savedUser = localStorage.getItem('treino_ai_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try { setCurrentUser(JSON.parse(savedUser)); } catch (e) { setCurrentUser(null); }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '', email: currentUser.email || '', phone: currentUser.phone || '',
        age: currentUser.age || '', weight: currentUser.weight || '', height: currentUser.height || '',
        goal: currentUser.goal || 'Hipertrofia', notes: currentUser.notes || ''
      });
      // Verifica se o usuário é ADMIN e tem um tour pendente
      if (currentUser.role === 'ADMIN' && localStorage.getItem('evotrainer_tour_pending') === 'true') {
        setShowTour(true);
        localStorage.removeItem('evotrainer_tour_pending');
      }
    }
  }, [currentUser]);

  const getAuthHeaders = () => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  // --- HELPERS BUILDER ---
  const getGroupedExercises = (exercisesArray: any[]) => {
    const grouped: any[] = []; const skipIndices = new Set(); 
    exercisesArray.forEach((ex, idx) => {
      if (skipIndices.has(idx)) return; 
      const group = { main: { ...ex, originalIndex: idx }, partners: [] as any[] };
      if (ex.isConjugado && ex.conjugadoCom) {
        const pIdx = exercisesArray.findIndex((e, i) => i !== idx && !skipIndices.has(i) && e.name === ex.conjugadoCom);
        if (pIdx !== -1) { group.partners.push({ ...exercisesArray[pIdx], originalIndex: pIdx }); skipIndices.add(pIdx); }
      }
      grouped.push(group);
    });
    return grouped;
  };

  // --- EXPORTAÇÃO E WHATSAPP (PDF PREMIUM OTIMIZADO) ---
  const exportarTreinoPDF = (treino: any, aluno: any, isStudent = false) => {
    const agrupados = getGroupedExercises(treino.exercises);
    let tableHTML = `
      <table>
        <thead>
          <tr>
            <th style="width: 5%; text-align: center;">#</th>
            <th style="width: 45%; text-align: left;">Exercício</th>
            <th style="width: 25%; text-align: center;">Séries</th>
            <th style="width: 25%; text-align: center;">Carga/RPE</th>
          </tr>
        </thead>
        <tbody>
    `;

    agrupados.forEach((group: any, index: number) => {
       // Exercício Principal
       tableHTML += `
          <tr>
            <td style="text-align: center; font-weight: 800; color: #2563eb;">${index + 1}</td>
            <td style="font-weight: 700; color: #1e293b;">${group.main.name}</td>
            <td style="text-align: center;"><span class="set-badge">${group.main.sets}</span></td>
            <td style="text-align: center; color: #64748b;">${group.main.weight || '-'}</td>
          </tr>
       `;

       // Exercícios Conjugados (Bi-sets)
       group.partners.forEach((p: any) => {
         tableHTML += `
            <tr class="conjugado-row">
              <td style="text-align: center; color: #06b6d4; font-weight: 800; font-size: 16px;">↳</td>
              <td style="padding-left: 20px; color: #475569;">${p.name}</td>
              <td style="text-align: center;"><span class="set-badge">${p.sets}</span></td>
              <td style="text-align: center; color: #64748b;">${p.weight || '-'}</td>
            </tr>
         `;
       });
    });

    tableHTML += `</tbody></table>`;

    const geradoPor = isStudent ? 'Gerado via EvoTrainer App' : `Personal: ${currentUser?.name || 'Treinador'}`;

    // Layout Moderno para o PDF Nativo
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt">
        <head>
          <meta charset="UTF-8">
          <title>Treino_${aluno.name.split(' ')[0]}_${treino.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; background: #fff;}
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 32px; }
            .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; margin: 0 0 16px 0; color: #0f172a;}
            .logo span { color: #2563eb; }
            .student-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 0 0 4px 0; }
            .student-name { font-size: 24px; font-weight: 800; margin: 0; color: #0f172a;}
            .meta-box { text-align: right; }
            .badge { display: inline-block; background: #2563eb; color: #fff; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-bottom: 8px; }
            .meta-info { color: #64748b; font-size: 14px; margin: 0; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f8fafc; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 11px; padding: 16px 12px; border-bottom: 2px solid #e2e8f0; }
            td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .set-badge { background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 12px; color: #334155; }
            .conjugado-row td { background-color: #fafaf9; }
            .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 24px; }
            .print-alert { background: #eff6ff; border-left: 4px solid #2563eb; color: #1e3a8a; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 30px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);}
            @media print {
              .print-alert { display: none; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="print-alert">
            ℹ️ Na janela de impressão, escolha a opção <strong>"Guardar como PDF"</strong> para baixar a sua ficha!
          </div>
          <div class="header">
            <div>
              <h1 class="logo">EVO<span>TRAINER</span></h1>
              <p class="student-title">Ficha de Treino de</p>
              <h2 class="student-name">${aluno.name}</h2>
            </div>
            <div class="meta-box">
              <div class="badge">${treino.dayOfWeek} - ${treino.title}</div>
              <p class="meta-info">Duração estimada: <strong>${treino.duration}</strong></p>
            </div>
          </div>
          
          ${tableHTML}
          
          <div class="footer">
            ${geradoPor} • <strong>app.evotrainer.com</strong>
          </div>
          
          <script>
            // Abre a janela de impressão automaticamente
            window.onload = () => { setTimeout(() => { window.print(); }, 800); }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if(!printWindow) {
        showToast("Permita pop-ups no seu navegador para gerar o PDF.");
        return;
    }
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const enviarTreinoWhatsApp = (treino: any, aluno: any) => {
    let telefone = aluno.phone || '';
    telefone = telefone.replace(/\D/g, ''); // Limpa tudo que não for número

    if (!telefone) {
      const inputPhone = prompt("O aluno não tem telefone registado no perfil. Digite o número (ex: 5511999999999):");
      if (!inputPhone) return;
      telefone = inputPhone.replace(/\D/g, '');
    }

    // Aciona a geração da página de PDF para o Personal ter o arquivo pronto
    exportarTreinoPDF(treino, aluno);

    // Formata a mensagem com Markdown do WhatsApp
    const mensagem = `Olá *${aluno.name.split(' ')[0]}*! 💪\n\nA sua nova ficha de treino *${treino.title}* já está configurada.\n\n⏱ *Duração:* ${treino.duration}\n📅 *Dia:* ${treino.dayOfWeek}\n\nAcesse ao seu App EvoTrainer para ver os vídeos de execução perfeitos, ou confira o PDF que estou enviando em anexo!\n\nBora esmagar! 🔥`;

    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  // --- LOGIN E CADASTRO ---
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) return showToast("Preencha todos os campos.");
    if (signupPassword !== signupConfirmPassword) return showToast("As senhas não coincidem!");
    
    setIsSigningUp(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: signupName, 
          email: signupEmail, 
          password: signupPassword,
          role: 'ADMIN',
          plano: 'GRATIS'
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Salva login direto
        setToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem('treino_ai_token', data.token);
        localStorage.setItem('treino_ai_user', JSON.stringify(data.user));
        
        // Define a flag para exibir o tour guiado
        localStorage.setItem('evotrainer_tour_pending', 'true');
        
        setSignupName(''); setSignupEmail(''); setSignupPassword(''); setSignupConfirmPassword('');
        showToast("Bem-vindo ao EvoTrainer!");
      } else {
        showToast(data.error || "Erro ao criar conta.");
      }
    } catch (error) {
      showToast(`Erro ao ligar com o servidor.`);
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.clear();
    setTreinoIniciado(false);
  };

  // --- ADMIN API ---
  const fetchAlunos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/alunos`, { headers: getAuthHeaders() });
      if (res.ok) setAlunos(await res.json());
    } catch (e) {} finally { setIsLoading(false); }
  };

  const criarAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/alunos`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(novoAluno) });
      if (res.ok) { showToast("Aluno registado!"); setShowAddModal(false); setNovoAluno({ name: '', email: '', password: '' }); fetchAlunos(); }
      else { const d = await res.json(); showToast(d.error || "Erro."); }
    } catch (e) { showToast("Erro de ligação."); }
  };

  const toggleStatusAluno = async (alunoId: number, statusAtual: string) => {
    const novoStatus = statusAtual === 'Bloqueado' ? 'Ativo' : 'Bloqueado';
    try {
      const res = await fetch(`${API_URL}/alunos/${alunoId}/status`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ status: novoStatus }) });
      if (res.ok) { showToast(`Estado atualizado!`); fetchAlunos(); }
    } catch (e) { showToast("Erro."); }
  };

  const excluirAluno = async (alunoId: number, nome: string) => {
    if (!window.confirm(`Apagar o aluno "${nome}" e todo o seu histórico?`)) return;
    try {
      const res = await fetch(`${API_URL}/alunos/${alunoId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) { showToast(`Aluno apagado.`); fetchAlunos(); }
    } catch (e) { showToast("Erro."); }
  };

  const abrirModalEdicao = async (treino: any) => {
    setShowGerenciarTreinosModal(false); setIsEditingTreino(true); setTreinoEditId(treino.id);
    let exercisesToEdit = treino.exercises;
    if (!exercisesToEdit) {
      try {
        const res = await fetch(`${API_URL}/treinos/aluno/${alunoSelecionado.id}`, { headers: getAuthHeaders() });
        if (res.ok) { const all = await res.json(); const t = all.find((x:any) => x.id === treino.id); if (t) exercisesToEdit = t.exercises; }
      } catch (e) {}
    }
    setNovoTreino({ title: treino.title, duration: treino.duration, dayOfWeek: treino.dayOfWeek, exercises: exercisesToEdit && exercisesToEdit.length > 0 ? exercisesToEdit.map((e:any) => ({...e})) : [{ name: '', sets: '', weight: '', youtubeId: '', isConjugado: false, conjugadoCom: '' }] });
    setShowTreinoModal(true); 
  };

  const salvarTreino = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoSelecionado) return;
    setIsCriandoTreino(true); showToast("A sincronizar vídeos do YouTube...");
    try {
      const exercisesComVideos = [];
      for (const ex of novoTreino.exercises) {
        if (!ex.youtubeId || ex.youtubeId.trim() === '') {
          const idEncontrado = await buscarVideoNoYouTube(ex.name);
          exercisesComVideos.push({ ...ex, youtubeId: idEncontrado });
        } else { exercisesComVideos.push(ex); }
      }
      const payload = { ...novoTreino, exercises: exercisesComVideos, userId: alunoSelecionado.id };
      const url = isEditingTreino ? `${API_URL}/treinos/${treinoEditId}` : `${API_URL}/treinos`;
      const metodo = isEditingTreino ? 'PUT' : 'POST';
      const res = await fetch(url, { method: metodo, headers: getAuthHeaders(), body: JSON.stringify(payload) });
      if (res.ok) {
        showToast(isEditingTreino ? "Treino atualizado!" : "Treino criado!");
        setShowTreinoModal(false); setAlunoSelecionado(null); setIsEditingTreino(false); setTreinoEditId(null);
        setNovoTreino({ title: '', duration: '', dayOfWeek: 'Segunda', exercises: [{ name: '', sets: '', weight: '', youtubeId: '', isConjugado: false, conjugadoCom: '' }] });
        fetchAlunos();
      }
    } catch (e) { showToast("Erro ao guardar."); } finally { setIsCriandoTreino(false); }
  };

  const confirmarExclusao = (workoutId: number, title: string) => { setTreinoParaExcluir({ id: workoutId, title: title }); setShowDeleteModal(true); };
  const executarExclusaoTreino = async () => {
    if (!treinoParaExcluir) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/treinos/${treinoParaExcluir.id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) { showToast("Treino apagado!"); fetchAlunos(); setShowDeleteModal(false); setTreinoParaExcluir(null); }
    } catch (e) {} finally { setIsDeleting(false); }
  };

  // --- TREINO INTELIGENTE (IA) ---
  const gerarTreinoInteligente = async () => {
    setIsGeneratingIA(true);

    if (!iaAlunoId) {
      showToast("Selecione um aluno primeiro.");
      setIsGeneratingIA(false); 
      return;
    }

    try {
      showToast("A IA está a analisar o perfil. Isso pode demorar até 15 segundos...");

      const response = await fetch(`${API_URL}/ai/gerar-treino`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          alunoId: iaAlunoId,
          split: iaSplit,
          frequencia: iaFrequencia,
          prompt: iaPrompt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao gerar treino com IA.");
      }

      showToast(data.message);
      setIaPrompt('');
      setIaSplit('ABC');
      setIaFrequencia('5'); 
      await fetchAlunos(); 
      setAdminTabAtiva('alunos');

    } catch (err: any) {
      console.error(err);
      showToast(`Aviso: ${err.message}`);
    } finally {
      setIsGeneratingIA(false);
    }
  };

  // --- ALUNO API ---
  const fetchTreinosAluno = async () => {
    if (currentUser?.status === 'Bloqueado') { setTreinosAluno([]); return; }
    try {
      const res = await fetch(`${API_URL}/treinos/aluno/${currentUser.id}`, { headers: getAuthHeaders() });
      if (res.ok) setTreinosAluno(await res.json());
    } catch (e) {}
  };

  const finalizarTreino = async (nomeDoTreino: string) => {
    try {
      const res = await fetch(`${API_URL}/treinos/finalizar`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ userId: currentUser.id, workoutName: nomeDoTreino }) });
      if (res.ok) {
        const result = await res.json();
        setCurrentUser({ ...currentUser, streak: result.novaOfensiva });
        localStorage.setItem('treino_ai_user', JSON.stringify({ ...currentUser, streak: result.novaOfensiva }));
        setShowFeedbackModal(true);
      }
    } catch (e) { showToast("Erro ao guardar o treino."); }
  };

  const enviarFeedback = async () => {
    try {
      showToast("Feedback enviado com sucesso! 🔥");
      setShowFeedbackModal(false);
      setTreinoIniciado(false);
      setExerciciosFeitos([]);
      setAlunoTabAtiva('home');
      setFeedbackComment('');
      setFeedbackRating(5);
    } catch (e) { showToast("Erro ao enviar feedback."); }
  };

  const salvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/alunos/${currentUser.id}/perfil`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(profileForm) });
      if (res.ok) {
        const up = await res.json(); setCurrentUser(up); localStorage.setItem('treino_ai_user', JSON.stringify(up)); showToast("Perfil salvo!");
      }
    } catch (e) {} finally { setIsSavingProfile(false); }
  };

  const mudarSenha = async (e: React.FormEvent) => {
    e.preventDefault(); if (passwordForm.new !== passwordForm.confirm) return showToast("Senhas não coincidem.");
    setIsChangingPassword(true);
    try {
      const res = await fetch(`${API_URL}/alunos/${currentUser.id}/senha`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.new }) });
      if (res.ok) { showToast("Senha alterada!"); setPasswordForm({ current: '', new: '', confirm: '' }); } else showToast("Erro ao alterar.");
    } catch (e) {} finally { setIsChangingPassword(false); }
  };

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') fetchAlunos();
    if (currentUser?.role === 'STUDENT') fetchTreinosAluno();
  }, [currentUser]);

  const alunosFiltrados = alunos.filter(a => a.name.toLowerCase().includes(buscaAluno.toLowerCase()) || a.email.toLowerCase().includes(buscaAluno.toLowerCase()));

  const updateExercise = (i: number, f: string, v: any) => { const n = [...novoTreino.exercises]; n[i] = { ...n[i], [f]: v }; setNovoTreino({...novoTreino, exercises: n}); };
  const removerExercicio = (i: number) => { const n = [...novoTreino.exercises]; const r = n[i].name; n.splice(i, 1); n.forEach(ex => { if (ex.conjugadoCom === r) { ex.isConjugado = false; ex.conjugadoCom = ''; } }); setNovoTreino({...novoTreino, exercises: n}); };
  const toggleConjugado = (i: number) => { const n = [...novoTreino.exercises]; n[i].isConjugado = !n[i].isConjugado; if(!n[i].isConjugado) n[i].conjugadoCom = ''; setNovoTreino({ ...novoTreino, exercises: n }); };
  const toggleDone = (id: number) => { if (exerciciosFeitos.includes(id)) setExerciciosFeitos(exerciciosFeitos.filter(i => i !== id)); else setExerciciosFeitos([...exerciciosFeitos, id]); };

  // ==================== RENDERIZAÇÃO DE AUTENTICAÇÃO ====================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-50 relative overflow-hidden">
        <div className="absolute top-20 right-[-10%] w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-[-10%] w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-[3rem] shadow-2xl animate-fade-in text-center relative z-10">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <Dumbbell size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black mb-1 tracking-tighter">EVO<span className="text-blue-500">TRAINER</span></h1>
          <p className="text-slate-400 text-xs mb-8 font-medium">{isLoginMode ? 'Acesso ao Sistema' : 'Crie sua conta de Personal'}</p>

          {isLoginMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="email" required placeholder="Seu E-mail" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="password" required placeholder="Sua Senha" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <button type="submit" disabled={isLoggingIn} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm py-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all tracking-widest uppercase">
                {isLoggingIn ? <Activity className="animate-spin" /> : 'ENTRAR NA CONTA'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="text" required placeholder="Nome Completo" value={signupName} onChange={(e) => setSignupName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="email" required placeholder="Seu E-mail" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="password" required placeholder="Crie uma Senha" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="password" required placeholder="Confirme a Senha" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <button type="submit" disabled={isSigningUp} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                {isSigningUp ? <Activity className="animate-spin" /> : 'CRIAR CONTA'}
              </button>
            </form>
          )}

          <div className="mt-2 flex flex-col gap-2 text-center w-full">
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-sm font-bold text-slate-400 hover:text-white transition-colors w-full p-2">
              {isLoginMode ? "Novo por aqui? Crie sua conta." : "Já tem conta? Faça Login."}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- ADMIN VIEW ---
  if (currentUser.role === 'ADMIN') {
    const groupedBuilderExercises = getGroupedExercises(novoTreino.exercises);
    const ativosCount = alunos.filter(a => a.status !== 'Bloqueado').length;
    const bloqueadosCount = alunos.filter(a => a.status === 'Bloqueado').length;

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col text-slate-50 md:items-center md:justify-center relative">
        <div className="w-full h-screen md:h-[850px] md:max-w-md bg-slate-900 md:rounded-[40px] md:border-[8px] border-slate-800 flex flex-col relative overflow-hidden shadow-2xl">
          {toastMsg && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[300] bg-blue-600 text-white font-bold px-4 py-2 rounded-full shadow-lg text-sm whitespace-nowrap animate-fade-in">{toastMsg}</div>}
          
          <InstallBanner showInstallBanner={showInstallBanner} setShowInstallBanner={setShowInstallBanner} handleInstallClick={handleInstallClick} />
          <TourModal showTour={showTour} setShowTour={setShowTour} tourStep={tourStep} setTourStep={setTourStep} />
          <YoutubeModal videoAtivo={videoAtivo} setVideoAtivo={setVideoAtivo} />

          <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10 shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="EvoTrainer" className="w-12 h-12 rounded-xl object-cover border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]" />
              <div>
                <h1 className="text-xl font-black text-white leading-tight">EVO<span className="text-blue-500">TRAINER</span></h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Gestão</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white bg-slate-800 p-2.5 rounded-xl transition-colors"><LogOut size={18} /></button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 custom-scrollbar">
            
            {/* ADMIN TAB: ALUNOS & DASHBOARD */}
            {adminTabAtiva === 'alunos' && (
              <div className="animate-fade-in flex flex-col gap-6">
                {/* Dashboard Simples */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
                    <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-1">Total</p>
                    <p className="text-2xl font-black text-white">{alunos.length}</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
                    <p className="text-[9px] text-green-500 font-black uppercase tracking-widest mb-1">Ativos</p>
                    <p className="text-2xl font-black text-white">{ativosCount}</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
                    <p className="text-[9px] text-red-500 font-black uppercase tracking-widest mb-1">Inativos</p>
                    <p className="text-2xl font-black text-white">{bloqueadosCount}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center px-1">
                    <h2 className="text-xl font-black flex items-center gap-2"><Users className="text-blue-500" size={20}/> Lista de Alunos</h2>
                    <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg active:scale-95 transition-transform"><Plus size={20}/></button>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input type="text" placeholder="Procurar por nome ou e-mail..." value={buscaAluno} onChange={(e) => setBuscaAluno(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm outline-none focus:border-blue-500 transition-colors shadow-inner" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  {isLoading ? <div className="text-center py-8"><Activity className="animate-spin w-8 h-8 text-blue-500 mx-auto"/></div> : 
                   alunosFiltrados.length === 0 ? <p className="text-center text-slate-500 py-8 font-bold text-sm border-2 border-dashed border-slate-800 rounded-3xl">Nenhum aluno encontrado.</p> : (
                    alunosFiltrados.map(aluno => (
                      <div key={aluno.id} className={`bg-slate-950 p-5 rounded-[1.8rem] border border-slate-800 shadow-lg flex flex-col gap-4 transition-opacity ${aluno.status === 'Bloqueado' ? 'opacity-50' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-slate-900 border border-slate-700 text-blue-500 font-black rounded-xl flex items-center justify-center shadow-inner">{aluno.name.charAt(0)}</div>
                            <div>
                              <p className="font-black text-white text-lg leading-tight">{aluno.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{aluno.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${aluno.status === 'Bloqueado' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>{aluno.status}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-900 p-3 rounded-2xl">
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Fichas Enviadas</p>
                            <p className="text-lg font-black text-cyan-400 mt-0.5">{aluno._count?.workouts || 0}</p>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-2xl">
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Sequência Atual</p>
                            <p className="text-lg font-black text-orange-400 mt-0.5">{aluno.streak} dias</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/50">
                          <button onClick={() => { setAlunoSelecionado(aluno); setIsEditingTreino(false); setNovoTreino({ title: '', duration: '', dayOfWeek: 'Segunda', exercises: [{ name: '', sets: '', weight: '', youtubeId: '', isConjugado: false, conjugadoCom: '' }] }); setShowTreinoModal(true); }} title="Novo Treino" className="flex-1 bg-cyan-600/10 text-cyan-400 p-3 rounded-xl flex justify-center active:scale-90 transition-all"><Plus size={18}/></button>
                          <button onClick={() => { setAlunoSelecionado(aluno); const alunoAtualizado = alunos.find(a => a.id === aluno.id); if(alunoAtualizado) setAlunoSelecionado(alunoAtualizado); setShowGerenciarTreinosModal(true); }} title="Gerenciar Fichas (Ver PDF e WhatsApp)" className="flex-1 bg-slate-800 text-slate-400 p-3 rounded-xl flex justify-center active:scale-90 transition-all"><List size={18}/></button>
                          <button onClick={() => toggleStatusAluno(aluno.id, aluno.status)} title={aluno.status === 'Bloqueado' ? "Desbloquear" : "Bloquear"} className="flex-1 bg-slate-800 text-slate-400 p-3 rounded-xl flex justify-center active:scale-90 transition-all">{aluno.status === 'Bloqueado' ? <Unlock size={18}/> : <Ban size={18}/>}</button>
                          <button onClick={() => excluirAluno(aluno.id, aluno.name)} title="Excluir Aluno" className="flex-1 bg-red-600/10 text-red-500 p-3 rounded-xl flex justify-center active:scale-90 transition-all"><Trash2 size={18}/></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ADMIN TAB: GERADOR IA COM DIVISÃO AUTOMÁTICA */}
            {adminTabAtiva === 'ia' && (
              <div className="animate-fade-in flex flex-col gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-2xl font-black text-white flex items-center gap-2 leading-none"><Sparkles fill="currentColor"/> Mágico de IA</h2>
                    <p className="text-indigo-200 text-xs mt-3 leading-relaxed font-medium">A IA organiza uma proposta inicial de treino com base na divisão escolhida, otimizando o processo. Recomendamos a revisão do personal antes de aplicar ao aluno.</p>
                  </div>
                  <Sparkles size={120} className="absolute -bottom-6 -right-6 text-white opacity-10 transform -rotate-12" />
                </div>

                <div className="flex flex-col gap-4 bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-lg">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Selecionar Aluno</label>
                    <select value={iaAlunoId} onChange={e => setIaAlunoId(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-indigo-500 font-bold appearance-none cursor-pointer">
                      <option value="">Escolher aluno da lista...</option>
                      {alunos.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Divisão de Treino</label>
                      <select value={iaSplit} onChange={e => setIaSplit(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-indigo-500 font-bold appearance-none cursor-pointer">
                        <option value="A">Treino Único (A)</option>
                        <option value="AB">Divisão AB</option>
                        <option value="ABC">Divisão ABC</option>
                        <option value="ABCD">Divisão ABCD</option>
                        <option value="ABCDE">Divisão ABCDE</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Frequência Semanal</label>
                      <select value={iaFrequencia} onChange={e => setIaFrequencia(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-indigo-500 font-bold appearance-none cursor-pointer">
                        {[1, 2, 3, 4, 5, 6, 7].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'dia' : 'dias'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contexto Clínico e Foco</label>
                    <textarea 
                      value={iaPrompt} 
                      onChange={e => setIaPrompt(e.target.value)} 
                      placeholder="Ex: Treino para hipertrofia. Aluno tem condromalácia patelar e hipertensão. Evitar salto e impacto extremo." 
                      rows={4} 
                      className="bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-indigo-500 resize-none font-medium text-sm custom-scrollbar"
                    ></textarea>
                  </div>

                  <button onClick={gerarTreinoInteligente} disabled={isGeneratingIA || !iaAlunoId || !iaPrompt} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm py-5 rounded-[1.5rem] flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(79,70,229,0.4)] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest">
                    {isGeneratingIA ? <Activity className="animate-spin" /> : <Sparkles size={20} />} 
                    {isGeneratingIA ? 'Criando Estrutura...' : 'Gerar Treino Inteligente'}
                  </button>
                </div>
              </div>
            )}

            {/* ADMIN TAB: PERFIL DO PERSONAL */}
            {adminTabAtiva === 'perfil' && (
              <div className="flex flex-col gap-6 animate-fade-in pb-8">
                 <h2 className="text-2xl font-black flex items-center gap-2 px-1"><UserIcon className="text-blue-500"/> Conta do Personal</h2>

                 <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                       <div className="w-24 h-24 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center text-4xl font-black border-2 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                          {currentUser.name.charAt(0).toUpperCase()}
                       </div>
                       <button onClick={simularUploadFoto} className="absolute bottom-0 right-0 bg-blue-600 text-white p-2.5 rounded-full shadow-lg active:scale-90 transition-transform">
                         <Camera size={16} />
                       </button>
                    </div>
                    <h3 className="text-xl font-black text-white mt-4 relative z-10">{currentUser.name}</h3>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1 relative z-10">{currentUser.email}</p>
                    <div className="absolute top-4 right-4 opacity-5"><UserIcon size={140} /></div>
                 </div>

                 <button onClick={() => setShowTour(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 rounded-[2rem] flex items-center justify-between text-white shadow-lg active:scale-95 transition-all">
                    <div className="flex items-center gap-3">
                      <Sparkles size={24} />
                      <div className="text-left">
                        <p className="font-black text-sm uppercase tracking-widest">Rever Tour Guiado</p>
                        <p className="text-[10px] text-blue-200">Relembre como usar a plataforma.</p>
                      </div>
                    </div>
                    <Play fill="white" size={16}/>
                 </button>

                 <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-lg">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Lock size={14}/> Palavra-Passe</h3>
                    <form onSubmit={mudarSenha} className="flex flex-col gap-3">
                      <input type="password" required value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} placeholder="Senha Atual" className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-blue-500 transition-colors" />
                      <input type="password" required value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} placeholder="Nova Senha" className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-blue-500 transition-colors" />
                      <input type="password" required value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} placeholder="Confirmar Nova Senha" className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-blue-500 transition-colors" />
                      <button type="submit" disabled={isChangingPassword} className="w-full bg-slate-800 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest mt-2 active:scale-95 transition-colors">
                        {isChangingPassword ? <Activity className="animate-spin mx-auto"/> : 'Atualizar Segurança'}
                      </button>
                    </form>
                 </div>
              </div>
            )}
          </div>

          {/* ADMIN BOTTOM NAV */}
          <div className="absolute bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50 flex justify-around items-center p-4 pb-10 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            {[
              { id: 'alunos', icon: Users, label: 'Alunos' },
              { id: 'ia', icon: Sparkles, label: 'Inteligência' },
              { id: 'perfil', icon: UserIcon, label: 'Perfil' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setAdminTabAtiva(tab.id)} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${adminTabAtiva === tab.id ? 'text-blue-500 scale-110' : 'text-slate-600 hover:text-slate-400'}`}>
                <tab.icon size={adminTabAtiva === tab.id ? 26 : 24} strokeWidth={adminTabAtiva === tab.id ? 2.5 : 2} />
                <span className="text-[9px] font-black uppercase tracking-[0.1em]">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* MODAL ADICIONAR ALUNO (ADMIN) */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200] backdrop-blur-md">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-fade-in">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2 leading-none"><UserIcon className="text-blue-500"/> Registar Aluno</h3>
                <form onSubmit={criarAluno} className="flex flex-col gap-4">
                  <input type="text" required placeholder="Nome Completo" value={novoAluno.name} onChange={e => setNovoAluno({...novoAluno, name: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500 font-bold" />
                  <input type="email" required placeholder="E-mail de acesso" value={novoAluno.email} onChange={e => setNovoAluno({...novoAluno, email: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500" />
                  <input type="text" placeholder="Senha (Padrão 123456)" value={novoAluno.password} onChange={e => setNovoAluno({...novoAluno, password: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500" />
                  <div className="flex gap-2 mt-4">
                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest">Cancelar</button>
                    <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-4 rounded-[1.2rem] shadow-lg uppercase text-[10px] tracking-widest active:scale-95">Guardar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL GERENCIAR TREINOS COM WHATSAPP E PDF (ADMIN) */}
          {showGerenciarTreinosModal && alunoSelecionado && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200] backdrop-blur-md">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800 shrink-0">
                  <h3 className="text-xl font-black flex items-center gap-2 leading-none"><List className="text-blue-500"/> Fichas</h3>
                  <button onClick={() => setShowGerenciarTreinosModal(false)} className="p-2 bg-slate-800 rounded-xl text-slate-500"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                  {alunoSelecionado.workouts?.length === 0 ? <div className="py-12 text-center text-slate-600 font-black uppercase text-[10px] tracking-widest">Nenhuma ficha.</div> :
                   alunoSelecionado.workouts?.map((w: any) => (
                    <div key={w.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center group">
                      <div><p className="font-black text-cyan-400 uppercase tracking-tight">{w.title}</p><p className="text-[10px] text-slate-600 font-black mt-1 uppercase tracking-widest">{w.dayOfWeek} • {w.duration}</p></div>
                      <div className="flex gap-2">
                        {/* Botões de WhatsApp e PDF */}
                        <button onClick={() => enviarTreinoWhatsApp(w, alunoSelecionado)} title="Enviar WhatsApp e PDF" className="p-2.5 bg-emerald-600/10 text-emerald-500 rounded-xl active:bg-emerald-600 active:text-white transition-all"><MessageCircle size={16} /></button>
                        <button onClick={() => exportarTreinoPDF(w, alunoSelecionado, false)} title="Baixar PDF" className="p-2.5 bg-slate-800 text-slate-400 rounded-xl active:bg-slate-700 active:text-white transition-all"><Download size={16} /></button>
                        <button onClick={() => { abrirModalEdicao(w); }} title="Editar" className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl active:bg-blue-600 active:text-white transition-all"><Pencil size={16} /></button>
                        <button onClick={() => { setTreinoParaExcluir({ id: w.id, title: w.title }); setShowDeleteModal(true); }} title="Excluir" className="p-2.5 bg-red-600/10 text-red-500 rounded-xl active:bg-red-600 active:text-white transition-all"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODAL CRIAR/EDITAR TREINO (ADMIN - COM YOUTUBE E AUTO-BUSCA) */}
          {showTreinoModal && (
            <div className="fixed inset-0 bg-black/95 z-[250] p-4 flex flex-col justify-start overflow-y-auto pt-10 pb-10">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] w-full max-w-xl mx-auto shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-xl font-black flex items-center gap-2 leading-none"><Dumbbell className="text-cyan-500"/> {isEditingTreino ? 'Editar Ficha' : 'Nova Ficha'}</h3>
                    <p className="text-[10px] text-slate-500 mt-2 font-black uppercase tracking-widest">{alunoSelecionado?.name.split(' ')[0]}</p>
                  </div>
                  <button onClick={() => { setShowTreinoModal(false); setIsEditingTreino(false); }} className="p-2 bg-slate-800 rounded-2xl text-slate-500"><X size={20}/></button>
                </div>
                
                <form onSubmit={salvarTreino} className="space-y-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5"><label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Identificação</label><input type="text" required placeholder="Ex: Treino A - Superior" value={novoTreino.title} onChange={e => setNovoTreino({...novoTreino, title: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500 font-bold" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5"><label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Duração</label><input type="text" required placeholder="45 min" value={novoTreino.duration} onChange={e => setNovoTreino({...novoTreino, duration: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none" /></div>
                      <div className="flex flex-col gap-1.5"><label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Dia</label>
                        <select value={novoTreino.dayOfWeek} onChange={e => setNovoTreino({...novoTreino, dayOfWeek: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none font-bold">
                          {['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-black text-slate-500 mb-2 flex items-center gap-2 uppercase text-[10px] tracking-[0.2em] px-1">Exercícios</h4>
                    {novoTreino.exercises.map((ex, idx) => (
                      <div key={idx} className="bg-slate-950 p-5 rounded-[2rem] border border-slate-800 shadow-inner flex flex-col gap-4 relative">
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => toggleConjugado(idx)} className={`p-3 rounded-xl transition-all shadow-lg ${ex.isConjugado ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-110' : 'bg-slate-800 text-slate-600'}`}><LinkIcon size={18}/></button>
                          <input type="text" required placeholder="Nome do Exercício" value={ex.name} onChange={e => updateExercise(idx, 'name', e.target.value)} className="flex-1 bg-transparent border-b border-slate-800 text-white font-black outline-none focus:border-blue-500 pb-1" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 ml-11">
                           <div className="flex flex-col gap-1"><label className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Séries</label><input type="text" required placeholder="3x12" value={ex.sets} onChange={e => updateExercise(idx, 'sets', e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-blue-500" /></div>
                           <div className="flex flex-col gap-1"><label className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Carga</label><input type="text" placeholder="Kg ou Nível" value={ex.weight} onChange={e => updateExercise(idx, 'weight', e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-blue-500" /></div>
                        </div>

                        <div className="ml-11 mt-1 flex flex-col gap-1">
                           <label className="text-[8px] text-slate-600 uppercase font-black tracking-widest flex items-center gap-1"><Youtube size={10} className="text-red-500"/> Link do YouTube (Opcional)</label>
                           <input type="text" placeholder="Cole o link ou deixe vazio para a IA procurar..." value={ex.youtubeId} onChange={e => updateExercise(idx, 'youtubeId', extractYouTubeId(e.target.value))} className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-red-500 transition-colors" />
                        </div>

                        {ex.isConjugado && (
                          <div className="ml-11 bg-cyan-500/5 p-3 rounded-2xl border border-cyan-500/10 flex flex-col gap-2 mt-1">
                             <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5"><LinkIcon size={10}/> Bi-Set Ativo</p>
                             <select value={ex.conjugadoCom || ''} onChange={e => updateExercise(idx, 'conjugadoCom', e.target.value)} className="bg-slate-900 border border-cyan-500/20 rounded-xl p-2.5 text-white text-[10px] outline-none font-bold">
                               <option value="">Escolher exercício parceiro...</option>
                               {novoTreino.exercises.map((e, i) => i !== idx && e.name.trim() !== '' ? <option key={i} value={e.name}>{e.name}</option> : null)}
                             </select>
                          </div>
                        )}
                        <button type="button" onClick={() => removerExercicio(idx)} className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full border-4 border-slate-900 active:scale-90 transition-all"><X size={14}/></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setNovoTreino({...novoTreino, exercises: [...novoTreino.exercises, {name: '', sets: '', weight: '', youtubeId: '', isConjugado: false, conjugadoCom: ''}]})} className="w-full py-5 border-2 border-dashed border-slate-800 rounded-[2rem] text-cyan-500 font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-slate-800/30 active:scale-95 transition-all"><Plus size={14}/> Adicionar Exercício</button>
                  </div>

                  <button type="submit" disabled={isCriandoTreino} className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.8rem] shadow-[0_10px_30px_rgba(37,99,235,0.4)] active:scale-95 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest">
                    {isCriandoTreino ? <Activity className="animate-spin" size={20}/> : <Save size={20}/>} {isCriandoTreino ? 'A Sincronizar Vídeos...' : 'Guardar e Pesquisar Vídeos'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* MODAL DE EXCLUSÃO TREINO (ADMIN) */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[300] backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] w-full max-w-xs text-center shadow-2xl animate-fade-in">
                <AlertTriangle className="text-red-500 w-14 h-14 mx-auto mb-4" />
                <h3 className="text-xl font-black text-white mb-2 leading-tight uppercase tracking-tight">Apagar Ficha?</h3>
                <div className="flex gap-2 mt-8">
                  <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-slate-800 text-white font-black rounded-2xl text-[10px] uppercase">Não</button>
                  <button onClick={executarExclusaoTreino} disabled={isDeleting} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl text-[10px] uppercase">{isDeleting ? <Activity className="animate-spin mx-auto"/> : 'Sim'}</button>
                </div>
              </div>
            </div>
          )}
        </div>
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
        
        <InstallBanner showInstallBanner={showInstallBanner} setShowInstallBanner={setShowInstallBanner} handleInstallClick={handleInstallClick} />
        <YoutubeModal videoAtivo={videoAtivo} setVideoAtivo={setVideoAtivo} />

        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10 shadow-md">
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center text-cyan-400 font-black text-xl border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
               {aluno.name.charAt(0).toUpperCase()}
             </div>
             <div>
               <h2 className="text-lg font-bold leading-tight">Olá, {aluno.name.split(' ')[0]}</h2>
               <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Bora esmagar? 💪</p>
             </div>
           </div>
           <button onClick={handleLogout} className="text-slate-400 hover:text-white bg-slate-800 p-2.5 rounded-xl transition-colors"><LogOut size={18}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 custom-scrollbar">
          
          {/* TAB: INÍCIO */}
          {alunoTabAtiva === 'home' && !treinoIniciado && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/10 p-6 rounded-[2rem] border border-orange-500/20 flex items-center justify-between shadow-lg">
                <div><p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mb-1">Sequência</p><p className="text-4xl font-black mt-1 text-white">{aluno.streak} <span className="text-lg font-medium text-slate-300">dias</span></p></div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] animate-pulse"><Flame className="text-white w-7 h-7" /></div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-[0.2em] px-1">Cronograma</h3>
                <div className="flex justify-between">
                  {diasCurtos.map((diaLetra, i) => {
                    const nomeCompleto = diasCompletos[i];
                    const isAtivo = diaAtivo === nomeCompleto;
                    const temTreino = treinosAluno.some(t => t.dayOfWeek === nomeCompleto);
                    
                    return (
                      <div key={i} onClick={() => setDiaAtivo(nomeCompleto)} className="flex flex-col items-center gap-1 cursor-pointer">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
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
                  <div className="bg-slate-800/20 border border-slate-700/40 p-12 rounded-[2.5rem] flex flex-col items-center text-center gap-4 animate-fade-in">
                    <Calendar className="w-12 h-12 text-slate-700" />
                    <p className="text-slate-500 font-bold text-sm">Sem treino programado. <br/> Aproveita o descanso! 🧘</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-1 rounded-[2.5rem] shadow-2xl animate-fade-in transform active:scale-[0.98] transition-transform">
                    <div className="bg-slate-900 p-8 rounded-[2.2rem] flex flex-col items-center text-center relative overflow-hidden">
                      <div className="absolute -right-6 -top-6 text-slate-800/40 transform rotate-12"><Dumbbell size={120} /></div>
                      <span className="bg-blue-500/20 text-cyan-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest relative z-10 border border-blue-500/20">Ficha de {treinoSelecionado.dayOfWeek}</span>
                      <h3 className="text-3xl font-black text-white leading-tight mt-6 relative z-10">{treinoSelecionado.title}</h3>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest relative z-10 mt-2 mb-8">{treinoSelecionado.duration} • {treinoSelecionado.exercises?.length || 0} exercícios</p>
                      
                      <button onClick={() => { setExerciciosFeitos([]); setTreinoIniciado(true); }} className="w-full bg-blue-600 text-white font-black text-lg py-5 rounded-[1.5rem] flex items-center justify-center gap-2 relative z-10 shadow-[0_10px_30px_rgba(37,99,235,0.4)] uppercase tracking-widest"><Play fill="currentColor" /> INICIAR TREINO</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: FICHAS */}
          {alunoTabAtiva === 'treinos' && !treinoIniciado && (
            <div className="animate-fade-in flex flex-col gap-6">
              <h2 className="text-2xl font-black flex items-center gap-2 px-1"><List className="text-cyan-500"/> Suas Fichas</h2>
              {treinosAluno.length === 0 ? (
                <div className="bg-slate-800/30 p-12 rounded-[2.5rem] text-center border border-dashed border-slate-700">
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Nenhuma ficha disponível.</p>
                </div>
              ) : 
                treinosAluno.map((t: any) => (
                  <div key={t.id} className="bg-slate-800/50 border border-slate-700 p-5 rounded-[2rem] flex justify-between items-center active:scale-[0.98] transition-all shadow-lg">
                     <div className="flex-1">
                       <span className="text-cyan-400 text-[9px] font-black uppercase tracking-[0.2em] bg-blue-500/10 px-2 py-1 rounded-lg">{t.dayOfWeek}</span>
                       <h3 className="text-xl font-black text-white mt-2 leading-tight">{t.title}</h3>
                       <p className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-widest">{t.duration} • {t.exercises?.length} exercícios</p>
                     </div>
                     <div className="flex gap-2">
                       <button onClick={() => exportarTreinoPDF(t, currentUser, true)} className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 shadow-lg hover:text-white transition-colors">
                         <Download size={20} />
                       </button>
                       <button onClick={() => { setDiaAtivo(t.dayOfWeek); setAlunoTabAtiva('home'); }} className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform">
                         <Play size={20} fill="currentColor" className="ml-1"/>
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
               <h2 className="text-2xl font-black flex items-center gap-2 px-1"><UserIcon className="text-cyan-500"/> O seu Perfil</h2>

               <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                     <div className="w-24 h-24 bg-blue-600/20 text-cyan-400 rounded-full flex items-center justify-center text-4xl font-black border-2 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'U'}
                     </div>
                     <button onClick={simularUploadFoto} className="absolute bottom-0 right-0 bg-blue-600 text-white p-2.5 rounded-full shadow-lg active:scale-90 transition-transform">
                       <Camera size={16} />
                     </button>
                  </div>
                  <h3 className="text-xl font-black text-white mt-4 relative z-10">{profileForm.name}</h3>
                  <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1 relative z-10">{profileForm.email}</p>
                  <div className="absolute -bottom-10 -right-10 opacity-5"><UserIcon size={180} /></div>
               </div>

               <form onSubmit={salvarPerfil} className="flex flex-col gap-4">
                  <div className="bg-slate-900 p-5 rounded-[2rem] border border-slate-800 flex flex-col gap-4 shadow-lg">
                     <div className="flex flex-col gap-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp</label>
                       <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} placeholder="(11) 99999-9999" className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition-colors font-bold text-sm" />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Peso (kg)</label>
                          <input type="number" value={profileForm.weight} onChange={e => setProfileForm({...profileForm, weight: e.target.value})} placeholder="Ex: 75" className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-blue-500 text-center font-bold" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Altura (cm)</label>
                          <input type="number" value={profileForm.height} onChange={e => setProfileForm({...profileForm, height: e.target.value})} placeholder="Ex: 175" className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-blue-500 text-center font-bold" />
                        </div>
                     </div>
                  </div>
                  <button type="submit" disabled={isSavingProfile} className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.8rem] shadow-[0_10px_30px_rgba(37,99,235,0.4)] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    {isSavingProfile ? <Activity className="animate-spin"/> : <Save size={18} />} SALVAR PERFIL
                  </button>
               </form>

               <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Lock size={14}/> Segurança</h3>
                  <form onSubmit={mudarSenha} className="flex flex-col gap-3">
                    <input type="password" required value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} placeholder="Senha Atual" className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-blue-500 text-sm" />
                    <input type="password" required value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} placeholder="Nova Senha" className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-blue-500 text-sm" />
                    <input type="password" required value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} placeholder="Confirmar Nova" className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-blue-500 text-sm" />
                    <button type="submit" disabled={isChangingPassword} className="w-full bg-slate-800 text-white font-black py-4 rounded-xl mt-2 text-[10px] uppercase tracking-widest active:bg-slate-700 transition-colors">
                      {isChangingPassword ? <Activity className="animate-spin mx-auto"/> : 'ALTERAR SENHA'}
                    </button>
                  </form>
               </div>
            </div>
          )}

          {/* ECRÃ DE TREINO (A EXECUTAR) */}
          {treinoIniciado && treinoSelecionado && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="mb-4 flex justify-between items-center bg-slate-950/80 backdrop-blur-md sticky top-0 py-4 z-20 rounded-b-[2rem] border-b border-slate-800 -mt-6 px-2">
                <div><span className="text-cyan-400 text-[9px] font-black uppercase tracking-widest block mb-0.5">Modo Foco</span><h2 className="text-lg font-black text-white leading-tight">{treinoSelecionado.title}</h2></div>
                <button onClick={() => { if(window.confirm("Sair do treino atual?")) setTreinoIniciado(false); }} className="text-[10px] text-red-500 font-black bg-red-500/10 px-4 py-2 rounded-xl uppercase tracking-widest border border-red-500/10">Sair</button>
              </div>

              <div className="flex flex-col gap-6 pt-2">
                {groupedTreinoSelecionado.map((group, idx) => {
                  const isMainDone = exerciciosFeitos.includes(group.main.id);
                  return (
                    <div key={group.main.id} className={`p-5 rounded-[2.5rem] border flex flex-col gap-4 transition-all duration-500 shadow-xl ${isMainDone ? 'bg-blue-600/10 border-blue-500/20' : 'bg-slate-800 border-slate-700'}`}>
                      <div className="flex items-center gap-4">
                        <button onClick={() => toggleDone(group.main.id)} className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${isMainDone ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'border-slate-600 text-slate-500 bg-slate-900'}`}>
                          {isMainDone ? <CheckCircle2 size={30} /> : <span className="font-black text-2xl">{idx + 1}</span>}
                        </button>
                        <div className="flex-1">
                          <h4 className={`font-black text-lg leading-tight ${isMainDone ? 'text-blue-500/50 line-through' : 'text-white'}`}>{group.main.name}</h4>
                          <div className="flex gap-2 text-[10px] mt-1 text-slate-500 font-black uppercase tracking-widest"><span>{group.main.sets}</span>{group.main.weight && <span>• {group.main.weight}</span>}</div>
                        </div>
                        
                        {/* BOTÃO YOUTUBE À PROVA DE FALHAS (EMBUTIDO) */}
                        <button 
                          onClick={async () => {
                            if (group.main.youtubeId) {
                              setVideoAtivo(group.main.youtubeId);
                            } else {
                              showToast("A procurar vídeo...");
                              const id = await buscarVideoNoYouTube(group.main.name);
                              if (id) {
                                setVideoAtivo(id);
                              } else {
                                // PLANO B SUPREMO: Pesquisa embutida dentro do Modal!
                                setVideoAtivo(`SEARCH:como fazer ${group.main.name} musculação execução`);
                              }
                            }
                          }} 
                          className={`p-3.5 rounded-2xl active:scale-90 transition-all ${group.main.youtubeId ? 'bg-red-600/10 text-red-500 border border-red-500/10' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-red-400'}`}
                        >
                          <Youtube size={22} />
                        </button>
                      </div>
                      
                      {group.partners.map((p: any) => {
                         const isPartnerDone = exerciciosFeitos.includes(p.id);
                         return (
                            <div key={p.id} className={`ml-4 pl-6 border-l-2 flex items-center gap-4 transition-all duration-300 ${isPartnerDone ? 'border-cyan-500/20' : 'border-cyan-500/50'}`}>
                                <button onClick={() => toggleDone(p.id)} className={`w-2 h-2 rounded-full ${isPartnerDone ? 'bg-cyan-500/30' : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'}`}></button>
                                <div className="flex-1">
                                    <h4 className={`font-black text-sm leading-tight ${isPartnerDone ? 'text-cyan-400/40 line-through' : 'text-cyan-400'}`}>{p.name}</h4>
                                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-0.5">{p.sets}</p>
                                </div>
                                
                                {/* BOTÃO YOUTUBE À PROVA DE FALHAS (BI-SET EMBUTIDO) */}
                                <button 
                                  onClick={async () => {
                                    if (p.youtubeId) {
                                      setVideoAtivo(p.youtubeId);
                                    } else {
                                      showToast("A procurar vídeo...");
                                      const id = await buscarVideoNoYouTube(p.name);
                                      if (id) {
                                        setVideoAtivo(id);
                                      } else {
                                        setVideoAtivo(`SEARCH:como fazer ${p.name} musculação execução`);
                                      }
                                    }
                                  }} 
                                  className={`p-2 rounded-xl active:scale-90 transition-all ${p.youtubeId ? 'text-red-500/80 bg-red-500/10' : 'text-slate-500 bg-slate-800/50 hover:text-red-400'}`}
                                >
                                  <Youtube size={18} />
                                </button>
                            </div>
                         );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pb-10">
                <button onClick={() => finalizarTreino(treinoSelecionado.title)} disabled={exerciciosFeitos.length < (treinoSelecionado.exercises?.length || 0)} className={`w-full py-6 rounded-[2rem] font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-3 ${exerciciosFeitos.length >= (treinoSelecionado.exercises?.length || 0) ? 'bg-blue-600 text-white active:scale-95' : 'bg-slate-800 text-slate-600'}`}>
                   {exerciciosFeitos.length >= (treinoSelecionado.exercises?.length || 0) ? <><Flame fill="currentColor"/> CONCLUIR 🔥</> : `Faltam ${(treinoSelecionado.exercises?.length || 0) - exerciciosFeitos.length} Blocos`}
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