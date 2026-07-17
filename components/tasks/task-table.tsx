"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Task } from "@/types/task";

export default function TaskTable() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTasks();
        loadUser();
    }, []);

    async function loadTasks() {
        try {
            const res = await fetch("/api/tasks");
            const data = await res.json();

            console.log("Tasks API Response:", data);

            setTasks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    async function loadUser() {
        try {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            const role = data.user?.role?.toString().toLowerCase();
            setIsAdmin(role === "admin");
        } catch (error) {
            console.error(error);
        }
    }

    async function handleDelete(taskId: string) {
        if (!confirm("Delete this task?")) return;

        const res = await fetch(`/api/tasks/${taskId}`, {
            method: "DELETE",
        });

        if (res.ok) {
            loadTasks();
        } else {
            alert("Delete failed");
        }
    }

    if (loading) {
        return (
            <div className="p-8 text-center text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
            <table className="w-full">
                <thead className="bg-zinc-900">
                    <tr>
                        <th className="p-4 text-left">Title</th>
                        <th className="p-4 text-left">Company</th>
                        <th className="p-4 text-left">Assigned To</th>
                        <th className="p-4 text-left">Priority</th>
                        <th className="p-4 text-left">Status</th>
                        <th className="p-4 text-left">Due Date</th>
                        <th className="p-4 text-center">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {tasks.map((task) => (
                        <tr key={task.taskId} className="border-t border-zinc-800">
                            <td className="p-4">{task.title}</td>
                            <td className="p-4">{task.companyName}</td>
                            <td className="p-4">{task.assignedToName}</td>
                            <td className="p-4">{task.priority}</td>
                            <td className="p-4">{task.status}</td>
                            <td className="p-4">{task.dueDate}</td>

                            <td className="p-4">
                                <div className="flex justify-center gap-3">
                                    <Link href={`/tasks/${task.taskId}`}>
                                        <Eye size={18} />
                                    </Link>

                                    <Link href={`/tasks/${task.taskId}/edit`}>
                                        <Pencil size={18} />
                                    </Link>

                                    {isAdmin && (
                                        <button onClick={() => handleDelete(task.taskId)}>
                                            <Trash2 size={18} className="text-red-500" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}

                    {tasks.length === 0 && (
                        <tr>
                            <td colSpan={7} className="p-8 text-center">
                                No Tasks Found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}