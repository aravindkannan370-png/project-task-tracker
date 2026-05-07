import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { requireUser } from "@/lib/rbac";
import { taskSchema } from "@/lib/validators";

async function canAccessProject(userId: string, role: string, projectId: string) {
  if (role === "ADMIN") return true;

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    }
  });

  return Boolean(membership);
}

export async function GET() {
  const user = await requireUser();
  const tasks = await prisma.task.findMany({
    where:
      user.role === "ADMIN"
        ? {}
        : {
            project: {
              members: {
                some: {
                  userId: user.id
                }
              }
            }
          },
    include: {
      project: true,
      assignee: {
        select: { id: true, name: true, email: true, role: true }
      },
      creator: {
        select: { id: true, name: true, email: true, role: true }
      }
    },
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }]
  });

  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const payload = await request.json().catch(() => null);
  const result = taskSchema.safeParse(payload);

  if (!result.success) {
    return jsonError(result.error.issues[0]?.message ?? "Invalid task payload");
  }

  const allowed = await canAccessProject(user.id, user.role, result.data.projectId);
  if (!allowed) {
    return jsonError("Forbidden", 403);
  }

  if (result.data.assigneeId) {
    const assigneeAllowed = await canAccessProject(result.data.assigneeId, user.role, result.data.projectId);
    if (!assigneeAllowed) {
      return jsonError("Assignee is not a member of this project", 400);
    }
  }

  const task = await prisma.task.create({
    data: {
      title: result.data.title,
      description: result.data.description,
      projectId: result.data.projectId,
      assigneeId: result.data.assigneeId ?? null,
      createdById: user.id,
      dueDate: result.data.dueDate ? new Date(result.data.dueDate) : null,
      priority: result.data.priority
    },
    include: {
      project: true,
      assignee: true,
      creator: true
    }
  });

  return NextResponse.json({ task }, { status: 201 });
}
