import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  try {
    const apiKey = process.env.WEB3BIO_API_KEY;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-API-KEY': `Bearer ${apiKey}`,
    };

    const response = await fetch(`https://api.web3.bio/profile/${address}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching web3 profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 },
    );
  }
}
