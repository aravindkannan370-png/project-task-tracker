import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/rbac";

export async function GET() {
  const user = await requireUser();
  const now = new Date();

  const projectFilter =
    user.role === "ADMIN"
      ? {}
      : {
          members: {
            some: { userId: user.id }
          }
        };

  const taskFilter =
    user.role === "ADMIN"
      ? {}
      : {
          project: {
            members: {
              some: { userId: user.id }
            }
          }
        };

  const [projects, tasks, overdueTasks, doneTasks, inProgressTasks, todoTasks] = await Promise.all([
    prisma.project.count({ where: projectFilter }),
    prisma.task.count({ where: taskFilter }),
    prisma.task.count({
      where: {
        ...taskFilter,
        dueDate: { lt: now },
        status: { not: "DONE" }
      }
    }),
    prisma.task.count({ where: { ...taskFilter, status: "DONE" } }),
    prisma.task.count({ where: { ...taskFilter, status: "IN_PROGRESS" } }),
    prisma.task.count({ where: { ...taskFilter, status: "TODO" } })
  ]);

  return NextResponse.json({
    metrics: {
      projects,
      tasks,
      overdueTasks,
      doneTasks,
      inProgressTasks,
      todoTasks
    }
  });
}
