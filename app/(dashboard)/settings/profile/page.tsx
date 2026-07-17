"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Mail, Phone, Building2, Briefcase, Save } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    designation: "",
    department: "",
    role: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();

      if (data.success) {
        setForm({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          email: data.user.email || "",
          mobile: data.user.mobile || "",
          designation: data.user.designation || "",
          department: data.user.department || "",
          role: data.user.role || "",
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setPageLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert("Profile updated successfully.");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="p-6 text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-6">

      {/* Header */}

      <div className="flex items-center gap-4 mb-8">

        <Link
          href="/settings"
          className="rounded-xl border border-slate-800 p-2 hover:bg-slate-800"
        >
          <ArrowLeft className="text-white" size={18} />
        </Link>

        <div>

          <h1 className="text-3xl font-bold text-white">
            My Profile
          </h1>

          <p className="text-slate-400">
            Manage your account information
          </p>

        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950 p-6"
      >

        {/* First + Last Name */}

        <div className="grid gap-5 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm text-slate-300">
              First Name
            </label>

            <div className="relative">

              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-white focus:border-cyan-500 outline-none"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm text-slate-300">
              Last Name
            </label>

            <div className="relative">

              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-white focus:border-cyan-500 outline-none"
              />

            </div>

          </div>

        </div>

        {/* Email */}

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Email
          </label>

          <div className="relative">

            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="email"
              name="email"
              value={form.email}
              disabled
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-slate-400"
            />

          </div>

        </div>

        {/* Mobile */}

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Mobile
          </label>

          <div className="relative">

            <Phone
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-white focus:border-cyan-500 outline-none"
            />

          </div>

        </div>

        {/* Designation + Department */}

        <div className="grid gap-5 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm text-slate-300">
              Designation
            </label>

            <div className="relative">

              <Briefcase
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                name="designation"
                value={form.designation}
                disabled
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-slate-400"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm text-slate-300">
              Department
            </label>

            <div className="relative">

              <Building2
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                name="department"
                value={form.department}
                disabled
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-slate-400"
              />

            </div>

          </div>

        </div>

        {/* Role */}

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Role
          </label>

          <input
            type="text"
            value={form.role}
            disabled
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-slate-400"
          />

        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
        >
          <Save size={18} />

          {loading ? "Updating..." : "Update Profile"}

        </button>

      </form>

    </div>
  );
}