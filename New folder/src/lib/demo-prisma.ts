import bcrypt from "bcryptjs";
import { Role, TaskStatus } from "@prisma/client";

type DemoUserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
};

type DemoProjectRecord = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  memberIds: string[];
};

type DemoTaskRecord = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number;
  dueDate: Date | null;
  projectId: string;
  assigneeId: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
};

type DemoState = {
  users: DemoUserRecord[];
  projects: DemoProjectRecord[];
  tasks: DemoTaskRecord[];
  nextUserId: number;
  nextProjectId: number;
  nextTaskId: number;
};

const globalForDemo = globalThis as unknown as {
  demoPrismaState?: DemoState;
};

function createInitialState(): DemoState {
  const adminPassword = bcrypt.hashSync("Admin123!", 12);
  const memberPassword = bcrypt.hashSync("Member123!", 12);
  const now = new Date();

  return {
    users: [
      {
        id: "demo-admin",
        name: "Admin User",
        email: "admin@tracker.dev",
        passwordHash: adminPassword,
        role: Role.ADMIN
      },
      {
        id: "demo-member",
        name: "Member User",
        email: "member@tracker.dev",
        passwordHash: memberPassword,
        role: Role.MEMBER
      }
    ],
    projects: [
      {
        id: "seed-project",
        name: "Website Redesign",
        description: "Track product work from planning through launch.",
        status: "Active",
        createdById: "demo-admin",
        createdAt: now,
        updatedAt: now,
        memberIds: ["demo-admin", "demo-member"]
      }
    ],
    tasks: [
      {
        id: "demo-task-1",
        title: "Create wireframes",
        description: "Draft the first dashboard layout.",
        status: TaskStatus.IN_PROGRESS,
        priority: 3,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        projectId: "seed-project",
        assigneeId: "demo-member",
        createdById: "demo-admin",
        createdAt: now,
        updatedAt: now
      },
      {
        id: "demo-task-2",
        title: "Prepare launch checklist",
        description: "Confirm deployment and QA steps.",
        status: TaskStatus.TODO,
        priority: 2,
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
        projectId: "seed-project",
        assigneeId: "demo-admin",
        createdById: "demo-admin",
        createdAt: now,
        updatedAt: now
      }
    ],
    nextUserId: 3,
    nextProjectId: 2,
    nextTaskId: 3
  };
}

function getState() {
  if (!globalForDemo.demoPrismaState) {
    globalForDemo.demoPrismaState = createInitialState();
  }

  return globalForDemo.demoPrismaState;
}

function cloneUser(user: DemoUserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function cloneProject(project: DemoProjectRecord) {
  const state = getState();
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    createdById: project.createdById,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    members: project.memberIds.map((userId) => ({
      user: cloneUser(state.users.find((user) => user.id === userId) ?? state.users[0])
    })),
    tasks: state.tasks
      .filter((task) => task.projectId === project.id)
      .map((task) => cloneTask(task))
  };
}

function cloneTask(task: DemoTaskRecord) {
  const state = getState();
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    project: {
      id: task.projectId,
      name: state.projects.find((project) => project.id === task.projectId)?.name ?? "Unknown project"
    },
    assignee: task.assigneeId ? cloneUser(state.users.find((user) => user.id === task.assigneeId) ?? state.users[0]) : null,
    creator: cloneUser(state.users.find((user) => user.id === task.createdById) ?? state.users[0]),
    createdById: task.createdById,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
}

function matchesProjectFilter(project: DemoProjectRecord, where: any) {
  if (!where || Object.keys(where).length === 0) {
    return true;
  }

  if (where.id && project.id !== where.id) {
    return false;
  }

  const memberUserId = where.members?.some?.userId;
  if (memberUserId && !project.memberIds.includes(memberUserId)) {
    return false;
  }

  return true;
}

function matchesTaskFilter(task: DemoTaskRecord, where: any) {
  if (!where || Object.keys(where).length === 0) {
    return true;
  }

  if (where.id && task.id !== where.id) {
    return false;
  }

  if (where.status?.not && task.status === where.status.not) {
    return false;
  }

  if (where.status && where.status.equals && task.status !== where.status.equals) {
    return false;
  }

  if (where.status && !where.status.not && typeof where.status === "string" && task.status !== where.status) {
    return false;
  }

  if (where.dueDate?.lt && task.dueDate && !(task.dueDate < new Date(where.dueDate.lt))) {
    return false;
  }

  const projectMemberUserId = where.project?.members?.some?.userId;
  if (projectMemberUserId) {
    const project = getState().projects.find((entry) => entry.id === task.projectId);
    if (!project || !project.memberIds.includes(projectMemberUserId)) {
      return false;
    }
  }

  return true;
}

function applyUserSelect(user: DemoUserRecord, select: Record<string, boolean> | undefined) {
  if (!select) {
    return cloneUser(user);
  }

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(select)) {
    if (select[key]) {
      result[key] = key === "role" ? user.role : (user as Record<string, unknown>)[key];
    }
  }

  return result;
}

function createProjectShape(project: DemoProjectRecord, include: any = {}) {
  const state = getState();
  const users = state.users;

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    createdById: project.createdById,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    members: include.members
      ? project.memberIds.map((userId) => ({
          user: applyUserSelect(users.find((user) => user.id === userId) ?? users[0], include.members.include?.user?.select)
        }))
      : undefined,
    tasks: include.tasks
      ? state.tasks.filter((task) => task.projectId === project.id).map((task) => cloneTask(task))
      : undefined
  };
}

function createTaskShape(task: DemoTaskRecord, include: any = {}) {
  const state = getState();
  const project = state.projects.find((entry) => entry.id === task.projectId) ?? state.projects[0];
  const assignee = task.assigneeId ? state.users.find((user) => user.id === task.assigneeId) ?? null : null;
  const creator = state.users.find((user) => user.id === task.createdById) ?? state.users[0];

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    project: include.project ? createProjectShape(project, include.project.include ?? {}) : { id: project.id, name: project.name },
    assignee: include.assignee
      ? assignee
        ? applyUserSelect(assignee, include.assignee.select)
        : null
      : task.assigneeId
        ? cloneUser(assignee ?? creator)
        : null,
    creator: include.creator ? applyUserSelect(creator, include.creator.select) : cloneUser(creator),
    createdById: task.createdById,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
}

function getProjectById(projectId: string) {
  return getState().projects.find((project) => project.id === projectId) ?? null;
}

function getTaskById(taskId: string) {
  return getState().tasks.find((task) => task.id === taskId) ?? null;
}

function generateId(prefix: string, counter: number) {
  return `${prefix}-${counter}`;
}

function createDemoProject(data: any) {
  const state = getState();
  const now = new Date();
  const project: DemoProjectRecord = {
    id: generateId("demo-project", state.nextProjectId++),
    name: data.name,
    description: data.description ?? null,
    status: "Active",
    createdById: data.createdById,
    createdAt: now,
    updatedAt: now,
    memberIds: Array.from(new Set([data.createdById, ...(data.members?.create?.map((member: any) => member.userId) ?? [])]))
  };

  state.projects.push(project);
  return project;
}

function createDemoTask(data: any) {
  const state = getState();
  const now = new Date();
  const task: DemoTaskRecord = {
    id: generateId("demo-task", state.nextTaskId++),
    title: data.title,
    description: data.description ?? null,
    status: data.status ?? TaskStatus.TODO,
    priority: data.priority ?? 2,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    projectId: data.projectId,
    assigneeId: data.assigneeId ?? null,
    createdById: data.createdById,
    createdAt: now,
    updatedAt: now
  };

  state.tasks.push(task);
  return task;
}

function replaceProjectMembers(projectId: string, memberIds: string[]) {
  const project = getProjectById(projectId);
  if (!project) return null;

  project.memberIds = Array.from(new Set(memberIds));
  project.updatedAt = new Date();
  return project;
}

function updateTask(taskId: string, data: Partial<DemoTaskRecord>) {
  const task = getTaskById(taskId);
  if (!task) return null;

  Object.assign(task, data, { updatedAt: new Date() });
  return task;
}

function createDemoUser(data: any) {
  const state = getState();
  const user: DemoUserRecord = {
    id: generateId("demo-user", state.nextUserId++),
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    role: data.role ?? Role.MEMBER
  };

  state.users.push(user);
  return user;
}

export function isDemoMode() {
  return !process.env.DATABASE_URL;
}

export function createDemoPrismaClient() {
  const user = {
    findUnique: async ({ where, select }: any) => {
      const state = getState();
      const record = state.users.find((entry) => (where?.email ? entry.email === where.email : where?.id ? entry.id === where.id : false));
      if (!record) return null;
      return select ? applyUserSelect(record, select) : cloneUser(record);
    },
    findMany: async ({ select, orderBy }: any = {}) => {
      const state = getState();
      const records = [...state.users];
      if (orderBy?.name === "asc") {
        records.sort((left, right) => left.name.localeCompare(right.name));
      }
      return records.map((record) => (select ? applyUserSelect(record, select) : cloneUser(record)));
    },
    count: async () => getState().users.length,
    create: async ({ data }: any) => {
      const userRecord = createDemoUser(data);
      return cloneUser(userRecord);
    }
  };

  const project = {
    findMany: async ({ where = {}, include = {}, orderBy }: any = {}) => {
      const records = getState().projects.filter((record) => matchesProjectFilter(record, where));
      if (orderBy?.updatedAt === "desc") {
        records.sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime());
      }
      return records.map((record) => createProjectShape(record, include));
    },
    findUnique: async ({ where, include = {} }: any) => {
      const record = where?.id ? getProjectById(where.id) : null;
      return record ? createProjectShape(record, include) : null;
    },
    count: async ({ where = {} }: any = {}) => getState().projects.filter((record) => matchesProjectFilter(record, where)).length,
    create: async ({ data, include = {} }: any) => {
      const record = createDemoProject(data);
      return createProjectShape(record, include);
    },
    upsert: async ({ where, create, include = {} }: any) => {
      const existing = where?.id ? getProjectById(where.id) : null;
      const record = existing ?? createDemoProject(create);
      return createProjectShape(record, include);
    }
  };

  const projectMember = {
    findUnique: async ({ where }: any) => {
      const project = getProjectById(where.projectId_userId.projectId);
      return project?.memberIds.includes(where.projectId_userId.userId) ? { id: `${project.id}:${where.projectId_userId.userId}` } : null;
    },
    deleteMany: async ({ where }: any) => {
      const project = getProjectById(where.projectId);
      if (!project) return { count: 0 };
      project.memberIds = [];
      project.updatedAt = new Date();
      return { count: 1 };
    },
    createMany: async ({ data }: any) => {
      let count = 0;
      for (const row of data) {
        const project = getProjectById(row.projectId);
        if (!project) continue;
        if (!project.memberIds.includes(row.userId)) {
          project.memberIds.push(row.userId);
          count += 1;
        }
      }
      return { count };
    }
  };

  const task = {
    findMany: async ({ where = {}, include = {}, orderBy }: any = {}) => {
      const records = getState().tasks.filter((record) => matchesTaskFilter(record, where));
      records.sort((left, right) => {
        const leftDue = left.dueDate ? left.dueDate.getTime() : Number.POSITIVE_INFINITY;
        const rightDue = right.dueDate ? right.dueDate.getTime() : Number.POSITIVE_INFINITY;
        if (leftDue !== rightDue) return leftDue - rightDue;
        return right.updatedAt.getTime() - left.updatedAt.getTime();
      });
      return records.map((record) => createTaskShape(record, include));
    },
    findUnique: async ({ where, include = {} }: any) => {
      const record = where?.id ? getTaskById(where.id) : null;
      return record ? createTaskShape(record, include) : null;
    },
    count: async ({ where = {} }: any = {}) => getState().tasks.filter((record) => matchesTaskFilter(record, where)).length,
    createMany: async ({ data }: any) => {
      for (const row of data) {
        createDemoTask(row);
      }
      return { count: data.length };
    },
    create: async ({ data, include = {} }: any) => createTaskShape(createDemoTask(data), include),
    update: async ({ where, data, include = {} }: any) => {
      const record = where?.id ? updateTask(where.id, data) : null;
      return record ? createTaskShape(record, include) : null;
    }
  };

  return {
    user,
    project,
    projectMember,
    task,
    $disconnect: async () => undefined
  };
}

export function demoAuthLookup(email: string) {
  return getState().users.find((user) => user.email === email) ?? null;
}

export function demoVerifyPassword(email: string, password: string) {
  const user = demoAuthLookup(email);
  return Boolean(user && bcrypt.compareSync(password, user.passwordHash));
}
