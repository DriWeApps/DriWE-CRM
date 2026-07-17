"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Save, Mail, Phone, MapPin, Globe } from "lucide-react";

export default function CompanySettingsPage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    companyEmail: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  useEffect(() => {
    fetchCompany();
  }, []);

  async function fetchCompany() {
    try {
      const res = await fetch("/api/settings/company");
      const data = await res.json();

      if (data.success) {
        setForm(data.company);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch("/api/settings/company", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert("Company information updated successfully.");
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

  return (
    <div className="max-w-5xl p-6">

      {/* Header */}

      <div className="flex items-center gap-4 mb-8">

        <Link
          href="/settings"
          className="rounded-xl border border-slate-800 p-2 hover:bg-slate-800"
        >
          <ArrowLeft className="text-white" size={18} />
        </Link>

        <div>

          <div className="flex items-center gap-3">

            <Building2 size={32} className="text-cyan-400" />

            <h1 className="text-3xl font-bold text-white">
              Company Settings
            </h1>

          </div>

          <p className="mt-2 text-slate-400">
            Manage your company information.
          </p>

        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950 p-6"
      >

        {/* Company Name */}

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Company Name
          </label>

          <div className="relative">

            <Building2
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />

            <input
              type="text"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-white outline-none focus:border-cyan-500"
              required
            />

          </div>

        </div>

        {/* Email + Phone */}

        <div className="grid gap-5 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm text-slate-300">
              Company Email
            </label>

            <div className="relative">

              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />

              <input
                type="email"
                name="companyEmail"
                value={form.companyEmail}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-white outline-none focus:border-cyan-500"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm text-slate-300">
              Phone Number
            </label>

            <div className="relative">

              <Phone
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />

              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-white outline-none focus:border-cyan-500"
              />

            </div>

          </div>

        </div>

        {/* Website */}

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Website
          </label>

          <div className="relative">

            <Globe
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />

            <input
              type="text"
              name="website"
              value={form.website}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-white outline-none focus:border-cyan-500"
            />

          </div>

        </div>

        {/* Address */}

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Address
          </label>

          <textarea
            rows={4}
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-cyan-500"
          />

        </div>

        {/* City + State */}

        <div className="grid gap-5 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm text-slate-300">
              City
            </label>

            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-cyan-500"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm text-slate-300">
              State
            </label>

            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-cyan-500"
            />

          </div>

        </div>

        {/* Country + Pincode */}

        <div className="grid gap-5 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm text-slate-300">
              Country
            </label>

            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-cyan-500"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm text-slate-300">
              Pincode
            </label>

            <input
              type="text"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-cyan-500"
            />

          </div>

        </div>

        {/* Save */}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
        >
          <Save size={18} />

          {loading ? "Saving..." : "Save Changes"}
        </button>

      </form>

    </div>
  );
}