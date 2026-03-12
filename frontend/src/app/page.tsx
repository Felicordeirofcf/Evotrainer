'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, LogOut, CheckCircle2, Flame, Play, 
  X, User as UserIcon, Plus, Activity, Dumbbell,
  Trash2, Ban, Unlock, Home, Calendar, List, AlertTriangle, Pencil, Link as LinkIcon, Lock, Camera, Save, Search,
  Download, Sparkles, Youtube, ChevronRight, ChevronLeft, MessageCircle, Crown, Check, ShieldAlert, Palette, Star, MessageSquare, Zap
} from 'lucide-react';

const getBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') return 'http://localhost:3001';
  return 'https://evotrainer.onrender.com';
};

const API_URL = getBaseUrl().endsWith('/') ? `${getBaseUrl()}api` : `${getBaseUrl()}/api`;
const MEU_DOMINIO = "https://evotrainer.com.br";

const extractYouTubeId = (url: string) => {
  if (!url) return '';
  if (url.length === 11 && !url.includes('http')) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
};

function getGroupedExercises(exercisesArray: any[]) {
  const grouped: any[] = [];
  const skipIndices = new Set(); 
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
}

const InstallBanner = ({ showInstallBanner, setShowInstallBanner, handleInstallClick, brandColor }: any) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone === true);
    setIsStandalone(checkStandalone);
    const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(checkIOS);
    const dismissed = localStorage.getItem('evotrainer_install_dismissed') === 'true';
    setIsDismissed(dismissed);
  }, []);

  if (isStandalone || isDismissed) return null;

  const dismissBanner = () => {
    setIsDismissed(true);
    setShowInstallBanner(false);
    localStorage.setItem('evotrainer_install_dismissed', 'true');
  };

  if (showInstallBanner && !isIOS) {
    return (
      <div className="fixed z-[110] p-4 rounded-2xl shadow-2xl flex items-center justify-between border animate-fade-in sm:max-w-sm sm:mx-auto bg-slate-900 border-slate-700 w-[calc(100%-2rem)] left-4 right-4" style={{ bottom: 'calc(max(env(safe-area-inset-bottom), 1rem) + 5rem)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl text-white shadow-lg" style={{ backgroundColor: brandColor || '#2563eb' }}><Download size={24} /></div>
          <div><p className="text-white font-black text-sm">Instalar App</p><p className="text-slate-400 text-[10px]">Acesso rápido na tela inicial!</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={dismissBanner} className="text-slate-500 p-2 hover:text-white transition-colors"><X size={18}/></button>
          <button onClick={handleInstallClick} className="text-white font-black px-4 py-2 rounded-xl text-xs shadow-lg active:scale-95 transition-transform uppercase" style={{ backgroundColor: brandColor || '#2563eb' }}>Instalar</button>
        </div>
      </div>
    );
  }

  if (isIOS && !showInstallBanner) {
    return (
      <div className="fixed z-[110] p-5 rounded-3xl shadow-2xl border animate-bounce sm:max-w-sm sm:mx-auto w-[calc(100%-2rem)] left-4 right-4" style={{ bottom: 'calc(max(env(safe-area-inset-bottom), 1rem) + 4rem)', backgroundColor: brandColor || '#2563eb', borderColor: 'rgba(255,255,255,0.2)' }}>
        <button onClick={dismissBanner} className="absolute top-2 right-2 text-white/50 hover:text-white p-1"><X size={16}/></button>
        <div className="flex flex-col items-center text-center gap-2">
          <div className="bg-white/20 p-2 rounded-xl text-white"><Download size={24} /></div>
          <h3 className="text-white font-black text-sm">Instale o App no iPhone</h3>
          <p className="text-white/90 text-xs font-medium leading-relaxed">
            1. Toque no ícone <strong>Compartilhar</strong> (quadrado com seta) abaixo.<br/>
            2. Role e selecione <strong>"Adicionar à Tela de Início"</strong>.
          </p>
          <div className="mt-2 text-white/50 animate-pulse">▼</div>
        </div>
      </div>
    );
  }

  return null;
};

const YoutubeModal = ({ videoAtivo, setVideoAtivo, brandColor }: any) => {
  if (!videoAtivo) return null;
  const iframeSrc = `https://www.youtube.com/embed/${videoAtivo}?autoplay=1&rel=0`;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[400] flex items-center justify-center p-4 animate-fade-in" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)', paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col relative">
        <div className="p-5 flex justify-between items-center border-b border-slate-800 bg-slate-950">
          <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2"><Youtube size={18} className="text-red-500"/> Execução Correta</h3>
          <button onClick={() => setVideoAtivo(null)} className="bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white p-2 rounded-xl transition-colors"><X size={20} /></button>
        </div>
        <div className="w-full aspect-video bg-black relative">
          <iframe className="w-full h-full absolute inset-0" src={iframeSrc} allowFullScreen allow="autoplay; fullscreen" loading="lazy"></iframe>
        </div>
        <div className="p-4 bg-slate-950">
          <button onClick={() => setVideoAtivo(null)} className="w-full py-4 text-slate-900 font-black rounded-2xl uppercase tracking-widest text-[10px] transition-colors shadow-lg active:scale-95" style={{ backgroundColor: brandColor || '#34d399' }}>
             Fechar Vídeo
          </button>
        </div>
      </div>
    </div>
  );
};

const TourModal = ({ showTour, setShowTour, tourStep, setTourStep }: any) => {
  if (!showTour) return null;

  const tourSteps = [
    { title: "Bem-vindo ao EvoTrainer! 🚀", text: "Vamos fazer um tour rápido para entender como escalar a sua consultoria e economizar horas.", icon: <Sparkles size={60} className="text-blue-500 mx-auto" /> },
    { title: "1. Gestão de Alunos 👥", text: "Na aba 'Alunos' cadastre seus clientes. Eles ganham acesso a um App Exclusivo para visualizar os treinos.", icon: <Users size={60} className="text-emerald-500 mx-auto" /> },
    { title: "2. Treino Inteligente 🧠", text: "Vá na aba 'Inteligência' e deixe a nossa IA gerar as fichas para você com periodização.", icon: <Activity size={60} className="text-indigo-500 mx-auto" /> },
    { title: "3. Vídeos Automáticos 📺", text: "Para cada exercício gerado, buscamos e anexamos o vídeo correto de execução diretamente do YouTube.", icon: <Youtube size={60} className="text-red-500 mx-auto" /> },
    { title: "Tudo Pronto! 🎉", text: "O sistema agora é seu. Comece adicionando o seu primeiro aluno ou testando a Inteligência Artificial.", icon: <CheckCircle2 size={60} className="text-blue-500 mx-auto" /> }
  ];

  const current = tourSteps[tourStep];

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[500] flex items-center justify-center p-6 animate-fade-in" style={{ paddingTop: 'max(env(safe-area-inset-top), 1.5rem)' }}>
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-sm text-center p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-5"><Sparkles size={200} /></div>
        <div className="relative z-10">
          <div className="mb-6 h-24 flex items-center justify-center">{current.icon}</div>
          <h3 className="text-xl font-black text-white mb-4 leading-tight">{current.title}</h3>
          <p className="text-slate-400 text-sm font-medium leading-relaxed min-h-[5rem]">{current.text}</p>
          <div className="flex justify-center gap-2 mt-8 mb-6">{tourSteps.map((_, i) => (<div key={i} className={`h-2 rounded-full transition-all ${i === tourStep ? 'w-8 bg-blue-600' : 'w-2 bg-slate-800'}`}></div>))}</div>
          <div className="flex gap-3">
            {tourStep > 0 && (<button onClick={() => setTourStep((prev: number) => prev - 1)} className="p-4 bg-slate-800 text-white rounded-2xl active:scale-95 transition-all"><ChevronLeft size={20}/></button>)}
            {tourStep < tourSteps.length - 1 ? (<button onClick={() => setTourStep((prev: number) => prev + 1)} className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all uppercase tracking-widest text-xs">Próximo <ChevronRight size={18}/></button>) : (<button onClick={() => setShowTour(false)} className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all uppercase tracking-widest text-xs">VAMOS LÁ! <Flame size={18}/></button>)}
          </div>
          <button onClick={() => setShowTour(false)} className="mt-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-slate-300">Pular Tour</button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null); 
  const [token, setToken] = useState<string | null>(null);
  const [currentBrand, setCurrentBrand] = useState<any>(null); 
  const [loginBrand, setLoginBrand] = useState<any>(null); 
  
  const [sysConfig, setSysConfig] = useState<any>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const [authMode, setAuthMode] = useState<'LOGIN'|'SIGNUP'|'MASTER'|'FORGOT'|'RESET'>('LOGIN');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState(''); 
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  
  const [masterSecret, setMasterSecret] = useState(''); 
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [resetTokenUrl, setResetTokenUrl] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const [alunos, setAlunos] = useState<any[]>([]);
  const [buscaAluno, setBuscaAluno] = useState(''); 
  const [showAddModal, setShowAddModal] = useState(false);
  const [novoAluno, setNovoAluno] = useState({ name: '', email: '', password: '', phone: '' });
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

  const [trainers, setTrainers] = useState<any[]>([]);
  const [buscaTrainer, setBuscaTrainer] = useState('');
  const [filtroPlano, setFiltroPlano] = useState('TODOS');

  const [iaPrompt, setIaPrompt] = useState('');
  const [iaAlunoId, setIaAlunoId] = useState('');
  const [iaSplit, setIaSplit] = useState('ABC');
  const [iaFrequencia, setIaFrequencia] = useState('5');
  const [iaVolume, setIaVolume] = useState('7');
  const [iaMethodology, setIaMethodology] = useState('Tradicional, Progressão de Carga Constante');
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);

  const [treinosAluno, setTreinosAluno] = useState<any[]>([]);
  const [treinoIniciado, setTreinoIniciado] = useState(false);
  const [exerciciosFeitos, setExerciciosFeitos] = useState<number[]>([]);
  const [videoAtivo, setVideoAtivo] = useState<string | null>(null);
  const [alunoTabAtiva, setAlunoTabAtiva] = useState('home'); 
  const diasCompletos = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const diasCurtos = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const [diaAtivo, setDiaAtivo] = useState(diasCompletos[new Date().getDay()]);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', age: '', weight: '', height: '', goal: 'Hipertrofia', notes: '', avatar: '', brandName: '', brandColor: '#2563eb', brandLogo: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [currentHistoryId, setCurrentHistoryId] = useState<number | null>(null);

  const showToast = (msg: any) => {
    let textMessage = typeof msg === 'string' ? msg : (msg?.error || msg?.message || "Erro inesperado.");
    setToastMsg(textMessage);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const getAuthHeaders = () => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  // ==========================================
  // FUNÇÃO: PERGUNTAR E ENVIAR WHATSAPP PÓS-TREINO
  // ==========================================
  const enviarAvisoWhatsAppPosTreino = (nomeTreino: string, aluno: any) => {
    if (window.confirm(`Planilha "${nomeTreino}" salva com sucesso! Deseja enviar um aviso para o WhatsApp do aluno?`)) {
      let telefone = aluno.phone || '';
      telefone = telefone.replace(/\D/g, ''); 
      if (telefone && !telefone.startsWith('55')) telefone = '55' + telefone;

      const appLink = currentUser?.plano === 'ELITE' ? `${MEU_DOMINIO}/?t=${currentUser.id}` : MEU_DOMINIO;
      const mensagem = `Fala ${aluno.name.split(' ')[0]}! 💪\n\nEstou encaminhando uma nova planilha de treinos para você: *${nomeTreino}*.\n\nVerifique o seu app para conferir os vídeos e focar na execução correta:\n${appLink}`;

      const url = telefone && telefone.length >= 12 
        ? `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`
        : `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

      window.open(url, '_blank');
    }
  };

  // BOTÃO INFALÍVEL DO YOUTUBE RESTAURADO!
  const openVideo = (youtubeId: string, name: string) => {
    if (youtubeId && youtubeId.trim() !== '') {
      setVideoAtivo(youtubeId);
    } else {
      showToast("A procurar no YouTube...");
      const query = `como fazer ${name} musculação execução correta`;
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/config`)
      .then(res => res.json())
      .then(data => setSysConfig(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tokenUrl = params.get('token');
      if (tokenUrl) { setResetTokenUrl(tokenUrl); setAuthMode('RESET'); }

      const trainerQueryId = params.get('t');
      if (trainerQueryId && !currentUser) {
        fetch(`${API_URL}/brand/${trainerQueryId}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => data && setLoginBrand(data))
          .catch(() => {});
      }
    }
  }, [currentUser]);

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
    const savedBrand = localStorage.getItem('treino_ai_brand');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try { setCurrentUser(JSON.parse(savedUser)); } catch (e) { setCurrentUser(null); }
      if (savedBrand) { try { setCurrentBrand(JSON.parse(savedBrand)); } catch (e) { setCurrentBrand(null); } }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '', email: currentUser.email || '', phone: currentUser.phone || '',
        age: currentUser.age || '', weight: currentUser.weight || '', height: currentUser.height || '',
        goal: currentUser.goal || 'Hipertrofia', notes: currentUser.notes || '', avatar: currentUser.avatar || '',
        brandName: currentUser.brandName || '', brandColor: currentUser.brandColor || '#2563eb', brandLogo: currentUser.brandLogo || ''
      });
      if (currentUser.role === 'ADMIN' && localStorage.getItem('evotrainer_tour_pending') === 'true') {
        setShowTour(true);
        localStorage.removeItem('evotrainer_tour_pending');
      }
    }
  }, [currentUser]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>, isBrandLogo = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return showToast("A imagem excede 3MB.");
    
    showToast("A guardar imagem...");
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const payload = isBrandLogo ? { brandLogo: base64String } : { avatar: base64String };
      const updatedProfileForm = { ...profileForm, ...payload };
      setProfileForm(updatedProfileForm);
      setCurrentUser({ ...currentUser, ...payload });

      try {
        const res = await fetch(`${API_URL}/alunos/${currentUser.id}/perfil`, {
          method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(updatedProfileForm)
        });
        if (res.ok) {
          const updatedUser = await res.json();
          setCurrentUser(updatedUser);
          localStorage.setItem('treino_ai_user', JSON.stringify(updatedUser));
          if(isBrandLogo && currentUser.plano === 'ELITE') {
            const newBrand = { name: updatedUser.brandName, color: updatedUser.brandColor, logo: updatedUser.brandLogo };
            setCurrentBrand(newBrand);
            localStorage.setItem('treino_ai_brand', JSON.stringify(newBrand));
          }
          showToast("Imagem atualizada!");
        }
      } catch (error) { showToast("Erro ao guardar imagem."); }
    };
    reader.readAsDataURL(file);
  };

  const exportarTreinoPDF = (treino: any, aluno: any, isStudent = false) => {
    const agrupados = getGroupedExercises(treino.exercises);
    let tableHTML = `
      <table>
        <thead>
          <tr>
            <th style="width: 5%; text-align: center;">#</th>
            <th style="width: 40%; text-align: left;">Exercício</th>
            <th style="width: 15%; text-align: center;">Séries</th>
            <th style="width: 20%; text-align: center;">Carga/RPE</th>
            <th style="width: 20%; text-align: center;">Vídeo</th>
          </tr>
        </thead>
        <tbody>
    `;

    const pdfBrandColor = currentBrand?.color || '#2563eb';
    const pdfBrandName = currentBrand?.name || 'EVOTRAINER';

    agrupados.forEach((group: any, index: number) => {
       const bgColor = index % 2 === 0 ? '#f9fafb' : '#ffffff';
       const videoUrl = group.main.youtubeId ? `https://youtu.be/${group.main.youtubeId}` : `https://www.youtube.com/results?search_query=${encodeURIComponent('como fazer ' + group.main.name + ' musculação execução')}`;
       const videoLink = group.main.youtubeId 
          ? `<a href="${videoUrl}" target="_blank" style="display: inline-block; background-color: #fee2e2; color: #dc2626; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold; border: 1px solid #fca5a5;">▶ Assistir</a>` 
          : `<a href="${videoUrl}" target="_blank" style="display: inline-block; background-color: #f1f5f9; color: #475569; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold; border: 1px solid #cbd5e1;">🔍 Buscar</a>`;

       tableHTML += `
          <tr style="background-color: ${bgColor};">
            <td style="text-align: center; font-weight: 800; color: ${pdfBrandColor};">${index + 1}</td>
            <td style="font-weight: 700; color: #1e293b;">${group.main.name}</td>
            <td style="text-align: center;"><span class="set-badge">${group.main.sets}</span></td>
            <td style="text-align: center; color: #64748b;">${group.main.weight || '-'}</td>
            <td style="text-align: center;">${videoLink}</td>
          </tr>
       `;

       group.partners.forEach((p: any) => {
         const pVideoUrl = p.youtubeId ? `https://youtu.be/${p.youtubeId}` : `https://www.youtube.com/results?search_query=${encodeURIComponent('como fazer ' + p.name + ' musculação execução')}`;
         const pVideoLink = p.youtubeId 
            ? `<a href="${pVideoUrl}" target="_blank" style="display: inline-block; background-color: #fee2e2; color: #dc2626; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold; border: 1px solid #fca5a5;">▶ Assistir</a>` 
            : `<a href="${pVideoUrl}" target="_blank" style="display: inline-block; background-color: #f1f5f9; color: #475569; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold; border: 1px solid #cbd5e1;">🔍 Buscar</a>`;

         tableHTML += `
            <tr style="background-color: ${bgColor};" class="conjugado-row">
              <td style="text-align: center; color: #94a3b8; font-weight: 800; font-size: 16px;">↳</td>
              <td style="padding-left: 20px; color: #475569;">${p.name}</td>
              <td style="text-align: center;"><span class="set-badge">${p.sets}</span></td>
              <td style="text-align: center; color: #64748b;">${p.weight || '-'}</td>
              <td style="text-align: center;">${pVideoLink}</td>
            </tr>
         `;
       });
    });

    tableHTML += `</tbody></table>`;
    const geradoPor = isStudent ? `Gerado via ${pdfBrandName} App` : `Personal: ${currentUser?.name || 'Treinador'}`;
    const logoHtml = currentBrand?.logo 
       ? `<img src="${currentBrand.logo}" style="max-height: 50px; max-width: 150px; object-fit: contain;" alt="${pdfBrandName}"/>`
       : `<h1 class="logo" style="color: ${pdfBrandColor};">${pdfBrandName}</h1>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Treino_${aluno.name.split(' ')[0]}_${treino.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; background: #fff;}
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 32px; }
            .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; margin: 0 0 16px 0; }
            .student-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 0 0 4px 0; }
            .student-name { font-size: 24px; font-weight: 800; margin: 0; color: #0f172a;}
            .meta-box { text-align: right; }
            .badge { display: inline-block; background: ${pdfBrandColor}; color: #fff; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-bottom: 8px; }
            .meta-info { color: #64748b; font-size: 14px; margin: 0; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f8fafc; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 11px; padding: 16px 12px; border-bottom: 2px solid #e2e8f0; }
            td { padding: 16px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .set-badge { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 12px; color: #334155; }
            .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 24px; }
            .print-alert { background: #eff6ff; border-left: 4px solid ${pdfBrandColor}; color: #1e3a8a; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 30px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);}
            .close-btn { display: block; margin-bottom: 20px; padding: 12px 20px; background: #f1f5f9; color: #0f172a; border-radius: 12px; text-align: center; font-weight: 800; font-size: 14px; cursor: pointer; border: 2px solid #e2e8f0; width: 100%; box-sizing: border-box; transition: all 0.2s; text-transform: uppercase; letter-spacing: 1px;}
            .close-btn:active { background: #e2e8f0; transform: scale(0.98); }
            @media print {
              .print-alert, .close-btn { display: none; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0; }
              * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
              a { text-decoration: none !important; }
            }
            @media (max-width: 600px) {
              body { padding: 20px; }
              .header { flex-direction: column; gap: 20px; }
              .meta-box { text-align: left; }
            }
          </style>
        </head>
        <body>
          <button class="close-btn" onclick="window.close()">← Voltar ao App</button>
          <div class="print-alert">
            ℹ️ Na janela de impressão, escolha a opção <strong>"Guardar como PDF"</strong> para baixar a sua ficha. <strong>Os botões de vídeo continuarão a funcionar no PDF!</strong>
          </div>
          <div class="header">
            <div>
              ${logoHtml}
              <p class="student-title">Ficha de Treino de</p>
              <h2 class="student-name">${aluno.name}</h2>
            </div>
            <div class="meta-box">
              <div class="badge">${treino.dayOfWeek} - ${treino.title}</div>
              <p class="meta-info">Duração estimada: <strong>${treino.duration}</strong></p>
            </div>
          </div>
          ${tableHTML}
          <div class="footer">${geradoPor}</div>
          <script>window.onload = () => { setTimeout(() => { window.print(); }, 800); }</script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if(!printWindow) { showToast("Permita pop-ups no seu navegador para gerar o PDF."); return; }
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const enviarTreinoWhatsApp = (treino: any, aluno: any) => {
    let telefone = aluno.phone || '';
    telefone = telefone.replace(/\D/g, ''); 
    if (telefone && !telefone.startsWith('55')) telefone = '55' + telefone;

    const brandNameMsg = currentBrand?.name || 'EvoTrainer';
    const appLink = currentUser?.plano === 'ELITE' ? `${MEU_DOMINIO}/?t=${currentUser.id}` : MEU_DOMINIO;

    const mensagem = `Olá *${aluno.name.split(' ')[0]}*! 💪\n\nA sua nova ficha de treino *${treino.title}* já está configurada.\n\n⏱ *Duração:* ${treino.duration}\n📅 *Dia:* ${treino.dayOfWeek}\n\nAceda ao seu App ${brandNameMsg} para ver os vídeos de execução perfeitos:\n${appLink}\n\nBora esmagar! 🔥`;

    const url = telefone && telefone.length >= 12 
      ? `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`
      : `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

    window.open(url, '_blank');
  };

  const salvarConfiguracoesGlobais = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const res = await fetch(`${API_URL}/config`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(sysConfig) });
      if (res.ok) {
        showToast("Ofertas e preços atualizados no sistema todo!");
      }
    } catch (e) { showToast("Erro ao guardar ofertas."); } finally { setIsSavingConfig(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return showToast("Preencha todos os campos.");
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token); setCurrentUser(data.user);
        localStorage.setItem('treino_ai_token', data.token);
        localStorage.setItem('treino_ai_user', JSON.stringify(data.user));
        if (data.brand) {
          setCurrentBrand(data.brand);
          localStorage.setItem('treino_ai_brand', JSON.stringify(data.brand));
        } else {
          setCurrentBrand(null); localStorage.removeItem('treino_ai_brand');
        }
        setLoginPassword(''); showToast("Bem-vindo!");
      } else { showToast(data.error || "Erro no login."); }
    } catch (error) { showToast(`Erro ao ligar com o servidor.`); } finally { setIsLoggingIn(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword || (!signupPhone && authMode !== 'MASTER')) return showToast("Preencha todos os campos, incluindo o WhatsApp.");
    if (signupPassword !== signupConfirmPassword) return showToast("As senhas não coincidem!");
    setIsSigningUp(true);

    if (authMode === 'MASTER') {
      if (masterSecret !== "evotrainer2026") { showToast("Chave mestra inválida!"); setIsSigningUp(false); return; }
      try {
        const res = await fetch(`${API_URL}/setup-master`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword, phone: signupPhone, secret_key: masterSecret })
        });
        const data = await res.json();
        if (res.ok) {
          showToast("Conta Master criada! Faça login.");
          setAuthMode('LOGIN'); setSignupName(''); setSignupEmail(''); setSignupPhone(''); setSignupPassword(''); setSignupConfirmPassword('');
        } else { showToast(data.error || "Erro ao criar conta."); }
      } catch (error) { showToast(`Erro ao ligar com o servidor.`); } finally { setIsSigningUp(false); }
      return;
    }

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword, phone: signupPhone, role: 'ADMIN', plano: 'GRATIS' })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token); setCurrentUser(data.user);
        localStorage.setItem('treino_ai_token', data.token);
        localStorage.setItem('treino_ai_user', JSON.stringify(data.user));
        localStorage.setItem('evotrainer_tour_pending', 'true');
        setSignupName(''); setSignupEmail(''); setSignupPhone(''); setSignupPassword(''); setSignupConfirmPassword('');
        showToast("Bem-vindo ao EvoTrainer!");
      } else { showToast(data.error || "Erro ao criar conta."); }
    } catch (error) { showToast(`Erro ao ligar com o servidor.`); } finally { setIsSigningUp(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return showToast("Digite o seu e-mail.");
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_URL}/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: loginEmail }) });
      const data = await res.json();
      showToast(data.message || data.error);
      if(res.ok) setAuthMode('LOGIN');
    } catch (error) { showToast("Erro de ligação."); } finally { setIsLoggingIn(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetNewPassword) return showToast("Digite a nova palavra-passe.");
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_URL}/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: resetTokenUrl, newPassword: resetNewPassword }) });
      const data = await res.json();
      showToast(data.message || data.error);
      if(res.ok) {
        setAuthMode('LOGIN');
        if(typeof window !== 'undefined') window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (error) { showToast("Erro de ligação."); } finally { setIsLoggingIn(false); }
  };

  const handleLogout = () => {
    setCurrentUser(null); setToken(null); setCurrentBrand(null); setLoginBrand(null);
    localStorage.clear(); setTreinoIniciado(false);
  };

  const fetchTrainers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/superadmin/trainers`, { headers: getAuthHeaders() });
      if (res.ok) setTrainers(await res.json());
    } catch (e) {} finally { setIsLoading(false); }
  };

  const alterarPlanoTrainer = async (trainerId: number, novoPlano: string) => {
    try {
      const res = await fetch(`${API_URL}/superadmin/trainers/${trainerId}/plano`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ plano: novoPlano }) });
      if (res.ok) { showToast("Plano atualizado!"); fetchTrainers(); }
    } catch (e) { showToast("Erro ao alterar plano."); }
  };

  const excluirTrainer = async (trainerId: number, name: string) => {
    if (!window.confirm(`ATENÇÃO: Apagar o Personal "${name}" e todos os alunos/fichas?`)) return;
    try {
      const res = await fetch(`${API_URL}/superadmin/trainers/${trainerId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) { showToast("Personal apagado."); fetchTrainers(); }
    } catch (e) { showToast("Erro."); }
  };

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
      if (res.ok) { showToast("Aluno registado! E-mail com instruções enviado."); setShowAddModal(false); setNovoAluno({ name: '', email: '', password: '', phone: '' }); fetchAlunos(); }
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
    if (!window.confirm(`Apagar o aluno "${nome}" e o seu histórico?`)) return;
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
    setIsCriandoTreino(true); showToast("A guardar ficha...");
    try {
      const exercisesComVideos = novoTreino.exercises.map(ex => ({
          ...ex,
          youtubeId: ex.youtubeId ? extractYouTubeId(ex.youtubeId) : ''
      }));
      const payload = { ...novoTreino, exercises: exercisesComVideos, userId: alunoSelecionado.id };
      const url = isEditingTreino ? `${API_URL}/treinos/${treinoEditId}` : `${API_URL}/treinos`;
      const metodo = isEditingTreino ? 'PUT' : 'POST';
      const res = await fetch(url, { method: metodo, headers: getAuthHeaders(), body: JSON.stringify(payload) });
      if (res.ok) {
        setShowTreinoModal(false); 
        fetchAlunos();
        
        enviarAvisoWhatsAppPosTreino(isEditingTreino ? novoTreino.title : "Nova Ficha", alunoSelecionado);
        
        setAlunoSelecionado(null); setIsEditingTreino(false); setTreinoEditId(null);
        setNovoTreino({ title: '', duration: '', dayOfWeek: 'Segunda', exercises: [{ name: '', sets: '', weight: '', youtubeId: '', isConjugado: false, conjugadoCom: '' }] });
      }
    } catch (e) { showToast("Erro ao guardar."); } finally { setIsCriandoTreino(false); }
  };

  const confirmarExclusao = (workoutId: number, title: string) => { setTreinoParaExcluir({ id: workoutId, title: title }); setShowDeleteModal(true); };
  
  // FIX: Apaga a ficha da lista instantaneamente após o OK do servidor
  const executarExclusaoTreino = async () => {
    if (!treinoParaExcluir) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/treinos/${treinoParaExcluir.id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) { 
        showToast("Apagado!"); 
        if (alunoSelecionado) {
          setAlunoSelecionado({
            ...alunoSelecionado,
            workouts: alunoSelecionado.workouts.filter((w: any) => w.id !== treinoParaExcluir.id)
          });
        }
        fetchAlunos(); 
        setShowDeleteModal(false); 
        setTreinoParaExcluir(null); 
      }
    } catch (e) {} finally { setIsDeleting(false); }
  };

  const gerarTreinoInteligente = async () => {
    setIsGeneratingIA(true);
    if (!iaAlunoId) { showToast("Selecione um aluno primeiro."); setIsGeneratingIA(false); return; }
    
    const alunoBuscado = alunos.find(a => a.id === parseInt(iaAlunoId));
    
    try {
      showToast("A IA Master está a analisar a biomecânica...");
      const payload = {
        alunoId: iaAlunoId,
        split: iaSplit,
        frequencia: iaFrequencia,
        prompt: iaPrompt,
        volume: iaVolume,
        metodologia: iaMethodology
      };

      const response = await fetch(`${API_URL}/ai/gerar-treino`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao gerar treino com IA.");
      
      showToast("Fichas criadas pela IA!"); 
      await fetchAlunos(); 
      setAdminTabAtiva('alunos');
      
      if (alunoBuscado) {
        enviarAvisoWhatsAppPosTreino("Periodização Completa via IA", alunoBuscado);
      }
      
      setIaPrompt('');
    } catch (err: any) { showToast(err.message); } finally { setIsGeneratingIA(false); }
  };

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
        setCurrentHistoryId(result.historyId);
        setShowFeedbackModal(true);
      }
    } catch (e) { showToast("Erro ao guardar o treino."); }
  };

  const fecharTreino = () => {
    setShowFeedbackModal(false);
    setTreinoIniciado(false);
    setExerciciosFeitos([]);
    setAlunoTabAtiva('home');
    setFeedbackComment('');
    setFeedbackRating(5);
    setCurrentHistoryId(null);
  };

  const enviarFeedback = async () => {
    if (!currentHistoryId) {
      fecharTreino();
      return;
    }
    try {
      await fetch(`${API_URL}/treinos/feedback`, {
        method: 'POST', 
        headers: getAuthHeaders(),
        body: JSON.stringify({ historyId: currentHistoryId, rating: feedbackRating, comment: feedbackComment })
      });
      showToast("Feedback enviado com sucesso! 🔥");
      fecharTreino();
    } catch (e) { 
      showToast("Erro ao enviar feedback."); 
      fecharTreino();
    }
  };

  const salvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/alunos/${currentUser.id}/perfil`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(profileForm) });
      if (res.ok) {
        const up = await res.json(); setCurrentUser(up); localStorage.setItem('treino_ai_user', JSON.stringify(up)); showToast("Perfil salvo!");
        if(currentUser.role === 'ADMIN' && currentUser.plano === 'ELITE') {
           const newBrand = { name: profileForm.brandName, color: profileForm.brandColor, logo: profileForm.brandLogo };
           setCurrentBrand(newBrand);
           localStorage.setItem('treino_ai_brand', JSON.stringify(newBrand));
        }
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
    if (currentUser?.role === 'SUPERADMIN') fetchTrainers();
    if (currentUser?.role === 'ADMIN') fetchAlunos();
    if (currentUser?.role === 'STUDENT') fetchTreinosAluno();
  }, [currentUser]);

  const alunosFiltrados = alunos.filter(a => a.name.toLowerCase().includes(buscaAluno.toLowerCase()) || a.email.toLowerCase().includes(buscaAluno.toLowerCase()));
  const trainersFiltrados = trainers.filter(t => {
    const nomeBate = t.name.toLowerCase().includes(buscaTrainer.toLowerCase()) || t.email.toLowerCase().includes(buscaTrainer.toLowerCase());
    if (filtroPlano === 'TODOS') return nomeBate;
    return nomeBate && t.plano === filtroPlano;
  });

  const updateExercise = (i: number, f: string, v: any) => { const n = [...novoTreino.exercises]; n[i] = { ...n[i], [f]: v }; setNovoTreino({...novoTreino, exercises: n}); };
  const removerExercicio = (i: number) => { const n = [...novoTreino.exercises]; const r = n[i].name; n.splice(i, 1); n.forEach(ex => { if (ex.conjugadoCom === r) { ex.isConjugado = false; ex.conjugadoCom = ''; } }); setNovoTreino({...novoTreino, exercises: n}); };
  const toggleConjugado = (i: number) => { const n = [...novoTreino.exercises]; n[i].isConjugado = !n[i].isConjugado; if(!n[i].isConjugado) n[i].conjugadoCom = ''; setNovoTreino({ ...novoTreino, exercises: n }); };
  const toggleDone = (id: number) => { if (exerciciosFeitos.includes(id)) setExerciciosFeitos(exerciciosFeitos.filter(i => i !== id)); else setExerciciosFeitos([...exerciciosFeitos, id]); };

  const primaryColor = currentBrand?.color || '#2563eb'; 
  const brandName = currentBrand?.name || 'EVOTRAINER';
  const getBrandStyle = (type: 'bg' | 'text' | 'border') => {
    if(!currentBrand?.color) return {};
    if(type === 'bg') return { backgroundColor: currentBrand.color };
    if(type === 'text') return { color: currentBrand.color };
    if(type === 'border') return { borderColor: currentBrand.color };
    return {};
  }
  
  const loginColor = loginBrand?.color || '#2563eb';
  const getLoginBrandStyle = (type: 'bg' | 'text' | 'border') => {
    if(!loginBrand?.color) return {};
    if(type === 'bg') return { backgroundColor: loginBrand.color };
    if(type === 'text') return { color: loginBrand.color };
    if(type === 'border') return { borderColor: loginBrand.color };
    return {};
  }

  // ==================== RENDERIZAÇÃO: LOGIN ====================
  if (!currentUser) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-50 relative overflow-hidden">
        <div className="absolute top-20 right-[-10%] w-[300px] h-[300px] blur-[100px] rounded-full pointer-events-none opacity-20" style={getLoginBrandStyle('bg')}></div>
        <div className="absolute bottom-0 left-[-10%] w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        {toastMsg && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[300] text-white font-bold px-4 py-2 rounded-full shadow-lg text-sm whitespace-nowrap animate-fade-in" style={{...getLoginBrandStyle('bg'), backgroundColor: loginBrand?.color || '#2563eb' }}>{toastMsg}</div>}

        {!loginBrand && (
           <button onClick={() => setAuthMode('MASTER')} className="absolute top-4 right-4 text-slate-800 hover:text-slate-600 transition-colors" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
              <ShieldAlert size={20} />
           </button>
        )}

        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-[3rem] shadow-2xl animate-fade-in text-center relative z-10">
          <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-lg overflow-hidden border-2" style={{...getLoginBrandStyle('bg'), borderColor: `${loginColor}50`, backgroundColor: `${loginColor}20` }}>
            {loginBrand?.logo ? <img src={loginBrand.logo} alt="Logo" className="w-full h-full object-cover" /> : <Dumbbell size={40} style={getLoginBrandStyle('text')} />}
          </div>
          
          <h1 className="text-3xl font-black mb-2 tracking-tighter" style={loginBrand ? getLoginBrandStyle('text') : {}}>
             {loginBrand ? loginBrand.name : <>EVO<span className="text-blue-500">TRAINER</span></>}
          </h1>
          
          <p className="text-slate-400 text-xs mb-8 font-medium">
            {authMode === 'MASTER' && 'Abertura de Conta Mestre'}
            {authMode === 'LOGIN' && 'Acesso ao Sistema'}
            {authMode === 'SIGNUP' && 'Crie sua conta'}
            {authMode === 'FORGOT' && 'Recuperação de Palavra-Passe'}
            {authMode === 'RESET' && 'Criar Nova Palavra-Passe'}
          </p>

          {authMode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="email" required placeholder="Seu E-mail" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none transition-colors" style={{ outlineColor: loginColor }} />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="password" required placeholder="Sua Senha" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none transition-colors" style={{ outlineColor: loginColor }} />
              </div>
              <div className="text-right">
                <button type="button" onClick={() => setAuthMode('FORGOT')} className="text-[10px] text-slate-500 hover:text-white font-bold uppercase tracking-widest transition-colors">Esqueci a Senha</button>
              </div>
              <button type="submit" disabled={isLoggingIn} className="w-full mt-4 text-white font-black text-sm py-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all tracking-widest uppercase" style={{ backgroundColor: loginColor, boxShadow: `0 10px 25px -5px ${loginColor}60` }}>
                {isLoggingIn ? <Activity className="animate-spin" /> : 'ENTRAR NA CONTA'}
              </button>
            </form>
          )}

          {authMode === 'SIGNUP' && (
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
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xs px-1">📞</span>
                <input type="tel" required placeholder="WhatsApp (DDD + Número)" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-blue-500 transition-colors" />
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

          {authMode === 'MASTER' && (
             <form onSubmit={handleSignup} className="space-y-3">
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="text" required placeholder="Nome do Mestre" value={signupName} onChange={(e) => setSignupName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-red-500 transition-colors" />
              </div>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="email" required placeholder="E-mail Administrativo" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-red-500 transition-colors" />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xs px-1">📞</span>
                <input type="tel" required placeholder="Telefone de Recuperação" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-red-500 transition-colors" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="password" required placeholder="Crie uma Senha Forte" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-red-500 transition-colors" />
              </div>
              <div className="relative pt-2">
                 <Lock className="absolute left-4 top-1/2 -translate-y-0 text-red-500 w-5 h-5" />
                 <input type="password" required placeholder="Chave Secreta" value={masterSecret} onChange={(e) => setMasterSecret(e.target.value)} className="w-full bg-red-950/20 border border-red-800/50 rounded-2xl p-4 pl-12 text-red-400 focus:outline-none focus:border-red-500 transition-colors font-bold" />
              </div>
              <button type="submit" disabled={isSigningUp} className="w-full mt-2 bg-red-600 hover:bg-red-500 text-white font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                {isSigningUp ? <Activity className="animate-spin" /> : 'CRIAR MASTER'}
              </button>
             </form>
          )}

          {authMode === 'FORGOT' && (
             <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-slate-400 mb-4">Insira o seu e-mail para receber um link de recuperação mágico.</p>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="email" required placeholder="O seu E-mail" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <button type="submit" disabled={isLoggingIn} className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50">
                {isLoggingIn ? <Activity className="animate-spin" /> : 'ENVIAR LINK'}
              </button>
             </form>
          )}

          {authMode === 'RESET' && (
             <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5" />
                <input type="password" required placeholder="Nova Palavra-Passe" value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)} className="w-full bg-slate-950 border border-emerald-500/50 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <button type="submit" disabled={isLoggingIn} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                {isLoggingIn ? <Activity className="animate-spin" /> : 'SALVAR E ENTRAR'}
              </button>
             </form>
          )}

          <div className="mt-6 flex flex-col gap-2 text-center w-full">
            {!loginBrand && (authMode === 'LOGIN' || authMode === 'SIGNUP' || authMode === 'MASTER') && (
              <button onClick={() => setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors w-full p-2">
                {authMode === 'LOGIN' ? "Novo por aqui? Crie sua conta." : "Já tem conta? Faça Login."}
              </button>
            )}
            {(authMode === 'FORGOT' || authMode === 'RESET') && (
              <button onClick={() => setAuthMode('LOGIN')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors w-full p-2">
                Lembrou-se? Voltar ao Login.
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDERIZAÇÃO: SUPERADMIN ====================
  if (currentUser.role === 'SUPERADMIN') {
    return (
      <div className="min-h-[100dvh] bg-slate-950 flex flex-col text-slate-50 relative">
        <div className="w-full flex-1 flex flex-col md:max-w-7xl mx-auto relative bg-slate-900 md:bg-transparent">
          {toastMsg && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[300] bg-emerald-600 text-white font-bold px-4 py-2 rounded-full shadow-lg text-sm whitespace-nowrap animate-fade-in">{toastMsg}</div>}
          
          <header className="px-6 pb-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10 shadow-sm shrink-0 md:rounded-b-[2rem]" style={{ paddingTop: 'max(env(safe-area-inset-top), 1.5rem)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                <ShieldAlert size={24} className="text-white"/>
              </div>
              <div>
                <h1 className="text-xl font-black text-white leading-tight">MASTER</h1>
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-0.5">Dono do Sistema</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white bg-slate-800 p-2.5 rounded-xl transition-colors"><LogOut size={18} /></button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-36 md:pb-40 custom-scrollbar">
            
            {adminTabAtiva === 'alunos' && (
              <div className="animate-fade-in">
                <div className="flex flex-col gap-4 mb-6">
                  <div className="grid grid-cols-2 gap-3 md:gap-6">
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center shadow-inner">
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Total de Personais</p>
                      <p className="text-2xl font-black text-blue-400">{trainers.length}</p>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center shadow-inner">
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Clientes Pagantes</p>
                      <p className="text-2xl font-black text-emerald-400">{trainers.filter(t => t.plano !== 'GRATIS').length}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <input type="text" placeholder="Procurar personal..." value={buscaTrainer} onChange={(e) => setBuscaTrainer(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-9 pr-3 text-white text-xs outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <select value={filtroPlano} onChange={e => setFiltroPlano(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl px-3 text-white text-xs outline-none focus:border-blue-500 font-bold">
                      <option value="TODOS">Todos</option><option value="GRATIS">Grátis</option><option value="START">Start</option><option value="PRO">Pro</option><option value="ELITE">Elite</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoading ? <div className="col-span-full text-center py-8"><Activity className="animate-spin w-8 h-8 text-red-500 mx-auto"/></div> : 
                   trainersFiltrados.length === 0 ? <p className="col-span-full text-center text-slate-500 py-8 font-bold text-xs border-2 border-dashed border-slate-800 rounded-2xl">Nenhum Personal encontrado.</p> : (
                    trainersFiltrados.map(t => (
                      <div key={t.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-900 border border-slate-700 text-blue-500 font-black rounded-lg flex items-center justify-center shadow-inner">{t.name.charAt(0).toUpperCase()}</div>
                            <div>
                              <p className="font-black text-white text-sm leading-tight">{t.name}</p>
                              <p className="text-[9px] text-slate-500 mt-0.5">{t.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${t.plano === 'GRATIS' ? 'bg-slate-800 text-slate-400' : 'bg-amber-500/20 text-amber-500 border border-amber-500/20'}`}>{t.plano}</span>
                        </div>

                        <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800/50">
                          <p className="text-[10px] text-slate-400 font-bold">Alunos Registados:</p>
                          <p className="text-sm font-black text-cyan-400">{t._count?.alunos || 0}</p>
                        </div>

                        <div className="flex gap-2">
                          <select 
                            value={t.plano} 
                            onChange={(e) => alterarPlanoTrainer(t.id, e.target.value)}
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-[10px] font-bold outline-none"
                          >
                            <option value="GRATIS">GRÁTIS</option>
                            <option value="START">START</option>
                            <option value="PRO">PRO</option>
                            <option value="ELITE">ELITE</option>
                          </select>
                          <button onClick={() => excluirTrainer(t.id, t.name)} className="p-2.5 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* NOVA ABA: OFERTAS E PREÇOS */}
            {adminTabAtiva === 'ofertas' && sysConfig && (
              <div className="animate-fade-in flex flex-col gap-6 md:max-w-3xl mx-auto w-full">
                 <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-[2rem] shadow-lg relative overflow-hidden">
                   <h2 className="text-xl font-black text-white relative z-10 flex items-center gap-2"><Zap /> Central de Promoções</h2>
                   <p className="text-xs text-white/80 mt-2 relative z-10">Ao alterar aqui, os preços da Landing Page e do App são atualizados na hora.</p>
                   <Flame size={100} className="absolute -bottom-4 -right-4 opacity-20"/>
                 </div>

                 <form onSubmit={salvarConfiguracoesGlobais} className="space-y-6">
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
                       <label className="flex items-center gap-3 cursor-pointer bg-slate-900 p-4 rounded-xl border border-slate-700">
                         <input type="checkbox" checked={sysConfig.promoActive} onChange={e=>setSysConfig({...sysConfig, promoActive: e.target.checked})} className="w-5 h-5 accent-red-500" />
                         <span className="font-black text-sm text-white">Ligar Banner de Oferta na Landing Page</span>
                       </label>
                       
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título do Banner</label>
                         <input type="text" value={sysConfig.promoTitle} onChange={e=>setSysConfig({...sysConfig, promoTitle: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm outline-none focus:border-red-500 text-white font-bold" />
                       </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
                       <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4">Plano Start</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                         <input type="text" placeholder="Preço (ex: 30)" value={sysConfig.startPrice} onChange={e=>setSysConfig({...sysConfig, startPrice: e.target.value})} className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-amber-500 text-white" />
                         <input type="text" placeholder="Link de Pagamento Asaas" value={sysConfig.startLink} onChange={e=>setSysConfig({...sysConfig, startLink: e.target.value})} className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-amber-500 text-white" />
                       </div>
                       
                       <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest mt-6 mb-4">Plano Pro</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                         <input type="text" placeholder="Preço (ex: 60)" value={sysConfig.proPrice} onChange={e=>setSysConfig({...sysConfig, proPrice: e.target.value})} className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-blue-500 text-white" />
                         <input type="text" placeholder="Link de Pagamento Asaas" value={sysConfig.proLink} onChange={e=>setSysConfig({...sysConfig, proLink: e.target.value})} className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-blue-500 text-white" />
                       </div>

                       <h3 className="text-sm font-black text-yellow-500 uppercase tracking-widest mt-6 mb-4">Plano Elite</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                         <input type="text" placeholder="Preço (ex: 100)" value={sysConfig.elitePrice} onChange={e=>setSysConfig({...sysConfig, elitePrice: e.target.value})} className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-yellow-500 text-white" />
                         <input type="text" placeholder="Link de Pagamento Asaas" value={sysConfig.eliteLink} onChange={e=>setSysConfig({...sysConfig, eliteLink: e.target.value})} className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-yellow-500 text-white" />
                       </div>
                    </div>

                    <button type="submit" disabled={isSavingConfig} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-600/30 active:scale-95 transition-all uppercase tracking-widest text-xs">
                      {isSavingConfig ? <Activity className="animate-spin mx-auto"/> : 'Gravar Ofertas na Plataforma'}
                    </button>
                 </form>
              </div>
            )}
          </div>

          <div className="fixed bottom-0 md:bottom-8 left-0 right-0 w-full md:w-max md:mx-auto bg-slate-900/95 backdrop-blur-xl border-t md:border border-slate-800/50 flex justify-around items-center p-4 z-50 md:rounded-full shadow-[0_-10px_30px_rgba(0,0,0,0.5)] md:px-12 md:gap-8" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>
            {[
              { id: 'alunos', icon: Users, label: 'Personais' },
              { id: 'ofertas', icon: Zap, label: 'Promoções' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setAdminTabAtiva(tab.id)} className={`flex flex-col items-center gap-1.5 transition-all duration-300 md:w-20 ${adminTabAtiva === tab.id ? 'text-red-500 scale-110' : 'text-slate-600 hover:text-slate-400'}`}>
                <tab.icon size={24} strokeWidth={adminTabAtiva === tab.id ? 2.5 : 2} />
                <span className="text-[9px] font-black uppercase tracking-[0.1em]">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDERIZAÇÃO: ADMIN (PERSONAL TRAINER) ====================
  if (currentUser.role === 'ADMIN') {
    const ativosCount = alunos.filter(a => a.status !== 'Bloqueado').length;
    const bloqueadosCount = alunos.filter(a => a.status === 'Bloqueado').length;

    return (
      <div className="min-h-[100dvh] bg-slate-950 flex flex-col text-slate-50 relative">
        <div className="w-full flex-1 flex flex-col md:max-w-7xl mx-auto relative bg-slate-900 md:bg-transparent">
          {toastMsg && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[300] bg-blue-600 text-white font-bold px-4 py-2 rounded-full shadow-lg text-sm whitespace-nowrap animate-fade-in">{toastMsg}</div>}
          
          <InstallBanner showInstallBanner={showInstallBanner} setShowInstallBanner={setShowInstallBanner} handleInstallClick={handleInstallClick} />
          <TourModal showTour={showTour} setShowTour={setShowTour} tourStep={tourStep} setTourStep={setTourStep} />
          <YoutubeModal videoAtivo={videoAtivo} setVideoAtivo={setVideoAtivo} />

          <header className="px-6 pb-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10 shadow-sm shrink-0 md:rounded-b-[2rem]" style={{ paddingTop: 'max(env(safe-area-inset-top), 1.5rem)' }}>
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="EvoTrainer" className="w-12 h-12 rounded-xl object-cover border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]" />
              <div>
                <h1 className="text-xl font-black text-white leading-tight">EVO<span className="text-blue-500">TRAINER</span></h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Gestão</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white bg-slate-800 p-2.5 rounded-xl transition-colors"><LogOut size={18} /></button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-36 md:pb-40 custom-scrollbar">
            
            {/* ADMIN TAB: ALUNOS & DASHBOARD */}
            {adminTabAtiva === 'alunos' && (
              <div className="animate-fade-in flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-3 md:gap-6">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoading ? <div className="col-span-full text-center py-8"><Activity className="animate-spin w-8 h-8 text-blue-500 mx-auto"/></div> : 
                   alunosFiltrados.length === 0 ? <p className="col-span-full text-center text-slate-500 py-8 font-bold text-sm border-2 border-dashed border-slate-800 rounded-3xl">Nenhum aluno encontrado.</p> : (
                    alunosFiltrados.map(aluno => (
                      <div key={aluno.id} className={`bg-slate-950 p-5 rounded-[1.8rem] border border-slate-800 shadow-lg flex flex-col gap-4 transition-opacity ${aluno.status === 'Bloqueado' ? 'opacity-50' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            {aluno.avatar ? (
                              <img src={aluno.avatar} alt="Avatar" className="w-12 h-12 rounded-xl object-cover shadow-inner shrink-0" />
                            ) : (
                              <div className="w-12 h-12 bg-slate-900 border border-slate-700 text-blue-500 font-black rounded-xl flex items-center justify-center shadow-inner shrink-0">{aluno.name.charAt(0).toUpperCase()}</div>
                            )}
                            <div>
                              <p className="font-black text-white text-lg leading-tight">{aluno.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{aluno.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${aluno.status === 'Bloqueado' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>{aluno.status}</span>
                        </div>

                        {/* EXIBIÇÃO DO FEEDBACK NO PAINEL DO PERSONAL */}
                        {aluno.history && aluno.history.length > 0 && (aluno.history[0].comment || aluno.history[0].rating) ? (
                           <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
                             <MessageSquare size={14} className="text-amber-500 shrink-0 mt-0.5" />
                             <div>
                                <div className="flex gap-0.5 mb-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} fill={i < (aluno.history[0].rating || 0) ? "#fbbf24" : "none"} color={i < (aluno.history[0].rating || 0) ? "#fbbf24" : "#475569"} />
                                  ))}
                                </div>
                                {aluno.history[0].comment && <p className="text-[10px] text-slate-300 font-medium italic leading-relaxed">"{aluno.history[0].comment}"</p>}
                                <p className="text-[8px] text-slate-500 mt-1 font-bold">Ref: {aluno.history[0].workoutName}</p>
                             </div>
                           </div>
                        ) : (
                           <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-800/50 flex items-center gap-2 opacity-50">
                             <MessageSquare size={14} className="text-slate-600 shrink-0" />
                             <p className="text-[10px] text-slate-500 font-medium italic">Nenhum feedback recente.</p>
                           </div>
                        )}

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

            {/* ADMIN TAB: GERADOR IA COM DIVISÃO AUTOMÁTICA E NOVOS PARÂMETROS */}
            {adminTabAtiva === 'ia' && (
              <div className="animate-fade-in flex flex-col gap-6 md:max-w-3xl mx-auto w-full">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-2xl font-black text-white flex items-center gap-2 leading-none"><Sparkles fill="currentColor"/> Mágico de IA <span className="bg-white text-indigo-600 text-[10px] px-2 py-0.5 rounded-md ml-1">v2.0</span></h2>
                    <p className="text-indigo-200 text-xs mt-3 leading-relaxed font-medium">A IA atua como um PhD em Biomecânica. Agora você tem o poder de ditar o volume e os métodos de alta intensidade do fisiculturismo.</p>
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

                  {/* NOVOS CAMPOS: VOLUME E METODOLOGIA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-cyan-400">Volume por Ficha</label>
                      <select value={iaVolume} onChange={e => setIaVolume(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-indigo-500 font-bold appearance-none cursor-pointer">
                        {[4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                          <option key={num} value={num}>{num} Exercícios</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-amber-400">Metodologia Principal</label>
                      <select value={iaMethodology} onChange={e => setIaMethodology(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-indigo-500 font-bold appearance-none cursor-pointer text-[12px] sm:text-sm">
                        <option value="Tradicional, Progressão de Carga Constante">Tradicional</option>
                        <option value="FST-7 (Fascial Stretch Training no último exercício)">FST-7</option>
                        <option value="Drop-set (aplicado nos últimos exercícios)">Drop-Set</option>
                        <option value="Rest-Pause">Rest-Pause</option>
                        <option value="GVT (German Volume Training 10x10)">GVT (10x10)</option>
                        <option value="Heavy Duty (Séries únicas até a falha extrema)">Heavy Duty</option>
                        <option value="Priorizar Bi-sets (Agrupados 2 a 2)">Bi-sets Intensivos</option>
                        <option value="Adaptação Anatômica (Iniciantes, foco em máquinas)">Adaptação (Iniciante)</option>
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
                    {isGeneratingIA ? 'Analisando Biomecânica...' : 'Gerar Treino de Elite'}
                  </button>
                </div>
              </div>
            )}

            {/* ADMIN TAB: PERFIL DO PERSONAL (COM OPÇÕES DE UPGRADE) */}
            {adminTabAtiva === 'perfil' && (
              <div className="flex flex-col gap-6 animate-fade-in pb-8 md:max-w-3xl mx-auto w-full">
                 
                 {/* ÁREA DE ASSINATURA E PLANOS */}
                 <div className={`bg-gradient-to-r ${currentUser.plano === 'PRO' || currentUser.plano === 'ELITE' ? 'from-amber-500 to-orange-500' : 'from-emerald-600 to-teal-600'} p-6 rounded-[2rem] shadow-lg flex flex-col gap-4`}>
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-[10px] text-white/80 font-black uppercase tracking-widest flex items-center gap-1">
                         <Crown size={12}/> Plano Atual
                       </p>
                       <h3 className="text-2xl font-black text-white mt-1 drop-shadow-md">{currentUser.plano || 'GRATIS'}</h3>
                     </div>
                     <button onClick={() => setShowUpgradeModal(true)} className="bg-white text-slate-900 font-black px-5 py-3 rounded-xl shadow-lg active:scale-95 transition-all text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50">
                       VER PLANOS <ChevronRight size={14}/>
                     </button>
                   </div>
                 </div>

                 {/* WHITE LABEL - APENAS ELITE */}
                 {currentUser.plano === 'ELITE' && (
                   <div className="bg-slate-900 border border-yellow-500/30 p-6 rounded-[2rem] shadow-lg relative overflow-hidden">
                     <div className="absolute -right-4 -top-4 text-yellow-500/10"><Crown size={100}/></div>
                     <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10"><Palette size={14}/> A Sua Marca (White Label)</h3>
                     
                     <div className="flex flex-col gap-4 relative z-10">
                       <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden">
                            {profileForm.brandLogo ? (
                               <img src={profileForm.brandLogo} alt="Logo da Marca" className="w-full h-full object-cover" />
                            ) : (
                               <p className="text-[8px] text-slate-500 uppercase font-black text-center px-1">Sem Logo</p>
                            )}
                          </div>
                          <div className="flex-1">
                            <input type="file" id="brandLogoUpload" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(e, true)} />
                            <button onClick={() => document.getElementById('brandLogoUpload')?.click()} className="text-[10px] font-black bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors uppercase">Alterar Logo</button>
                            <p className="text-[8px] text-slate-500 mt-1">Aparecerá no App do Aluno e PDFs.</p>
                          </div>
                       </div>

                       <div className="flex flex-col gap-1.5 mt-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do App</label>
                         <input type="text" value={profileForm.brandName} onChange={e => setProfileForm({...profileForm, brandName: e.target.value})} placeholder="Ex: FelipeFit App" className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-yellow-500 transition-colors" />
                       </div>

                       <div className="flex flex-col gap-1.5 mt-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cor Principal (HEX)</label>
                         <div className="flex items-center gap-3">
                           <input type="color" value={profileForm.brandColor || '#2563eb'} onChange={e => setProfileForm({...profileForm, brandColor: e.target.value})} className="w-12 h-12 rounded-lg cursor-pointer bg-slate-950 border border-slate-800" />
                           <input type="text" value={profileForm.brandColor} onChange={e => setProfileForm({...profileForm, brandColor: e.target.value})} placeholder="#2563eb" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-yellow-500 transition-colors font-mono" />
                         </div>
                       </div>
                       
                       <button onClick={salvarPerfil} disabled={isSavingProfile} className="w-full mt-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black py-3 rounded-xl text-[10px] uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                         {isSavingProfile ? <Activity className="animate-spin mx-auto"/> : 'Salvar Minha Marca'}
                       </button>
                     </div>
                   </div>
                 )}

                 <h2 className="text-2xl font-black flex items-center gap-2 px-1"><UserIcon className="text-blue-500"/> Conta do Personal</h2>

                 <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                       <div className="w-24 h-24 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center text-4xl font-black border-2 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)] overflow-hidden">
                          {currentUser?.avatar ? (
                            <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            currentUser.name.charAt(0).toUpperCase()
                          )}
                       </div>
                       <input type="file" id="adminAvatarUpload" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(e, false)} />
                       <button onClick={() => document.getElementById('adminAvatarUpload')?.click()} className="absolute bottom-0 right-0 bg-blue-600 text-white p-2.5 rounded-full shadow-lg active:scale-90 transition-transform">
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
          <div className="fixed bottom-0 md:bottom-8 left-0 right-0 w-full md:w-max md:mx-auto bg-slate-900/95 backdrop-blur-xl border-t md:border border-slate-800/50 flex justify-around items-center p-4 z-50 md:rounded-full shadow-[0_-10px_30px_rgba(0,0,0,0.5)] md:px-12 md:gap-8" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>
            {[
              { id: 'alunos', icon: Users, label: 'Alunos' },
              { id: 'ia', icon: Sparkles, label: 'Inteligência' },
              { id: 'perfil', icon: UserIcon, label: 'Perfil' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setAdminTabAtiva(tab.id)} className={`flex flex-col items-center gap-1.5 transition-all duration-300 md:w-20 ${adminTabAtiva === tab.id ? 'text-blue-500 scale-110' : 'text-slate-600 hover:text-slate-400'}`}>
                <tab.icon size={24} strokeWidth={adminTabAtiva === tab.id ? 2.5 : 2} />
                <span className="text-[9px] font-black uppercase tracking-[0.1em]">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* MODAL ADICIONAR ALUNO (ADMIN) */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200] backdrop-blur-md" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] w-full max-w-sm max-h-[90dvh] overflow-y-auto custom-scrollbar shadow-2xl animate-fade-in">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2 leading-none"><UserIcon className="text-blue-500"/> Registar Aluno</h3>
                <form onSubmit={criarAluno} className="flex flex-col gap-4">
                  <input type="text" required placeholder="Nome Completo" value={novoAluno.name} onChange={e => setNovoAluno({...novoAluno, name: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500 font-bold" />
                  <input type="email" required placeholder="E-mail de acesso" value={novoAluno.email} onChange={e => setNovoAluno({...novoAluno, email: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500" />
                  <input type="tel" required placeholder="WhatsApp (ex: 11999999999)" value={novoAluno.phone} onChange={e => setNovoAluno({...novoAluno, phone: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500" />
                  <input type="text" placeholder="Senha (Padrão 123456)" value={novoAluno.password} onChange={e => setNovoAluno({...novoAluno, password: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500" />
                  <div className="flex gap-2 mt-4">
                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest">Cancelar</button>
                    <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-4 rounded-[1.2rem] shadow-lg uppercase text-[10px] tracking-widest active:scale-95">Guardar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL ESCOLHER PLANO (UPGRADE DINÂMICO) */}
          {showUpgradeModal && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[400] backdrop-blur-md" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] w-full max-w-sm max-h-[85dvh] overflow-y-auto shadow-2xl animate-fade-in custom-scrollbar">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800 shrink-0 sticky top-0 bg-slate-900 z-10">
                  <h3 className="text-xl font-black flex items-center gap-2 leading-none"><Crown className="text-amber-500"/> Planos</h3>
                  <button onClick={() => setShowUpgradeModal(false)} className="p-2 bg-slate-800 rounded-xl text-slate-500"><X size={20}/></button>
                </div>
                
                <div className="flex flex-col gap-4">
                  {/* START BRONZE */}
                  <div className="bg-slate-950 border border-amber-700/30 p-5 rounded-3xl flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-700/20 text-amber-500 text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">R$ {sysConfig?.startPrice || 30}/mês</div>
                    <div><h4 className="text-amber-500 font-black text-lg">START Bronze</h4></div>
                    <ul className="text-[10px] text-slate-300 space-y-2 mb-2">
                      <li className="flex gap-2 items-center"><Check size={12} className="text-emerald-500"/> Até 20 Alunos</li>
                      <li className="flex gap-2 items-center"><Check size={12} className="text-emerald-500"/> 10 Treinos com IA/mês</li>
                    </ul>
                    <button onClick={() => window.open(`${sysConfig?.startLink || 'https://www.asaas.com/c/gppqjpyhag2jw0c9'}?externalReference=${currentUser.id}`, '_blank')} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-colors">Assinar Start</button>
                  </div>

                  {/* PRO SILVER */}
                  <div className="bg-slate-950 border border-blue-500 p-5 rounded-3xl flex flex-col gap-4 relative overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">R$ {sysConfig?.proPrice || 60}/mês</div>
                    <div><h4 className="text-blue-400 font-black text-lg">PRO Silver</h4></div>
                    <ul className="text-[10px] text-slate-300 space-y-2 mb-2">
                      <li className="flex gap-2 items-center"><Check size={12} className="text-emerald-500"/> Alunos Ilimitados</li>
                      <li className="flex gap-2 items-center"><Check size={12} className="text-emerald-500"/> 40 Treinos com IA/mês</li>
                    </ul>
                    <button onClick={() => window.open(`${sysConfig?.proLink || 'https://www.asaas.com/c/6np0bp37c91vfla6'}?externalReference=${currentUser.id}`, '_blank')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-colors">Assinar Pro</button>
                  </div>

                  {/* ELITE OURO */}
                  <div className="bg-slate-950 border border-yellow-500 p-5 rounded-3xl flex flex-col gap-4 relative overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.15)]">
                    <div className="absolute top-0 right-0 bg-yellow-500 text-slate-900 text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">R$ {sysConfig?.elitePrice || 100}/mês</div>
                    <div><h4 className="text-yellow-500 font-black text-lg">ELITE Ouro</h4></div>
                    <ul className="text-[10px] text-slate-300 space-y-2 mb-2">
                      <li className="flex gap-2 items-center"><Check size={12} className="text-emerald-500"/> Alunos Ilimitados</li>
                      <li className="flex gap-2 items-center"><Check size={12} className="text-emerald-500"/> Treinos IA Ilimitados</li>
                      <li className="flex gap-2 items-center"><Check size={12} className="text-emerald-500"/> White Label (Sua Marca)</li>
                    </ul>
                    <button onClick={() => window.open(`${sysConfig?.eliteLink || 'https://www.asaas.com/c/sql5glydf5g3gvxs'}?externalReference=${currentUser.id}`, '_blank')} className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-colors">Assinar Elite</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODAL GERENCIAR TREINOS COM WHATSAPP E PDF (ADMIN) */}
          {showGerenciarTreinosModal && alunoSelecionado && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200] backdrop-blur-md" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] w-full max-w-md max-h-[85dvh] flex flex-col shadow-2xl animate-fade-in">
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

          {/* MODAL CRIAR/EDITAR TREINO (ADMIN) */}
          {showTreinoModal && (
            <div className="fixed inset-0 bg-black/95 z-[250] p-4 flex flex-col justify-start overflow-y-auto custom-scrollbar" style={{ paddingTop: 'max(env(safe-area-inset-top), 2rem)', paddingBottom: 'max(env(safe-area-inset-bottom), 2rem)' }}>
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

  // ==================== RENDERIZAÇÃO: ALUNO ====================
  const aluno = currentUser;
  const treinoSelecionado = treinosAluno.find(t => t.dayOfWeek === diaAtivo);
  const groupedTreinoSelecionado = treinoSelecionado ? getGroupedExercises(treinoSelecionado.exercises || []) : [];

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col text-slate-50 items-center md:justify-center relative md:py-10">
      {/* O aluno mantém-se contido num formato de telemóvel mesmo no Desktop */}
      <div className="w-full h-full min-h-[100dvh] md:min-h-[850px] md:h-[850px] md:max-w-[420px] bg-slate-900 md:rounded-[40px] md:border-[8px] border-slate-800 flex flex-col relative overflow-hidden md:shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {toastMsg && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[130] text-white font-bold px-4 py-2 rounded-full shadow-lg text-sm whitespace-nowrap animate-fade-in" style={getBrandStyle('bg')}>{toastMsg}</div>}
        
        <InstallBanner showInstallBanner={showInstallBanner} setShowInstallBanner={setShowInstallBanner} handleInstallClick={handleInstallClick} brandColor={primaryColor} />
        <YoutubeModal videoAtivo={videoAtivo} setVideoAtivo={setVideoAtivo} brandColor={primaryColor} />

        {/* FEEDBACK MODAL (ALUNO PÓS-TREINO) */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[400] flex items-center justify-center p-6 animate-fade-in" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] w-full max-w-sm text-center space-y-8 shadow-2xl">
               <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-500/30 animate-bounce"><Flame size={40} className="text-white"/></div>
               <div>
                 <h3 className="text-2xl font-black text-white">Treino Concluído!</h3>
                 <p className="text-slate-400 text-xs mt-2 font-medium">Como classifica o esforço de hoje?</p>
               </div>
               <div className="flex justify-center gap-2">
                 {[1,2,3,4,5].map(n => (
                   <button key={n} onClick={()=>setFeedbackRating(n)} className={`p-2 transition-all transform hover:scale-110 ${feedbackRating >= n ? 'text-amber-400 scale-125 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'text-slate-800'}`}>
                     <Star size={36} fill={feedbackRating >= n ? 'currentColor' : 'none'} strokeWidth={feedbackRating >= n ? 0 : 2}/>
                   </button>
                 ))}
               </div>
               <textarea value={feedbackComment} onChange={e=>setFeedbackComment(e.target.value)} placeholder="Alguma dor, dificuldade ou observação para o seu Personal? (Opcional)" rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 text-white resize-none" />
               <button onClick={enviarFeedback} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/30 active:scale-95 transition-all text-sm uppercase tracking-widest">
                 Enviar Feedback
               </button>
            </div>
          </div>
        )}

        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10 shadow-md shrink-0" style={{ paddingTop: 'max(env(safe-area-inset-top, 1.5rem), 1.5rem)' }}>
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border shadow-lg overflow-hidden" style={{ backgroundColor: `${primaryColor}20`, borderColor: `${primaryColor}50`, color: primaryColor }}>
                {currentBrand?.logo ? (
                  <img src={currentBrand.logo} alt="Brand Logo" className="w-full h-full object-cover" />
                ) : (
                  brandName.charAt(0).toUpperCase()
                )}
             </div>
             <div>
               <h2 className="text-lg font-bold leading-tight truncate max-w-[150px]">{brandName}</h2>
               <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Olá, {aluno.name.split(' ')[0]} 💪</p>
             </div>
           </div>
           <button onClick={handleLogout} className="text-slate-400 hover:text-white bg-slate-800 p-2.5 rounded-xl transition-colors"><LogOut size={18}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar" style={{ paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
          
          {/* TAB: INÍCIO */}
          {alunoTabAtiva === 'home' && !treinoIniciado && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="p-6 rounded-[2rem] border flex items-center justify-between shadow-lg relative overflow-hidden" style={{ backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}30` }}>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={getBrandStyle('text')}>Sequência</p>
                  <p className="text-4xl font-black mt-1 text-white">{aluno.streak} <span className="text-lg font-medium text-slate-300">dias</span></p>
                </div>
                <div className="w-14 h-14 rounded-full flex items-center justify-center relative z-10 shadow-lg animate-pulse" style={getBrandStyle('bg')}><Flame className="text-white w-7 h-7" /></div>
                <Flame size={120} className="absolute -right-4 -bottom-4 opacity-5" style={getBrandStyle('text')}/>
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
                          ${isAtivo ? 'text-white scale-110 shadow-lg' : 
                            temTreino ? 'bg-slate-800 border' : 'bg-slate-800/50 text-slate-500'}`}
                          style={isAtivo ? getBrandStyle('bg') : (temTreino ? { borderColor: `${primaryColor}50`, color: primaryColor } : {})}
                        >
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
                  <div className="p-1 rounded-[2.5rem] shadow-2xl animate-fade-in transform active:scale-[0.98] transition-transform" style={getBrandStyle('bg')}>
                    <div className="bg-slate-900 p-8 rounded-[2.2rem] flex flex-col items-center text-center relative overflow-hidden">
                      <div className="absolute -right-6 -top-6 text-slate-800/40 transform rotate-12"><Dumbbell size={120} /></div>
                      <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest relative z-10 border" style={{ backgroundColor: `${primaryColor}20`, borderColor: `${primaryColor}30`, color: primaryColor }}>Ficha de {treinoSelecionado.dayOfWeek}</span>
                      <h3 className="text-3xl font-black text-white leading-tight mt-6 relative z-10">{treinoSelecionado.title}</h3>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest relative z-10 mt-2 mb-8">{treinoSelecionado.duration} • {treinoSelecionado.exercises?.length || 0} exercícios</p>
                      
                      <button onClick={() => { setExerciciosFeitos([]); setTreinoIniciado(true); }} className="w-full text-white font-black text-lg py-5 rounded-[1.5rem] flex items-center justify-center gap-2 relative z-10 shadow-lg uppercase tracking-widest" style={getBrandStyle('bg')}><Play fill="currentColor" /> INICIAR TREINO</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: FICHAS */}
          {alunoTabAtiva === 'treinos' && !treinoIniciado && (
            <div className="animate-fade-in flex flex-col gap-6">
              <h2 className="text-2xl font-black flex items-center gap-2 px-1" style={getBrandStyle('text')}><List /> Suas Fichas</h2>
              {treinosAluno.length === 0 ? (
                <div className="bg-slate-800/30 p-12 rounded-[2.5rem] text-center border border-dashed border-slate-700">
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Nenhuma ficha disponível.</p>
                </div>
              ) : 
                treinosAluno.map((t: any) => (
                  <div key={t.id} className="bg-slate-800/50 border border-slate-700 p-5 rounded-[2rem] flex justify-between items-center active:scale-[0.98] transition-all shadow-lg">
                     <div className="flex-1">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>{t.dayOfWeek}</span>
                       <h3 className="text-xl font-black text-white mt-2 leading-tight">{t.title}</h3>
                       <p className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-widest">{t.duration} • {t.exercises?.length} exercícios</p>
                     </div>
                     <div className="flex gap-2">
                       <button onClick={() => exportarTreinoPDF(t, currentUser, true)} className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 shadow-lg hover:text-white transition-colors">
                         <Download size={20} />
                       </button>
                       <button onClick={() => { setDiaAtivo(t.dayOfWeek); setAlunoTabAtiva('home'); }} className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform" style={getBrandStyle('bg')}>
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
               <h2 className="text-2xl font-black flex items-center gap-2 px-1" style={getBrandStyle('text')}><UserIcon /> O seu Perfil</h2>

               <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                     <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black border-2 shadow-lg overflow-hidden" style={{ backgroundColor: `${primaryColor}20`, borderColor: `${primaryColor}50`, color: primaryColor }}>
                        {profileForm.avatar ? (
                          <img src={profileForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'U'
                        )}
                     </div>
                     <input type="file" id="alunoAvatarUpload" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(e, false)} />
                     <button onClick={() => document.getElementById('alunoAvatarUpload')?.click()} className="absolute bottom-0 right-0 text-white p-2.5 rounded-full shadow-lg active:scale-90 transition-transform" style={getBrandStyle('bg')}>
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
                       <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} placeholder="(11) 99999-9999" className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-white outline-none transition-colors font-bold text-sm focus:border-white" />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Peso (kg)</label>
                          <input type="number" value={profileForm.weight} onChange={e => setProfileForm({...profileForm, weight: e.target.value})} placeholder="Ex: 75" className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-white outline-none text-center font-bold focus:border-white" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Altura (cm)</label>
                          <input type="number" value={profileForm.height} onChange={e => setProfileForm({...profileForm, height: e.target.value})} placeholder="Ex: 175" className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-white outline-none text-center font-bold focus:border-white" />
                        </div>
                     </div>
                  </div>
                  <button type="submit" disabled={isSavingProfile} className="w-full text-white font-black py-5 rounded-[1.8rem] shadow-lg active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-xs flex items-center justify-center gap-2" style={getBrandStyle('bg')}>
                    {isSavingProfile ? <Activity className="animate-spin"/> : <Save size={18} />} SALVAR PERFIL
                  </button>
               </form>

               <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Lock size={14}/> Segurança</h3>
                  <form onSubmit={mudarSenha} className="flex flex-col gap-3">
                    <input type="password" required value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} placeholder="Senha Atual" className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-white text-sm" />
                    <input type="password" required value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} placeholder="Nova Senha" className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-white text-sm" />
                    <input type="password" required value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} placeholder="Confirmar Nova" className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-white text-sm" />
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
              <div className="mb-4 flex justify-between items-center bg-slate-950/80 backdrop-blur-md sticky top-0 py-4 z-20 border-b border-slate-800 px-2" style={{ paddingTop: 'max(env(safe-area-inset-top, 1.5rem), 1.5rem)' }}>
                <div><span className="text-[9px] font-black uppercase tracking-widest block mb-0.5" style={getBrandStyle('text')}>Modo Foco</span><h2 className="text-lg font-black text-white leading-tight">{treinoSelecionado.title}</h2></div>
                <button onClick={() => { if(window.confirm("Sair do treino atual?")) setTreinoIniciado(false); }} className="text-[10px] text-red-500 font-black bg-red-500/10 px-4 py-2 rounded-xl uppercase tracking-widest border border-red-500/10">Sair</button>
              </div>

              <div className="flex flex-col gap-6 pt-2">
                {groupedTreinoSelecionado.map((group, idx) => {
                  const isMainDone = exerciciosFeitos.includes(group.main.id);
                  return (
                    <div key={group.main.id} className={`p-5 rounded-[2.5rem] border flex flex-col gap-4 transition-all duration-500 shadow-xl ${isMainDone ? 'bg-slate-900 border-slate-700' : 'bg-slate-800 border-slate-700'}`} style={isMainDone ? { backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}30` } : {}}>
                      <div className="flex items-center gap-4">
                        <button onClick={() => toggleDone(group.main.id)} className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${isMainDone ? 'text-white shadow-lg' : 'border-slate-600 text-slate-500 bg-slate-900'}`} style={isMainDone ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}>
                          {isMainDone ? <CheckCircle2 size={30} /> : <span className="font-black text-2xl">{idx + 1}</span>}
                        </button>
                        <div className="flex-1">
                          <h4 className={`font-black text-lg leading-tight ${isMainDone ? 'opacity-50 line-through text-white' : 'text-white'}`}>{group.main.name}</h4>
                          <div className="flex gap-2 text-[10px] mt-1 text-slate-500 font-black uppercase tracking-widest"><span>{group.main.sets}</span>{group.main.weight && <span>• {group.main.weight}</span>}</div>
                        </div>
                        
                        <button 
                          onClick={() => openVideo(group.main.youtubeId, group.main.name)} 
                          className={`p-3.5 rounded-2xl active:scale-90 transition-all ${group.main.youtubeId ? 'bg-red-600/10 text-red-500 border border-red-500/10' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-red-400'}`}
                        >
                          <Youtube size={22} />
                        </button>
                      </div>
                      
                      {group.partners.map((p: any) => {
                         const isPartnerDone = exerciciosFeitos.includes(p.id);
                         return (
                            <div key={p.id} className={`ml-4 pl-6 border-l-2 flex items-center gap-4 transition-all duration-300`} style={{ borderColor: isPartnerDone ? `${primaryColor}30` : `${primaryColor}80` }}>
                                <button onClick={() => toggleDone(p.id)} className={`w-2 h-2 rounded-full shadow-lg`} style={{ backgroundColor: primaryColor, opacity: isPartnerDone ? 0.3 : 1 }}></button>
                                <div className="flex-1">
                                    <h4 className={`font-black text-sm leading-tight ${isPartnerDone ? 'opacity-40 line-through text-white' : 'text-white'}`}>{p.name}</h4>
                                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-0.5">{p.sets}</p>
                                </div>
                                
                                <button 
                                  onClick={() => openVideo(p.youtubeId, p.name)} 
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
                <button onClick={() => finalizarTreino(treinoSelecionado.title)} disabled={exerciciosFeitos.length < (treinoSelecionado.exercises?.length || 0)} className={`w-full py-6 rounded-[2rem] font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-3 ${exerciciosFeitos.length >= (treinoSelecionado.exercises?.length || 0) ? 'text-white active:scale-95' : 'bg-slate-800 text-slate-600'}`} style={exerciciosFeitos.length >= (treinoSelecionado.exercises?.length || 0) ? getBrandStyle('bg') : {}}>
                   {exerciciosFeitos.length >= (treinoSelecionado.exercises?.length || 0) ? <><Flame fill="currentColor"/> CONCLUIR 🔥</> : `Faltam ${(treinoSelecionado.exercises?.length || 0) - exerciciosFeitos.length} Blocos`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* NAVEGAÇÃO INFERIOR */}
        {!treinoIniciado && (
          <div className="absolute bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50 flex justify-around items-center p-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] md:rounded-b-[40px]" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 1.5rem), 1.5rem)' }}>
            {[
              { id: 'home', icon: Home, label: 'Início' },
              { id: 'treinos', icon: Dumbbell, label: 'Fichas' },
              { id: 'perfil', icon: UserIcon, label: 'Perfil' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setAlunoTabAtiva(tab.id)} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${alunoTabAtiva === tab.id ? 'scale-110' : 'text-slate-600 hover:text-slate-400'}`} style={alunoTabAtiva === tab.id ? getBrandStyle('text') : {}}>
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