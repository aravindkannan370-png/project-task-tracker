import { NextResponse } from "next/server";
import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";

export async function GET() {
  await requireUser();

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" }
  });

  return NextResponse.json({ users });
}
