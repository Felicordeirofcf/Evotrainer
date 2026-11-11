'use client';

import React, { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Copy } from 'lucide-react';
import { API_URL, brl, Produto } from '../api';

type Pix = { orderId: number; accessKey: string; pixCopiaECola: string; pixQrBase64: string };

const formatCpf = (v: string) =>
  v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');

export default function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [produto, setProduto] = useState<Produto | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', cpf: '' });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [pix, setPix] = useState<Pix | null>(null);
  const [pago, setPago] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/produtos/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setProduto)
      .catch(() => setNotFound(true));
  }, [id]);

  // Consulta o status do pedido a cada 4s enquanto o Pix está aberto
  useEffect(() => {
    if (!pix || pago) return;
    timer.current = setInterval(async () => {
      try {
        const r = await fetch(`${API_URL}/pedidos/${pix.orderId}/status?key=${pix.accessKey}`);
        const d = await r.json();
        if (d.status === 'PAID') setPago(true);
        if (d.status === 'CANCELLED') {
          setPix(null);
          setErro('O Pix expirou ou foi cancelado. Gere um novo.');
        }
      } catch { /* tenta de novo no próximo ciclo */ }
    }, 4000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [pix, pago]);

  const comprar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const r = await fetch(`${API_URL}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: Number(id), ...form }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Erro ao gerar o Pix.');
      setPix(d);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao gerar o Pix.');
    } finally {
      setEnviando(false);
    }
  };

  const copiar = async () => {
    if (!pix) return;
    await navigator.clipboard.writeText(pix.pixCopiaECola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <p>Produto não encontrado.</p>
        <Link href="/loja" className="text-blue-400 underline">Voltar à loja</Link>
      </div>
    );
  }
  if (!produto) return <div className="min-h-screen bg-slate-950 text-slate-400 p-10 text-center">Carregando...</div>;

  const input = 'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500';

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6">
      <div className="max-w-xl mx-auto">
        <Link href="/loja" className="text-blue-400 text-sm">← Voltar à loja</Link>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mt-4 space-y-6">
          <div>
            <h1 className="text-3xl font-black">{produto.title}</h1>
            <p className="text-slate-400 mt-2 whitespace-pre-line">{produto.description}</p>
            <p className="text-3xl font-black text-emerald-400 mt-4">{brl(produto.priceCents)}</p>
          </div>

          {pago ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 size={64} className="text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-black">Pagamento confirmado!</h2>
              {pix && (
                <a href={`${API_URL}/download/${pix.accessKey}`} className="inline-block bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-xl font-black uppercase">
                  Baixar planilha agora
                </a>
              )}
              <p className="text-slate-400 text-sm">Também enviamos o link para <strong>{form.email}</strong> (confira o spam).</p>
            </div>
          ) : pix ? (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">Pague com Pix</h2>
              {pix.pixQrBase64 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`data:image/png;base64,${pix.pixQrBase64}`} alt="QR Code Pix" className="mx-auto w-56 h-56 bg-white p-2 rounded-xl" />
              )}
              <textarea readOnly value={pix.pixCopiaECola} className={`${input} h-24 text-xs`} />
              <button onClick={copiar} className="flex items-center gap-2 mx-auto bg-blue-600 px-5 py-3 rounded-xl font-bold">
                <Copy size={16} /> {copiado ? 'Copiado!' : 'Copiar código Pix'}
              </button>
              <p className="text-slate-400 text-sm">Aguardando pagamento... esta tela atualiza sozinha. O Pix vale por 30 minutos.</p>
            </div>
          ) : (
            <form onSubmit={comprar} className="space-y-3">
              <input required placeholder="Nome completo" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="email" placeholder="E-mail (receberá o download)" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input required inputMode="numeric" placeholder="CPF" className={input} value={form.cpf} onChange={(e) => setForm({ ...form, cpf: formatCpf(e.target.value) })} />
              {erro && <p className="text-red-400 text-sm">{erro}</p>}
              <button disabled={enviando} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-4 rounded-xl font-black uppercase">
                {enviando ? 'Gerando Pix...' : 'Gerar Pix'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
