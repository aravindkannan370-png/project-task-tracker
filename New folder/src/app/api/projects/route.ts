import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { projectSchema } from "@/lib/validators";
import { requireUser } from "@/lib/rbac";

export async function GET() {
  const user = await requireUser();

  const projects = await prisma.project.findMany({
    where:
      user.role === "ADMIN"
        ? {}
        : {
            members: {
              some: {
                userId: user.id
              }
            }
          },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      },
      tasks: true
    },
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const payload = await request.json().catch(() => null);
  const result = projectSchema.safeParse(payload);

  if (!result.success) {
    return jsonError(result.error.issues[0]?.message ?? "Invalid project payload");
  }

  const project = await prisma.project.create({
    data: {
      name: result.data.name,
      description: result.data.description,
      createdById: user.id,
      members: {
        create: [{ userId: user.id }]
      }
    },
    include: {
      members: true
    }
  });

  if (result.data.memberIds.length > 0) {
    await prisma.projectMember.createMany({
      data: result.data.memberIds.map((memberId) => ({
        projectId: project.id,
        userId: memberId
      })),
      skipDuplicates: true
    });
  }

  return NextResponse.json({ project }, { status: 201 });
}
