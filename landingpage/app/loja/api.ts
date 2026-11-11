const base = process.env.NEXT_PUBLIC_API_URL || 'https://evotrainer.onrender.com';
export const API_URL = `${base.replace(/\/$/, '')}/api`;

export type Produto = {
  id: number;
  title: string;
  description: string | null;
  priceCents: number;
  coverUrl: string | null;
};

export const brl = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
