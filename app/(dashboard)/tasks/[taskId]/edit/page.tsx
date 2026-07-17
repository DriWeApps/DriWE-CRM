"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditTaskPage() {
  const { taskId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [task, setTask] = useState<any>({
    title: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
    remarks: "",
  });

  useEffect(() => {
    loadTask();
  }, []);

  async function loadTask() {
    const res = await fetch(`/api/tasks/${taskId}`);
    const data = await res.json();

    if (data.success) {
      setTask(data.task);
    }
  }

 async function save(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  setLoading(true);

  const body = {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    remarks: task.remarks,

    companyId: task.companyId,
    companyName: task.companyName,

    assignedTo: task.assignedTo,
    assignedToName: task.assignedToName,
    assignedToEmail: task.assignedToEmail,

    assignedBy: task.assignedBy,
    assignedByName: task.assignedByName,
  };

  const res = await fetch(`/api/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  setLoading(false);

  if (data.success) {
    alert("Task updated successfully");
    router.push("/tasks");
  } else {
    alert(data.message);
  }
}

  return (
    <div className="mx-auto max-w-3xl p-8">

      <h1 className="mb-8 text-4xl font-bold text-white">
        Edit Task
      </h1>

      <form
        onSubmit={save}
        className="space-y-6 rounded-2xl bg-zinc-900 p-8"
      >

        <div>
          <label className="text-white">
            Title
          </label>

          <input
            value={task.title}
            onChange={(e) =>
              setTask({
                ...task,
                title: e.target.value,
              })
            }
            className="mt-2 w-full rounded-lg bg-zinc-800 p-3 text-white"
          />
        </div>

        <div>
          <label className="text-white">
            Description
          </label>

          <textarea
            rows={5}
            value={task.description}
            onChange={(e) =>
              setTask({
                ...task,
                description: e.target.value,
              })
            }
            className="mt-2 w-full rounded-lg bg-zinc-800 p-3 text-white"
          />
        </div>

        <div>
          <label className="text-white">
            Priority
          </label>

          <select
            value={task.priority}
            onChange={(e) =>
              setTask({
                ...task,
                priority: e.target.value,
              })
            }
            className="mt-2 w-full rounded-lg bg-zinc-800 p-3 text-white"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div>
          <label className="text-white">
            Status
          </label>

          <select
            value={task.status}
            onChange={(e) =>
              setTask({
                ...task,
                status: e.target.value,
              })
            }
            className="mt-2 w-full rounded-lg bg-zinc-800 p-3 text-white"
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>

        <div>
          <label className="text-white">
            Due Date
          </label>

          <input
            type="date"
            value={task.dueDate}
            onChange={(e) =>
              setTask({
                ...task,
                dueDate: e.target.value,
              })
            }
            className="mt-2 w-full rounded-lg bg-zinc-800 p-3 text-white"
          />
        </div>

        <div>
          <label className="text-white">
            Remarks
          </label>

          <textarea
            rows={3}
            value={task.remarks}
            onChange={(e) =>
              setTask({
                ...task,
                remarks: e.target.value,
              })
            }
            className="mt-2 w-full rounded-lg bg-zinc-800 p-3 text-white"
          />
        </div>

        <button
          disabled={loading}
          className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black"
        >
          {loading ? "Updating..." : "Update Task"}
        </button>

      </form>
    </div>
  );
}