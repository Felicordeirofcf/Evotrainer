import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Apanha o texto de pesquisa vindo do frontend
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'A pesquisa é obrigatória' }, { status: 400 });
  }

  // Lê a chave DIRETAMENTE DO SERVIDOR. O navegador nunca vê isto!
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error("ERRO: YOUTUBE_API_KEY não está configurada no .env");
    return NextResponse.json({ error: 'Chave de API não configurada' }, { status: 500 });
  }

  try {
    // O servidor faz o pedido oculto à Google
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("ERRO DA GOOGLE:", data.error.message);
      return NextResponse.json({ error: data.error.message }, { status: 403 });
    }

    // Devolve apenas os resultados de volta para o teu frontend
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao ligar ao YouTube' }, { status: 500 });
  }
}