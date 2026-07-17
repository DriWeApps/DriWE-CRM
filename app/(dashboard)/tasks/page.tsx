"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Plus,
  Clock,
  CircleDashed,
} from "lucide-react";

import TaskTable from "@/components/tasks/task-table";
import { Task } from "@/types/task";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();

      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  }

  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  return (
    <div className="min-h-screen bg-zinc-950 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="w-full px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600">
              <CheckSquare className="h-5 w-5 text-black" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-white">
                Task Management
              </h1>

              <p className="text-sm text-zinc-400">
                Manage employee tasks & progress
              </p>
            </div>
          </div>

          <Link
            href="/tasks/add"
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-medium text-black transition hover:bg-zinc-200"
          >
            <Plus size={18} />
            New Task
          </Link>
        </div>
      </div>

      <div className="w-full px-6 pt-8">

        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
            TASK HUB
          </p>

          <h2 className="mt-2 text-5xl font-bold tracking-tight text-white">
            Tasks
          </h2>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Assign, monitor and manage employee tasks with real-time progress.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-5 md:grid-cols-3">

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400">Total Tasks</p>

                <h2 className="mt-2 text-4xl font-bold text-white">
                  {totalTasks}
                </h2>
              </div>

              <CheckSquare className="h-10 w-10 text-emerald-400" />
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400">Pending</p>

                <h2 className="mt-2 text-4xl font-bold text-yellow-400">
                  {pendingTasks}
                </h2>
              </div>

              <Clock className="h-10 w-10 text-yellow-400" />
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400">In Progress</p>

                <h2 className="mt-2 text-4xl font-bold text-cyan-400">
                  {inProgressTasks}
                </h2>
              </div>

              <CircleDashed className="h-10 w-10 text-cyan-400" />
            </div>
          </div>

        </div>

        {/* Table */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-3 shadow-2xl">
          <TaskTable />
        </div>

      </div>
    </div>
  );
}