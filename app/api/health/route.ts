import { NextResponse } from "next/server";

// Endpoint de salud (estándar PLAi, secciones 4.1 y 8): 200 sin autenticación, sin consultas pesadas.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
