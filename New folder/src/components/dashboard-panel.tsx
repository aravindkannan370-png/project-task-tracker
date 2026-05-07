"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type User = { id: string; name: string; email: string; role: string };

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdById: string;
  members: Array<{ user: User }>;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  priority: number;
  project: { id: string; name: string };
  assignee: User | null;
  creator: User;
};

type Metrics = {
  projects: number;
  tasks: number;
  overdueTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  todoTasks: number;
};

export function DashboardPanel({
  user,
  initialProjects,
  initialTasks,
  initialUsers,
  initialMetrics
}: {
  user: User;
  initialProjects: Project[];
  initialTasks: Task[];
  initialUsers: User[];
  initialMetrics: Metrics;
}) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [tasks, setTasks] = useState(initialTasks);
  const [users, setUsers] = useState(initialUsers);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const projectOptions = useMemo(() => projects.map((project) => ({ id: project.id, name: project.name })), [projects]);

  async function refreshAll() {
    const [dashboardResponse, projectsResponse, tasksResponse, usersResponse] = await Promise.all([
      fetch("/api/dashboard", { credentials: "include" }),
      fetch("/api/projects", { credentials: "include" }),
      fetch("/api/tasks", { credentials: "include" }),
      fetch("/api/users", { credentials: "include" })
    ]);

    const dashboardData = await dashboardResponse.json();
    const projectsData = await projectsResponse.json();
    const tasksData = await tasksResponse.json();
    const usersData = await usersResponse.json();

    setMetrics(dashboardData.metrics);
    setProjects(projectsData.projects ?? []);
    setTasks(tasksData.tasks ?? []);
    setUsers(usersData.users ?? []);
    router.refresh();
  }

  async function createProject(formData: FormData) {
    const memberIds = String(formData.get("memberIds") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description"),
        memberIds
      })
    });

    if (!response.ok) {
      setMessage((await response.json().catch(() => null))?.error ?? "Could not create project");
      return;
    }

    setMessage("Project created");
    await refreshAll();
  }

  async function createTask(formData: FormData) {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: formData.get("title"),
        description: formData.get("description"),
        projectId: formData.get("projectId"),
        assigneeId: formData.get("assigneeId") || null,
        dueDate: formData.get("dueDate") ? new Date(String(formData.get("dueDate"))).toISOString() : null,
        priority: Number(formData.get("priority") ?? 2)
      })
    });

    if (!response.ok) {
      setMessage((await response.json().catch(() => null))?.error ?? "Could not create task");
      return;
    }

    setMessage("Task created");
    await refreshAll();
  }

  async function updateTask(taskId: string, status: string) {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      setMessage((await response.json().catch(() => null))?.error ?? "Could not update task");
      return;
    }

    await refreshAll();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-line bg-white/80 p-6 shadow-glow backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-amber-700">Project Task Tracker</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-slate-600">Signed in as {user.name} ({user.role})</p>
        </div>
        <button onClick={logout} className="rounded-2xl border border-line bg-sand px-4 py-2 font-medium text-ink hover:bg-white">
          Sign out
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {[
          ["Projects", metrics.projects],
          ["Tasks", metrics.tasks],
          ["Todo", metrics.todoTasks],
          ["In progress", metrics.inProgressTasks],
          ["Done", metrics.doneTasks],
          ["Overdue", metrics.overdueTasks]
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-3xl border border-line bg-white/75 p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{value as number}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-line bg-white/80 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-ink">Projects</h2>
            <span className="text-sm text-slate-500">{projects.length} loaded</span>
          </div>
          <div className="mt-4 grid gap-4">
            {projects.map((project) => (
              <article key={project.id} className="rounded-3xl border border-line bg-sand/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-ink">{project.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{project.description || "No description"}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">{project.status}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">Team: {project.members.map((member) => member.user.name).join(", ") || "No members"}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-line bg-white/80 p-6">
          <h2 className="text-xl font-semibold text-ink">Create project</h2>
          <form
            className="mt-4 grid gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              setLoading(true);
              await createProject(formData);
              setLoading(false);
              event.currentTarget.reset();
            }}
          >
            <input name="name" placeholder="Project name" required className="rounded-2xl border border-line bg-sand px-4 py-3" />
            <textarea name="description" placeholder="Short description" className="min-h-24 rounded-2xl border border-line bg-sand px-4 py-3" />
            <textarea name="memberIds" placeholder="Member IDs, comma-separated" className="min-h-24 rounded-2xl border border-line bg-sand px-4 py-3" />
            <button disabled={loading} className="rounded-2xl bg-ink px-4 py-3 font-semibold text-white disabled:opacity-60">
              {loading ? "Saving..." : "Create project"}
            </button>
          </form>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-line bg-white/80 p-6">
          <h2 className="text-xl font-semibold text-ink">Create task</h2>
          <form
            className="mt-4 grid gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              setLoading(true);
              await createTask(formData);
              setLoading(false);
              event.currentTarget.reset();
            }}
          >
            <input name="title" placeholder="Task title" required className="rounded-2xl border border-line bg-sand px-4 py-3" />
            <textarea name="description" placeholder="Task details" className="min-h-24 rounded-2xl border border-line bg-sand px-4 py-3" />
            <select name="projectId" required className="rounded-2xl border border-line bg-sand px-4 py-3">
              <option value="">Choose project</option>
              {projectOptions.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <select name="assigneeId" className="rounded-2xl border border-line bg-sand px-4 py-3">
              <option value="">Unassigned</option>
              {users.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <div className="grid gap-3 md:grid-cols-2">
              <input name="dueDate" type="datetime-local" className="rounded-2xl border border-line bg-sand px-4 py-3" />
              <select name="priority" defaultValue="2" className="rounded-2xl border border-line bg-sand px-4 py-3">
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
              </select>
            </div>
            <button disabled={loading} className="rounded-2xl bg-amber-600 px-4 py-3 font-semibold text-white disabled:opacity-60">
              {loading ? "Saving..." : "Create task"}
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-line bg-white/80 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-ink">Tasks</h2>
            <span className="text-sm text-slate-500">Track status live</span>
          </div>
          <div className="mt-4 grid gap-4">
            {tasks.map((task) => {
              const overdue = task.dueDate ? new Date(task.dueDate).getTime() < Date.now() && task.status !== "DONE" : false;

              return (
                <article key={task.id} className="rounded-3xl border border-line bg-sand/60 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-semibold text-ink">{task.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{task.project.name}</p>
                      <p className="mt-2 text-sm text-slate-600">{task.description || "No description"}</p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <p>{task.assignee?.name || "Unassigned"}</p>
                      <p className={overdue ? "font-semibold text-red-700" : ""}>{task.dueDate ? new Date(task.dueDate).toLocaleString() : "No due date"}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <select
                      defaultValue={task.status}
                      onChange={(event) => updateTask(task.id, event.target.value)}
                      className="rounded-2xl border border-line bg-white px-3 py-2"
                    >
                      <option value="TODO">Todo</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="BLOCKED">Blocked</option>
                      <option value="DONE">Done</option>
                    </select>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">Priority {task.priority}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <p className="mt-6 text-sm text-red-700">{message}</p>
    </div>
  );
}
