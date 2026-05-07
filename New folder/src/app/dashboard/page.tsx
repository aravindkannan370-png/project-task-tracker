import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { DashboardPanel } from "@/components/dashboard-panel";

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

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

  const [projects, tasks, users, metrics] = await Promise.all([
    prisma.project.findMany({
      where: projectFilter,
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true }
            }
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.task.findMany({
      where: taskFilter,
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
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" }
    }),
    {
      projects: await prisma.project.count({ where: projectFilter }),
      tasks: await prisma.task.count({ where: taskFilter }),
      overdueTasks: await prisma.task.count({
        where: { ...taskFilter, dueDate: { lt: new Date() }, status: { not: "DONE" } }
      }),
      doneTasks: await prisma.task.count({ where: { ...taskFilter, status: "DONE" } }),
      inProgressTasks: await prisma.task.count({ where: { ...taskFilter, status: "IN_PROGRESS" } }),
      todoTasks: await prisma.task.count({ where: { ...taskFilter, status: "TODO" } })
    }
  ]);

  const serializedProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    createdById: project.createdById,
    members: project.members.map((member) => ({
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.user.role
      }
    }))
  }));

  const serializedTasks = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    priority: task.priority,
    project: {
      id: task.project.id,
      name: task.project.name
    },
    assignee: task.assignee
      ? {
          id: task.assignee.id,
          name: task.assignee.name,
          email: task.assignee.email,
          role: task.assignee.role
        }
      : null,
    creator: {
      id: task.creator.id,
      name: task.creator.name,
      email: task.creator.email,
      role: task.creator.role
    }
  }));

  return (
    <DashboardPanel
      user={user}
      initialProjects={serializedProjects}
      initialTasks={serializedTasks}
      initialUsers={users}
      initialMetrics={metrics}
    />
  );
}
