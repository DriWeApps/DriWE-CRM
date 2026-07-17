'use client';

import React, { useEffect, useState } from "react";
import { Plus, Loader2, Trash2, UserCog, Search, Mail, Phone } from "lucide-react";

interface Employee {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  designation: string;
  department: string;
  role: string;
  status: string;
  joiningDate: string;
}

interface EmployeeListProps {
  searchTerm?: string;
}

export default function EmployeeList({ searchTerm = "" }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobile: "",
    designation: "",
    department: "",
    role: "Executive",
    status: "Active",
    joiningDate: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  async function fetchEmployees() {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : data.employees || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
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
      alert("Only admins can add employees.");
      return;
    }

    if (!form.password.trim()) {
      alert("Please enter a password for the employee login.");
      return;
    }

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({
        firstName: "", lastName: "", email: "", password: "", mobile: "", designation: "",
        department: "", role: "Executive", status: "Active", joiningDate: "",
        address: "", city: "", state: "", pincode: "",
      });
      fetchEmployees();
    } else {
      const data = await res.json();
      alert(data.message || "Unable to create employee");
    }
  }

  async function handleDelete(employeeId: string) {
    if (!isAdmin) {
      alert("Only admins can delete employees.");
      return;
    }
    if (!confirm("Delete this employee?")) return;

    const res = await fetch(`/api/employees/${employeeId}`, { method: "DELETE" });
    if (res.ok) fetchEmployees();
    else {
      const data = await res.json();
      alert(data.message || "Unable to delete employee");
    }
  }

  // Filter employees based on search term
  const filteredEmployees = employees.filter((emp) =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-3xl border border-slate-800 bg-zinc-900/50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-slate-400">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] p-6">
      {/* Left: Employee List */}
      <div className="rounded-3xl border border-slate-800 bg-zinc-900/70 p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Team Roster</h2>
            <p className="text-sm text-slate-400">Manage your active team members</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1 text-sm text-violet-300">
            <UserCog className="h-4 w-4" />
            {isAdmin ? "Admin Access" : "View Only"}
          </div>
        </div>

        <div className="space-y-3">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.employeeId}
              className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-zinc-950 p-5 hover:border-violet-500/30 transition-all"
            >
              <div className="flex-1">
                <div className="font-semibold text-white text-lg">
                  {employee.firstName} {employee.lastName}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                  <a href={`mailto:${employee.email}`} className="flex items-center gap-1 hover:text-white">
                    <Mail className="h-4 w-4" /> {employee.email}
                  </a>
                  {employee.mobile && (
                    <a href={`tel:${employee.mobile}`} className="flex items-center gap-1 hover:text-white">
                      <Phone className="h-4 w-4" /> {employee.mobile}
                    </a>
                  )}
                </div>
                <div className="mt-2 text-xs uppercase tracking-widest text-violet-400">
                  {employee.designation} • {employee.department}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-4 py-1 text-xs font-medium ${
                    employee.status === "Active"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {employee.status}
                </span>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(employee.employeeId)}
                    className="rounded-xl p-3 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-400 transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredEmployees.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-700 py-16 text-center">
              <p className="text-slate-400">
                {searchTerm ? "No matching employees found." : "No employees yet."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Add Employee Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-800 bg-zinc-900/70 p-6 shadow-xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <Plus className="h-6 w-6 text-emerald-400" />
          <h2 className="text-2xl font-semibold text-white">Add New Employee</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
          />
          <input
            className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            required
          />
          <input
            className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
            placeholder="Email Address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
            placeholder="Login Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <input
            className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            required
          />
          <input
            className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
            placeholder="Designation"
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
            required
          />
          <input
            className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            required
          />

          <select
            className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="Executive">Executive</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>

          <select
            className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <input
            className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none md:col-span-2"
            placeholder="Joining Date"
            type="date"
            value={form.joiningDate}
            onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
          />

          <input
            className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none md:col-span-2"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <input
            className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <input
            className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
            placeholder="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
          <input
            className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
            placeholder="Pincode"
            value={form.pincode}
            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={!isAdmin}
          className="mt-8 w-full rounded-2xl bg-emerald-600 py-3.5 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 transition-all active:scale-[0.985]"
        >
          {isAdmin ? "Add New Employee" : "Admin Access Required"}
        </button>
      </form>
    </div>
  );
}