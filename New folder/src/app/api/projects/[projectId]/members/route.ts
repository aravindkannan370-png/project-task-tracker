import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/rbac";
import { jsonError } from "@/lib/http";

export async function POST(request: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  const user = await requireUser();
  const { projectId } = await context.params;
  const payload = await request.json().catch(() => null);
  const memberIds = Array.isArray(payload?.memberIds) ? payload.memberIds.filter(Boolean) : [];

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true }
  });

  if (!project) {
    return jsonError("Project not found", 404);
  }

  const isAdmin = user.role === "ADMIN";
  const isOwner = project.createdById === user.id;
  if (!isAdmin && !isOwner) {
    return jsonError("Forbidden", 403);
  }

  await prisma.projectMember.deleteMany({
    where: { projectId }
  });

  await prisma.projectMember.createMany({
    data: Array.from(new Set([user.id, ...memberIds])).map((memberId) => ({
      projectId,
      userId: memberId
    })),
    skipDuplicates: true
  });

  const updated = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      }
    }
  });

  return NextResponse.json({ project: updated });
}
