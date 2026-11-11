'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, ShoppingCart } from 'lucide-react';
import { API_URL, brl, Produto } from './api';

export default function LojaPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/produtos`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setProdutos)
      .catch(() => setErro('Não foi possível carregar os produtos agora.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6">
      <div className="max-w-6xl mx-auto">
        <header className="py-10 text-center">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-blue-500">EvoTrainer Store</h1>
          <p className="text-slate-400 mt-2">Planilhas de treino prontas. Pague com Pix e receba por e-mail na hora.</p>
        </header>

        {loading && <p className="text-center text-slate-400">Carregando...</p>}
        {erro && <p className="text-center text-red-400">{erro}</p>}
        {!loading && !erro && produtos.length === 0 && (
          <p className="text-center text-slate-400">Nenhum produto disponível no momento.</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {produtos.map((p) => (
            <Link
              key={p.id}
              href={`/loja/${p.id}`}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500 transition flex flex-col"
            >
              {p.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.coverUrl} alt={p.title} className="h-48 w-full object-cover" />
              ) : (
                <div className="h-48 flex items-center justify-center bg-slate-800">
                  <FileSpreadsheet size={56} className="text-blue-500" />
                </div>
              )}
              <div className="p-6 flex flex-col gap-3 flex-1">
                <h2 className="text-xl font-bold">{p.title}</h2>
                <p className="text-slate-400 text-sm line-clamp-3 flex-1">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-emerald-400">{brl(p.priceCents)}</span>
                  <span className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl text-sm font-bold uppercase">
                    <ShoppingCart size={16} /> Comprar
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
