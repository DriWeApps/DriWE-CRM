import TaskTable from "@/components/tasks/task-table";
import Link from "next/link";

async function getTasks() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/tasks`,
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Task Management
        </h1>

        <Link
          href="/tasks/add"
          className="rounded-lg bg-blue-600 px-5 py-2 text-white"
        >
          + Add Task
        </Link>
      </div>

      <TaskTable tasks={tasks} />
    </div>
  );
}