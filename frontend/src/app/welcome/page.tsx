'use client';

import React, { useEffect } from 'react';
import { Rocket, CheckCircle2, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

export default function WelcomePage() {
  const router = useRouter();

  // Redireciona para o dashboard após 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans selection:bg-blue-500/30">
      
      {/* 🎯 EVENTO DE CONVERSÃO DO GOOGLE ADS */}
      {/* Este script avisa o Google que um novo cadastro foi realizado com sucesso */}
      <Script id="google-ads-conversion" strategy="afterInteractive">
        {`
          gtag('event', 'conversion', {
            'send_to': 'AW-18020498759'
          });
        `}
      </Script>

      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-12 rounded-[4rem] shadow-2xl text-center relative z-10 animate-fade-in">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
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
          
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] animate-pulse">
            Redirecionando automaticamente...
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex items-center justify-center gap-3">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
            Acesso Grátis de Elite Ativado
          </span>
        </div>
      </div>
    </div>
  );
}