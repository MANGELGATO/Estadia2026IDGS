import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL('/login?logout=true', req.url);
  const response = NextResponse.redirect(url);
  response.cookies.delete('plai_role');
  return response;
}

export async function POST(req: Request) {
  const url = new URL('/login?logout=true', req.url);
  const response = NextResponse.redirect(url);
  response.cookies.delete('plai_role');
  return response;
}
