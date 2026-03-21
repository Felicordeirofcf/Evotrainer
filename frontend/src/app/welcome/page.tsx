'use client';

import React, { useEffect } from 'react';
import { Rocket, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  // Opcional: Se quiser que ele vá pro dashboard sozinho após 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-12 rounded-[4rem] shadow-2xl text-center relative z-10 animate-fade-in">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
          <Rocket className="text-emerald-500" size={48} />
        </div>

        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
          Conta Criada!
        </h1>
        
        <p className="text-slate-400 font-medium leading-relaxed mb-10">
          Bem-vindo ao **EvoTrainer**. Sua Engine de IA já está liberada para criar suas primeiras periodizações.
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => router.push('/')}
            className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            Acessar meu Painel <ChevronRight size={18}/>
          </button>
          
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] animate-pulse">
            Redirecionando automaticamente...
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex items-center justify-center gap-3">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
            Acesso Grátis Ativado
          </span>
        </div>
      </div>
    </div>
  );
}