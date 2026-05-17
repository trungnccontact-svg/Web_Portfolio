import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = process.env.GO_CHAT_API_URL;
  if (!apiUrl) {
    return NextResponse.json({ error: 'GO_CHAT_API_URL not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(`${apiUrl}/api/messages`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: res.status });
    }

    const messages = await res.json();
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages from Go backend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
