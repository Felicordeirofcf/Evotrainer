'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { API_URL, brl } from '../api';

type AdminProduto = { id: number; title: string; priceCents: number; active: boolean; fileUrl: string };
type Pedido = { id: number; buyerName: string; buyerEmail: string; amountCents: number; status: string; product: { title: string } };

const empty = { title: '', description: '', price: '', coverUrl: '', fileUrl: '' };

export default function LojaAdmin() {
  const [token, setToken] = useState('');
  const [login, setLogin] = useState({ email: '', password: '' });
  const [produtos, setProdutos] = useState<AdminProduto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');

  const headers = useCallback(
    () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }),
    [token]
  );

  const carregar = useCallback(async () => {
    if (!token) return;
    const [a, b] = await Promise.all([
      fetch(`${API_URL}/admin/produtos`, { headers: headers() }),
      fetch(`${API_URL}/admin/pedidos`, { headers: headers() }),
    ]);
    if (a.ok) setProdutos(await a.json());
    if (b.ok) setPedidos(await b.json());
  }, [token, headers]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { carregar(); }, [carregar]);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(login) });
    const d = await r.json();
    if (!r.ok) return setMsg(d.error || 'Falha no login.');
    if (d.user?.role !== 'SUPERADMIN') return setMsg('Acesso restrito ao administrador master.');
    setMsg('');
    setToken(d.token); // só em memória: não persiste token de admin no navegador
  };

  const criar = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceCents = Math.round(parseFloat(form.price.replace(',', '.')) * 100);
    const r = await fetch(`${API_URL}/admin/produtos`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ title: form.title, description: form.description, coverUrl: form.coverUrl || undefined, fileUrl: form.fileUrl, priceCents }),
    });
    const d = await r.json();
    if (!r.ok) return setMsg(d.error || 'Erro ao criar.');
    setMsg('Produto criado!');
    setForm(empty);
    carregar();
  };

  const alternar = async (p: AdminProduto) => {
    await fetch(`${API_URL}/admin/produtos/${p.id}`, { method: 'PUT', headers: headers(), body: JSON.stringify({ active: !p.active }) });
    carregar();
  };

  const input = 'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white';

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <form onSubmit={entrar} className="bg-slate-900 p-8 rounded-3xl w-full max-w-sm space-y-3">
          <h1 className="text-2xl font-black">Admin da Loja</h1>
          <input className={input} type="email" placeholder="E-mail" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
          <input className={input} type="password" placeholder="Senha" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
          {msg && <p className="text-red-400 text-sm">{msg}</p>}
          <button className="w-full bg-blue-600 py-3 rounded-xl font-bold">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-3xl font-black">Admin da Loja</h1>
        {msg && <p className="text-emerald-400">{msg}</p>}

        <form onSubmit={criar} className="bg-slate-900 p-6 rounded-3xl space-y-3">
          <h2 className="font-bold text-lg">Novo produto</h2>
          <input required className={input} placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className={input} placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input required className={input} placeholder="Preço em R$ (ex: 29,90)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input className={input} placeholder="URL da capa (opcional)" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} />
          <input required className={input} placeholder="URL privada do arquivo (https)" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} />
          <button className="bg-emerald-600 px-6 py-3 rounded-xl font-bold">Criar produto</button>
        </form>

        <section className="space-y-2">
          <h2 className="font-bold text-lg">Produtos</h2>
          {produtos.map((p) => (
            <div key={p.id} className="bg-slate-900 p-4 rounded-2xl flex items-center justify-between">
              <span>{p.title} — {brl(p.priceCents)}</span>
              <button onClick={() => alternar(p)} className={`px-4 py-2 rounded-xl text-sm font-bold ${p.active ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                {p.active ? 'Ativo' : 'Inativo'}
              </button>
            </div>
          ))}
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-lg">Pedidos recentes</h2>
          {pedidos.map((o) => (
            <div key={o.id} className="bg-slate-900 p-4 rounded-2xl text-sm flex justify-between">
              <span>#{o.id} · {o.product.title} · {o.buyerName} ({o.buyerEmail})</span>
              <span>{brl(o.amountCents)} · {o.status}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
