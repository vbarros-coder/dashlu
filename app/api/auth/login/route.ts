import { NextResponse } from "next/server";
import crypto from "crypto";

// Credenciais autorizadas — server-side apenas
const ALLOWED_USERS: Record<string, string> = {
  "wfernandez@addvaloraglobal.com": "nie-user",
  "lhey@addvaloraglobal.com": "nie-user",
};

const PASSWORD = "NIE@2026";
const SESSION_SECRET = process.env.SESSION_SECRET || "nie-dashboard-2026-secret-key-x9z";

// Controle de brute-force em memória
const failMap = new Map<string, { count: number; until: number }>();
const MAX_FAILS = 5;
const BLOCK_MS = 15 * 60 * 1000; // 15 minutos

function signSession(email: string): string {
  const payload = `${email}:${Date.now()}`;
  const mac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}|${mac}`).toString("base64url");
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  // Verifica bloqueio por IP
  const fail = failMap.get(ip);
  if (fail && fail.count >= MAX_FAILS && now < fail.until) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em 15 minutos." },
      { status: 429 }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  // Valida credenciais
  const emailValid = Object.keys(ALLOWED_USERS).includes(email);

  // Comparação segura da senha (timing-safe)
  const passBuffer = Buffer.from(password);
  const expectedBuffer = Buffer.from(PASSWORD);
  const passMatch =
    passBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(passBuffer, expectedBuffer);

  if (!emailValid || !passMatch) {
    // Registra falha
    const rec = failMap.get(ip) || { count: 0, until: 0 };
    rec.count = (rec.count || 0) + 1;
    if (rec.count >= MAX_FAILS) rec.until = now + BLOCK_MS;
    failMap.set(ip, rec);

    return NextResponse.json(
      { error: "E-mail ou senha incorretos." },
      { status: 401 }
    );
  }

  // Limpa registro de falhas
  failMap.delete(ip);

  // Cria sessão assinada
  const sessionToken = signSession(email);

  const response = NextResponse.json({ ok: true });
  response.cookies.set("nie-session", sessionToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas
  });

  return response;
}
