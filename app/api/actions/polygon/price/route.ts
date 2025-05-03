import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const sellToken = searchParams.get('sellToken'); // example: "MATIC"
  const buyToken = searchParams.get('buyToken'); // example: "DAI"
  const sellAmount = searchParams.get('sellAmount');

  if (!sellToken || !buyToken || !sellAmount) {
    return NextResponse.json(
      { error: 'sellToken, buyToken, and sellAmount required' },
      { status: 400 },
    );
  }

  const ZERO_EX_API_KEY = process.env.ZERO_EX_API_KEY!;
  if (!ZERO_EX_API_KEY) {
    return NextResponse.json(
      { error: 'Swap API key not configured' },
      { status: 500 },
    );
  }

  // Polygon 0x Swap endpoint: https://polygon.api.0x.org/swap/v1/price
  const url = new URL('https://polygon.api.0x.org/swap/v1/price');
  url.searchParams.set('sellToken', sellToken);
  url.searchParams.set('buyToken', buyToken);
  url.searchParams.set('sellAmount', sellAmount);

  // (Optional: Add slippage param here if desired)

  const res = await fetch(url.toString(), {
    headers: {
      '0x-api-key': ZERO_EX_API_KEY,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(
      {
        error:
          data.validationErrors?.[0]?.reason || data.reason || 'Swap API error',
      },
      { status: res.status },
    );
  }

  return NextResponse.json(data);
}
