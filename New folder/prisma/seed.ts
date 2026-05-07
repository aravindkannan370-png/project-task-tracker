import { Role, TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

async function main() {
  const adminPassword = await hashPassword("Admin123!");
  const memberPassword = await hashPassword("Member123!");

  const admin = await prisma.user.upsert({
    where: { email: "admin@tracker.dev" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@tracker.dev",
      passwordHash: adminPassword,
      role: Role.ADMIN
    }
  });

  const member = await prisma.user.upsert({
    where: { email: "member@tracker.dev" },
    update: {},
    create: {
      name: "Member User",
      email: "member@tracker.dev",
      passwordHash: memberPassword,
      role: Role.MEMBER
    }
  });

  const project = await prisma.project.upsert({
    where: { id: "seed-project" },
    update: {},
    create: {
      id: "seed-project",
      name: "Website Redesign",
      description: "Track product work from planning through launch.",
      createdById: admin.id,
      members: {
        create: [{ userId: admin.id }, { userId: member.id }]
      }
    }
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Create wireframes",
        description: "Draft the first dashboard layout.",
        projectId: project.id,
        createdById: admin.id,
        assigneeId: member.id,
        status: TaskStatus.IN_PROGRESS,
        priority: 3,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)
      },
      {
        title: "Prepare launch checklist",
        description: "Confirm deployment and QA steps.",
        projectId: project.id,
        createdById: admin.id,
        assigneeId: admin.id,
        status: TaskStatus.TODO,
        priority: 2,
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24)
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
