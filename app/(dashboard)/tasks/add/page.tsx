"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, ClipboardList } from "lucide-react";


interface Employee {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
}
export default function AddTaskPage() {
    const [loading, setLoading] = useState(false);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] =
        useState<Employee | null>(null);

    useEffect(() => {
        async function loadEmployees() {
            try {
                const res = await fetch("/api/employees");
                const data = await res.json();

                if (Array.isArray(data)) {
                    setEmployees(data);
                } else if (data.employees) {
                    setEmployees(data.employees);
                }
            } catch (err) {
                console.error(err);
            }
        }

        loadEmployees();
    }, []);
   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  setLoading(true);

  const formData = new FormData(e.currentTarget);

  try {
    // Get logged-in admin
    const meRes = await fetch("/api/auth/me");
    const me = await meRes.json();

    const body = {
      title: formData.get("title"),
      description: formData.get("description"),

      assignedTo: formData.get("assignedTo"),
      assignedToName: formData.get("assignedToName"),
      assignedToEmail: formData.get("assignedToEmail"),

      assignedBy: me.user.userId,
      assignedByName: me.user.name,

      priority: formData.get("priority"),

      // Every new task starts as Pending
      status: "Pending",

      dueDate: formData.get("dueDate"),

      remarks: "",
    };

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.success) {
      alert("Task created successfully.");
      window.location.href = "/tasks";
    } else {
      alert(data.message || "Failed to create task.");
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong.");
  } finally {
    setLoading(false);
  }
}
    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Header */}
            <div className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
                <div className="flex w-full items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600">
                            <ClipboardList className="h-5 w-5 text-black" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold text-white">
                                Create New Task
                            </h1>
                            <p className="text-sm text-zinc-400">
                                Assign work to your employees
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/tasks"
                        className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-white hover:bg-zinc-900"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </Link>
                </div>
            </div>

            <div className="w-full px-6 py-8">
                <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Task Title */}
                        <div>
                            <label className="mb-2 block text-sm text-zinc-300">
                                Task Title
                            </label>

                            <input
                                name="title"
                                required
                                placeholder="Enter task title"
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-2 block text-sm text-zinc-300">
                                Description
                            </label>

                            <textarea
                                name="description"
                                rows={5}
                                placeholder="Task description..."
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                            />
                        </div>

                        {/* Employee */}
                        <div>
                            <label className="mb-2 block text-sm text-zinc-300">
                                Assign To
                            </label>

                            <select
                                required
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                                onChange={(e) => {
                                    const employee = employees.find(
                                        (emp) => emp.employeeId === e.target.value
                                    );

                                    setSelectedEmployee(employee || null);
                                }}
                            >
                                <option value="">Select Employee Email</option>

                                {employees.map((employee) => (
                                    <option
                                        key={employee.employeeId}
                                        value={employee.employeeId}
                                    >
                                        {employee.email}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="hidden"
                                name="assignedTo"
                                value={selectedEmployee?.employeeId || ""}
                            />

                            <input
                                type="hidden"
                                name="assignedToName"
                                value={
                                    selectedEmployee
                                        ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
                                        : ""
                                }
                            />

                            <input
                                type="hidden"
                                name="assignedToEmail"
                                value={selectedEmployee?.email || ""}
                            />
                        </div>

                        {/* Row */}
                        <div className="grid gap-6 md:grid-cols-3">
                            <div>
                                <label className="mb-2 block text-sm text-zinc-300">
                                    Priority
                                </label>

                                <select
                                    name="priority"
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-zinc-300">
                                    Status
                                </label>

                                <select
                                    name="status"
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
                                >
                                    <option>Pending</option>
                                    <option>In Progress</option>
                                    <option>Completed</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-zinc-300">
                                    Due Date
                                </label>

                                <input
                                    type="date"
                                    name="dueDate"
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-4 pt-6">
                            <Link
                                href="/tasks"
                                className="rounded-xl border border-zinc-700 px-6 py-3 text-white hover:bg-zinc-800"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
                            >
                                <Save size={18} />

                                {loading ? "Saving..." : "Create Task"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}