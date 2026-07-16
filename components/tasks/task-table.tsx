"use client";

import Link from "next/link";
import { Task } from "@/types/task";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface Props {
  tasks: Task[];
}

export default function TaskTable({ tasks }: Props) {
  async function handleDelete(taskId: string) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      window.location.reload();
    } else {
      alert("Failed to delete task");
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="min-w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-4 text-left">Title</th>
            <th className="p-4 text-left">Company</th>
            <th className="p-4 text-left">Assigned To</th>
            <th className="p-4 text-left">Priority</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Due Date</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr key={task.taskId} className="border-t">
              <td className="p-4">{task.title}</td>
              <td className="p-4">{task.companyName}</td>
              <td className="p-4">{task.assignedToName}</td>

              <td className="p-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    task.priority === "High"
                      ? "bg-red-100 text-red-600"
                      : task.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {task.priority}
                </span>
              </td>

              <td className="p-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    task.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : task.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : task.status === "Cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {task.status}
                </span>
              </td>

              <td className="p-4">{task.dueDate}</td>

              <td className="p-4">
                <div className="flex justify-center gap-3">
                  <Link href={`/tasks/${task.taskId}`}>
                    <Eye className="h-5 w-5 text-blue-600" />
                  </Link>

                  <Link href={`/tasks/${task.taskId}/edit`}>
                    <Pencil className="h-5 w-5 text-yellow-600" />
                  </Link>

                  <button
                    onClick={() => handleDelete(task.taskId)}
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {tasks.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="p-8 text-center text-gray-500"
              >
                No Tasks Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}