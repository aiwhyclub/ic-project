import { NextRequest, NextResponse } from "next/server";

const KAKAO_STATE_COOKIE = "icheon-kakao-oauth-state";

export function GET(request: NextRequest): NextResponse {
  const clientId = process.env["SUPABASE_AUTH_EXTERNAL_KAKAO_CLIENT_ID"];
  if (!clientId) {
    return NextResponse.redirect(new URL("/auth?error=kakao-not-configured", request.url));
  }

  const state = `kakao.${crypto.randomUUID()}`;
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const requestOrigin = forwardedHost ? `${forwardedProtocol}://${forwardedHost}` : request.nextUrl.origin;
  const callbackUrl = new URL("/auth/callback", requestOrigin);
  const authorizationUrl = new URL("https://kauth.kakao.com/oauth/authorize");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", callbackUrl.toString());
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid,profile_nickname,profile_image");
  authorizationUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(KAKAO_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 600,
  });
  return response;
}
