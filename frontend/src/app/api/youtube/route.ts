import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Pesquisa obrigatória' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ 
      error: 'Configuração em falta',
      details: 'Chave API não configurada no servidor.'
    }, { status: 500 });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 86400 } // Cache de 24h para economizar sua quota
    });

    const data = await response.json();

    if (!response.ok) {
      // Se o erro for de Quota Excedida
      if (data.error?.errors?.some((e: any) => e.reason === 'quotaExceeded')) {
        return NextResponse.json({ 
          error: 'quota_exceeded', 
          message: 'Limite diário do YouTube atingido.' 
        }, { status: 403 });
      }

      return NextResponse.json({ error: 'Erro API YouTube', details: data.error?.message }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Erro de conexão' }, { status: 500 });
  }
}