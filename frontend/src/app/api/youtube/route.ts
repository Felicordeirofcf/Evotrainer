import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Pesquisa obrigatória' }, { status: 400 });
  }

  // O SERVIDOR lê a chave do ambiente do Vercel
  // IMPORTANTE: No Vercel a variável deve chamar-se YOUTUBE_API_KEY
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error("ERRO CRÍTICO: YOUTUBE_API_KEY não encontrada no ambiente do servidor.");
    return NextResponse.json({ 
      error: 'Configuração em falta no servidor',
      details: 'A chave YOUTUBE_API_KEY não foi definida nas Environment Variables do Vercel.'
    }, { status: 500 });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 86400 } // Cache opcional de 24h para poupar quota
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("YouTube API Error:", data);
      return NextResponse.json({ 
        error: 'Erro na resposta do YouTube', 
        details: data.error?.message || 'Erro desconhecido' 
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: 'Erro de ligação ao servidor do YouTube' }, { status: 500 });
  }
}