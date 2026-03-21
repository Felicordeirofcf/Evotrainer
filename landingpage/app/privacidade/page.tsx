'use client';

import React from 'react';
import { ShieldCheck, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-8 md:p-24 selection:bg-blue-500/30">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors mb-12 group font-bold uppercase tracking-widest text-xs"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Voltar ao Início
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30">
            <ShieldCheck className="text-blue-500" size={32} />
          </div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            Política de Privacidade
          </h1>
        </div>

        <div className="space-y-8 leading-relaxed text-sm md:text-base border-t border-slate-800 pt-8">
          
          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic uppercase">1. Coleta de Informações</h2>
            <p>
              Ao utilizar o **EvoTrainer**, coletamos informações básicas necessárias para a prestação do serviço, como nome, e-mail e dados profissionais. Esses dados são utilizados exclusivamente para a criação da sua conta e personalização da sua experiência com nossa Inteligência Artificial.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic uppercase">2. Uso de Dados e IA</h2>
            <p>
              Nossa Engine de IA processa informações de treino para gerar periodizações. Nenhum dado sensível de saúde de seus alunos é compartilhado com terceiros fora do ecossistema necessário para o funcionamento da ferramenta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic uppercase">3. Pagamentos e Segurança</h2>
            <p>
              Processamos pagamentos através do **Asaas**. Não armazenamos dados de cartão de crédito em nossos servidores. Todas as transações são criptografadas e seguem os padrões de segurança bancária.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic uppercase">4. Cookies e Marketing</h2>
            <p>
              Utilizamos cookies do **Google Ads** e **Google Analytics** para entender o comportamento de navegação e otimizar nossas campanhas de marketing. Você pode desativar o uso de cookies nas configurações do seu navegador a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 italic uppercase">5. Seus Direitos</h2>
            <p>
              De acordo com a LGPD, você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados a qualquer momento através do nosso suporte oficial ou painel de configurações.
            </p>
          </section>

          <div className="pt-12 border-t border-slate-800 text-[10px] text-slate-600 font-black uppercase tracking-widest text-center">
            Última atualização: Março de 2026 • EvoTrainer SaaS
          </div>
        </div>
      </div>
    </div>
  );
}