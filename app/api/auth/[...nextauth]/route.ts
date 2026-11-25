import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import { getAuthOptions } from '../../../../lib/auth';

async function handler(req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  const authHandler = NextAuth(getAuthOptions());
  // NextAuth v4 App Router handler acepta (req, context)
  return authHandler(req as unknown as Request, context);
}

export { handler as GET, handler as POST };
