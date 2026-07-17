"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Company {
  companyId: string;
  companyName: string;
}

interface Employee {
  employeeId: string;
  firstName: string;
  lastName: string;
}

export default function TaskForm() {
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    companyId: "",
    assignedTo: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
    remarks: "",
  });

  useEffect(() => {
    async function loadData() {
      const companyRes = await fetch("/api/companies");
      const employeeRes = await fetch("/api/employees");

      setCompanies(await companyRes.json());
      setEmployees(await employeeRes.json());
    }

    loadData();
  }, []);

  useEffect(() => {
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

    loadUser();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isAdmin) {
      alert("Only admins can create tasks.");
      return;
    }

    const company = companies.find(
      (c) => c.companyId === form.companyId
    );

    const employee = employees.find(
      (e) => e.employeeId === form.assignedTo
    );

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        companyName: company?.companyName,
        assignedToName: employee
          ? `${employee.firstName} ${employee.lastName}`
          : "",
        assignedBy: "admin",
        assignedByName: "Administrator",
      }),
    });

    if (res.ok) {
      alert("Task Created Successfully");
      router.push("/tasks");
      router.refresh();
    } else {
      alert("Unable to create task");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-lg border bg-white p-6"
    >
      <h2 className="text-2xl font-bold">
        Create Task
      </h2>

      <input
        className="w-full rounded border p-3"
        placeholder="Task Title"
        value={form.title}
        onChange={(e) =>
          setForm({ ...form, title: e.target.value })
        }
      />

      <textarea
        className="w-full rounded border p-3"
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          setForm({
            ...form,
            description: e.target.value,
          })
        }
      />

      <select
        className="w-full rounded border p-3"
        value={form.companyId}
        onChange={(e) =>
          setForm({
            ...form,
            companyId: e.target.value,
          })
        }
      >
        <option value="">Select Company</option>

        {companies.map((company) => (
          <option
            key={company.companyId}
            value={company.companyId}
          >
            {company.companyName}
          </option>
        ))}
      </select>

      <select
        className="w-full rounded border p-3"
        value={form.assignedTo}
        onChange={(e) =>
          setForm({
            ...form,
            assignedTo: e.target.value,
          })
        }
      >
        <option value="">Assign Employee</option>

        {employees.map((employee) => (
          <option
            key={employee.employeeId}
            value={employee.employeeId}
          >
            {employee.firstName} {employee.lastName}
          </option>
        ))}
      </select>

      <select
        className="w-full rounded border p-3"
        value={form.priority}
        onChange={(e) =>
          setForm({
            ...form,
            priority: e.target.value,
          })
        }
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      <input
        type="date"
        className="w-full rounded border p-3"
        value={form.dueDate}
        onChange={(e) =>
          setForm({
            ...form,
            dueDate: e.target.value,
          })
        }
      />

      <textarea
        className="w-full rounded border p-3"
        placeholder="Remarks"
        value={form.remarks}
        onChange={(e) =>
          setForm({
            ...form,
            remarks: e.target.value,
          })
        }
      />

      <button
        className="rounded bg-blue-600 px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!isAdmin}
      >
        {isAdmin ? "Create Task" : "Admin access required"}
      </button>
    </form>
  );
}