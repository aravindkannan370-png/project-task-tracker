import { NextRequest, NextResponse } from "next/server";
import { createAuthCookie, signSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { loginSchema } from "@/lib/validators";
import { demoAuthLookup, demoVerifyPassword, isDemoMode } from "@/lib/demo-prisma";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => null);
    const result = loginSchema.safeParse(payload);

    if (!result.success) {
      return jsonError(result.error.issues[0]?.message ?? "Invalid login payload");
    }

    if (isDemoMode()) {
      const demoUser = demoAuthLookup(result.data.email);

      if (!demoUser || !demoVerifyPassword(result.data.email, result.data.password)) {
        return jsonError("Invalid credentials", 401);
      }

      const token = signSession({
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role
      });

      const response = NextResponse.json({
        user: {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role
        }
      });

      response.cookies.set(createAuthCookie(token));
      return response;
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
  } catch (error) {
    console.error("Login failed", error);
    return jsonError("Unable to sign in right now. Please try again.", 500);
  }
}
