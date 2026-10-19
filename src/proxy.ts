import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { normalizeRole, roleRoutes } from "@/lib/role-routes";

const SESSION_COOKIE = "cfp_session";
const PUBLIC_PATHS = new Set(["/", "/connexion"]);
const ACCOUNT_PATHS = ["/compte", "/compte/mot-de-passe"];

type SessionPayload = {
  userId?: unknown;
  roleId?: unknown;
  role?: unknown;
};

function hasRouteAccess(pathname: string, role: string) {
  if (ACCOUNT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return true;
  }

  const allowedRoutes = roleRoutes[normalizeRole(role)] ?? ["/dashboard"];
  return allowedRoutes.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function unauthorizedResponse(isApi: boolean, request: NextRequest) {
  if (isApi) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 }
    );
  }

  return NextResponse.redirect(new URL("/connexion", request.url));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;
  let session: SessionPayload | null = null;

  if (token && secret) {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(secret)
      );
      session = {
        userId: payload.userId,
        roleId: payload.roleId,
        role: payload.role,
      };
    } catch {
      session = null;
    }
  }

  if (PUBLIC_PATHS.has(pathname)) {
    if (session && pathname !== "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (pathname === "/" && session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/connexion", request.url));
    }
    return NextResponse.next();
  }

  const isApi = pathname.startsWith("/api/");
  if (
    !session ||
    typeof session.userId !== "string" ||
    typeof session.roleId !== "string" ||
    typeof session.role !== "string"
  ) {
    return unauthorizedResponse(isApi, request);
  }

  const routePath = isApi ? pathname.slice("/api".length) : pathname;
  if (!hasRouteAccess(routePath, session.role)) {
    if (isApi) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
