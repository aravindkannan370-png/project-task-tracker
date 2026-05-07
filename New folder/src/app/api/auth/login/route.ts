import { NextRequest, NextResponse } from "next/server";
import { createAuthCookie, signSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { loginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const result = loginSchema.safeParse(payload);

  if (!result.success) {
    return jsonError(result.error.issues[0]?.message ?? "Invalid login payload");
  }

  const user = await prisma.user.findUnique({
    where: { email: result.data.email }
  });

  if (!user) {
    return jsonError("Invalid credentials", 401);
  }

  const isValid = await verifyPassword(result.data.password, user.passwordHash);
  if (!isValid) {
    return jsonError("Invalid credentials", 401);
  }

  const token = signSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });

  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });

  response.cookies.set(createAuthCookie(token));
  return response;
}
