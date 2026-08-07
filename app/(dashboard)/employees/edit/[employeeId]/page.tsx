"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

import {
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    MapPin,
    Shield,
    Loader2,
} from "lucide-react";

export default function EditEmployeePage() {
    const router = useRouter();
    const { employeeId } = useParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const pages = [
        { id: "dashboard", label: "Dashboard" },
        { id: "companies", label: "Companies" },
        { id: "employees", label: "Employees" },
        { id: "tasks", label: "Tasks" },
        { id: "meetings", label: "Meetings" },
        { id: "followups", label: "Follow Ups" },
        { id: "reports", label: "Reports" },
        { id: "notifications", label: "Notifications" },
        { id: "settings", label: "Settings" },
        { id: "app-errors", label: "App Errors" },
    ];

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        designation: "",
        department: "",
        role: "Executive",
        status: "Active",
        joiningDate: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
        pageAccess: [] as string[],
    });

    useEffect(() => {
        async function loadEmployee() {
            try {
                const res = await fetch(`/api/employees/${employeeId}`, {
                    credentials: "include",
                });

                const data = await res.json();

                if (!data.success) {
                    alert(data.message);
                    router.push("/employees");
                    return;
                }

                setForm({
                    firstName: data.employee.firstName || "",
                    lastName: data.employee.lastName || "",
                    email: data.employee.email || "",
                    mobile: data.employee.mobile || "",
                    designation: data.employee.designation || "",
                    department: data.employee.department || "",
                    role: data.employee.role || "Executive",
                    status: data.employee.status || "Active",
                    joiningDate: data.employee.joiningDate || "",
                    dateOfBirth: data.employee.dateOfBirth || "",
                    gender: data.employee.gender || "",
                    address: data.employee.address || "",
                    city: data.employee.city || "",
                    state: data.employee.state || "",
                    pincode: data.employee.pincode || "",
                    country: data.employee.country || "",
                    pageAccess: data.employee.pageAccess || [],
                });
            } catch (error) {
                console.error(error);
                alert("Unable to load employee.");
            } finally {
                setLoading(false);
            }
        }

        if (employeeId) {
            loadEmployee();
        }
    }, [employeeId, router]);

    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function togglePage(page: string) {
        if (form.pageAccess.includes(page)) {
            setForm({
                ...form,
                pageAccess: form.pageAccess.filter((p) => p !== page),
            });
        } else {
            setForm({
                ...form,
                pageAccess: [...form.pageAccess, page],
            });
        }
    }

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setSaving(true);

        try {
            const res = await fetch(
                `/api/employees/${employeeId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(form),
                }
            );

            const data = await res.json();

            if (!data.success) {
                alert(data.message);
                return;
            }

            alert("Employee updated successfully.");

            router.push("/employees");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Unable to update employee.");
        } finally {
            setSaving(false);
        }
    }

    const fullName =
        [form.firstName, form.lastName]
            .filter(Boolean)
            .join(" ") || "Employee";

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950">
                <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}

                <div className="mb-8 flex items-center gap-4">

                    <Link
                        href="/employees"
                        className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-white hover:bg-slate-800"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div>

                        <div className="flex items-center gap-3">

                            <User className="text-cyan-400" size={28} />

                            <h1 className="text-3xl font-bold text-white">
                                Edit Employee
                            </h1>

                        </div>

                        <p className="mt-1 text-slate-400">
                            Update employee details and page access.
                        </p>

                    </div>

                </div>

                <div className="grid gap-8 lg:grid-cols-5">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-8 rounded-3xl border border-slate-800 bg-zinc-900 p-6 lg:col-span-3 md:p-8"
                    >
                        {/* ===================== PERSONAL DETAILS ===================== */}
                        <section>
                            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white">
                                <User size={20} className="text-cyan-400" />
                                Personal Details
                            </h2>

                            <div className="grid gap-5 sm:grid-cols-2">

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        First Name *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleChange}
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Last Name *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleChange}
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Email *
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Mobile
                                    </label>
                                    <input
                                        type="text"
                                        name="mobile"
                                        value={form.mobile}
                                        onChange={handleChange}
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={form.dateOfBirth}
                                        onChange={handleChange}
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Gender
                                    </label>

                                    <select
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleChange}
                                        className="input"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                            </div>
                        </section>

                        {/* ===================== JOB DETAILS ===================== */}

                        <section>
                            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white">
                                <Briefcase size={20} className="text-cyan-400" />
                                Job Details
                            </h2>

                            <div className="grid gap-5 sm:grid-cols-2">

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Designation
                                    </label>

                                    <select
                                        name="designation"
                                        value={form.designation}
                                        onChange={handleChange}
                                        className="input"
                                    >
                                        <option value="">Select Designation</option>
                                        <option value="Development Manager">Development Manager</option>
                                        <option value="Document Verification">Document Verification</option>
                                        <option value="Intern Part-Time">Intern Part-Time</option>
                                        <option value="Sales Intern">Sales Intern</option>
                                        <option value="Admin desk">Admin desk</option>
                                        <option value="Software Developer">Software Developer</option>
                                        <option value="Sales Executive">Sales Executive</option>
                                        <option value="HR">HR</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Department
                                    </label>

                                    <select
                                        name="department"
                                        value={form.department}
                                        onChange={handleChange}
                                        className="input"
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Engineering & Marketing">
                                            Engineering & Marketing
                                        </option>
                                        <option value="Sales">Sales</option>
                                        <option value="HR">HR</option>
                                        <option value="Operations">Operations</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Administration">Administration</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Role
                                    </label>

                                    <select
                                        name="role"
                                        value={form.role}
                                        onChange={handleChange}
                                        className="input"
                                    >
                                        <option value="Executive">Executive</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="input"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Joining Date
                                    </label>

                                    <input
                                        type="date"
                                        name="joiningDate"
                                        value={form.joiningDate}
                                        onChange={handleChange}
                                        className="input"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ===================== PAGE ACCESS ===================== */}

                        <section>
                            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white">
                                <Shield size={20} className="text-cyan-400" />
                                Page Access
                            </h2>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {pages.map((page) => (
                                    <label
                                        key={page.id}
                                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-zinc-950 p-3 hover:border-cyan-500"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.pageAccess.includes(page.id)}
                                            onChange={() => togglePage(page.id)}
                                        />

                                        <span className="text-white">
                                            {page.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        {/* ===================== ADDRESS ===================== */}

                        <section>
                            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white">
                                <MapPin size={20} className="text-cyan-400" />
                                Address
                            </h2>

                            <div className="space-y-5">
                                <textarea
                                    rows={3}
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    className="input resize-none"
                                    placeholder="Full Address"
                                />

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <input
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        className="input"
                                    />

                                    <input
                                        name="state"
                                        value={form.state}
                                        onChange={handleChange}
                                        placeholder="State"
                                        className="input"
                                    />

                                    <input
                                        name="pincode"
                                        value={form.pincode}
                                        onChange={handleChange}
                                        placeholder="Pincode"
                                        className="input"
                                    />

                                    <input
                                        name="country"
                                        value={form.country}
                                        onChange={handleChange}
                                        placeholder="Country"
                                        className="input"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end gap-3 border-t border-slate-800 pt-6">
                            <Link
                                href="/employees"
                                className="rounded-xl border border-slate-700 px-6 py-3 text-white hover:bg-slate-800"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-xl bg-cyan-500 px-8 py-3 font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <style jsx>{`
        .input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgb(51 65 85);
          background: rgb(9 9 11);
          color: white;
          padding: 12px 14px;
        }

        .input:focus {
          outline: none;
          border-color: rgb(6 182 212);
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
        }
      `}</style>
        </div>
    );
}
