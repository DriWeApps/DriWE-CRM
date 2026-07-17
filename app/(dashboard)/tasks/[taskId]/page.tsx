"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TaskDetailsPage() {
  const { taskId } = useParams();
  const router = useRouter();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTask();
  }, []);

  async function loadTask() {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      const data = await res.json();

      if (data.success) {
        setTask(data.task);
      } else {
        alert(data.message);
        router.push("/tasks");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="p-10 text-white">
        Loading...
      </div>
    );

  if (!task)
    return (
      <div className="p-10 text-white">
        Task not found
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl p-8">

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">
          Task Details
        </h1>

        <button
          onClick={() => router.push(`/tasks/${taskId}/edit`)}
          className="rounded-xl bg-blue-600 px-5 py-2 text-white"
        >
          Edit
        </button>
      </div>

      <div className="space-y-5 rounded-2xl bg-zinc-900 p-8">

        <Item label="Title" value={task.title} />
        <Item label="Description" value={task.description} />
        <Item label="Assigned To" value={task.assignedToName} />
        <Item label="Assigned Email" value={task.assignedToEmail} />
        <Item label="Company" value={task.companyName} />
        <Item label="Priority" value={task.priority} />
        <Item label="Status" value={task.status} />
        <Item label="Due Date" value={task.dueDate} />
        <Item label="Remarks" value={task.remarks} />

      </div>
    </div>
  );
}

function Item({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div>
      <p className="text-sm text-zinc-400">{label}</p>

      <p className="mt-1 text-lg text-white">
        {value || "-"}
      </p>
    </div>
  );
}