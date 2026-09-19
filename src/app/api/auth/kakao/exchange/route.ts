import { NextRequest, NextResponse } from "next/server";

const KAKAO_STATE_COOKIE = "icheon-kakao-oauth-state";

type KakaoExchangeBody = Readonly<{
  code?: unknown;
  state?: unknown;
}>;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body: KakaoExchangeBody = await request.json().catch(() => ({}));
  const storedState = request.cookies.get(KAKAO_STATE_COOKIE)?.value;
  if (typeof body.code !== "string" || typeof body.state !== "string" || body.state !== storedState) {
    return NextResponse.json({ error: "invalid-oauth-state" }, { status: 400 });
  }

  const clientId = process.env["SUPABASE_AUTH_EXTERNAL_KAKAO_CLIENT_ID"];
  const clientSecret = process.env["SUPABASE_AUTH_EXTERNAL_KAKAO_SECRET"];
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "kakao-not-configured" }, { status: 503 });
  }

  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const requestOrigin = forwardedHost ? `${forwardedProtocol}://${forwardedHost}` : request.nextUrl.origin;
  const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: new URL("/auth/callback", requestOrigin).toString(),
      code: body.code,
    }),
    cache: "no-store",
  });
  const tokenPayload: unknown = await tokenResponse.json().catch(() => null);
  const idToken = tokenPayload !== null && typeof tokenPayload === "object" && "id_token" in tokenPayload
    ? tokenPayload.id_token
    : null;
  if (!tokenResponse.ok || typeof idToken !== "string") {
    return NextResponse.json({ error: "kakao-token-exchange-failed" }, { status: 502 });
  }

  const response = NextResponse.json({ idToken });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.delete(KAKAO_STATE_COOKIE);
  return response;
}
