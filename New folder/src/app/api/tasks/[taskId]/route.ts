import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { requireUser } from "@/lib/rbac";
import { statusSchema } from "@/lib/validators";

export async function PATCH(request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  const user = await requireUser();
  const { taskId } = await context.params;
  const payload = await request.json().catch(() => null);
  const result = statusSchema.safeParse(payload);

  if (!result.success) {
    return jsonError(result.error.issues[0]?.message ?? "Invalid task status");
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        include: {
          members: true
        }
      }
    }
  });

  if (!task) {
    return jsonError("Task not found", 404);
  }

  const canEdit =
    user.role === "ADMIN" ||
    task.createdById === user.id ||
    task.assigneeId === user.id ||
    task.project.createdById === user.id;

  if (!canEdit) {
    return jsonError("Forbidden", 403);
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: result.data.status },
    include: {
      project: true,
      assignee: true,
      creator: true
    }
  });

  return NextResponse.json({ task: updated });
}
