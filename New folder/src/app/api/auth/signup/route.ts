import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { createAuthCookie, hashPassword, signSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { signupSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => null);
    const result = signupSchema.safeParse(payload);

    if (!result.success) {
      return jsonError(result.error.issues[0]?.message ?? "Invalid signup payload");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: result.data.email }
    });

    if (existingUser) {
      return jsonError("Email already in use", 409);
    }

    const userCount = await prisma.user.count();
    const passwordHash = await hashPassword(result.data.password);
    const user = await prisma.user.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        passwordHash,
        role: userCount === 0 ? Role.ADMIN : Role.MEMBER
      }
    });

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
    console.error("Signup failed", error);
    return jsonError("Unable to create your account right now. Please try again.", 500);
  }
}
