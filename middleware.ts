// middleware.ts
import { NextRequest, NextResponse } from "next/server";

function generateNonce() {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString(
    "base64"
  );
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const nonce = generateNonce();

  // Development-friendly CSP
  const isDev = process.env.NODE_ENV === "development";
  const scriptSrc = isDev
    ? `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `script-src 'nonce-${nonce}' 'strict-dynamic'`;

  const csp = `
    default-src 'self';
    ${scriptSrc};
    style-src 'self' 'unsafe-inline' https:;
    img-src 'self' blob: data: https:;
    font-src 'self' https:;
    connect-src 'self' https: ${isDev ? "http://localhost:*" : ""};
    object-src 'none';
    base-uri 'self';
    frame-ancestors 'none';
    form-action 'self';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Nonce", nonce);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/webhook).*)"],
};
