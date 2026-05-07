import { Role } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";

export async function requireUser() {
  const user = await getSessionUser();

  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== Role.ADMIN) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
