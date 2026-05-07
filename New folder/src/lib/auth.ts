import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

const COOKIE_NAME = "ptt_session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function signSession(user: SessionUser) {
  return jwt.sign(user, process.env.JWT_SECRET ?? "dev-secret", { expiresIn: "7d" });
}

export function verifySession(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET ?? "dev-secret") as SessionUser;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const session = verifySession(token);
    const user = await prisma.user.findUnique({ where: { id: session.id } });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    } satisfies SessionUser;
  } catch {
    return null;
  }
}

export function createAuthCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7
    }
  };
}

export function clearAuthCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0
    }
  };
}
