"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompanyForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    companyType: "",
    contactPerson: "",
    designation: "",
    mobile: "",
    alternateMobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    panNumber: "",
    website: "",
    assignedEmployeeId: "",
    status: "Active",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      alert("Company Added Successfully");

      router.push("/companies");
    } else {
      alert("Something went wrong");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 max-w-3xl"
    >
      <input
        className="w-full border rounded-lg p-3"
        placeholder="Company Name"
        name="companyName"
        value={form.companyName}
        onChange={handleChange}
      />

      <input
        className="w-full border rounded-lg p-3"
        placeholder="Company Type"
        name="companyType"
        value={form.companyType}
        onChange={handleChange}
      />

      <input
        className="w-full border rounded-lg p-3"
        placeholder="Contact Person"
        name="contactPerson"
        value={form.contactPerson}
        onChange={handleChange}
      />

      <input
        className="w-full border rounded-lg p-3"
        placeholder="Mobile"
        name="mobile"
        value={form.mobile}
        onChange={handleChange}
      />

      <input
        className="w-full border rounded-lg p-3"
        placeholder="Email"
        name="email"
        value={form.email}
        onChange={handleChange}
      />

      <textarea
        className="w-full border rounded-lg p-3"
        placeholder="Address"
        name="address"
        value={form.address}
        onChange={handleChange}
      />

      <div className="grid grid-cols-3 gap-4">
        <input
          className="border rounded-lg p-3"
          placeholder="City"
          name="city"
          value={form.city}
          onChange={handleChange}
        />

        <input
          className="border rounded-lg p-3"
          placeholder="State"
          name="state"
          value={form.state}
          onChange={handleChange}
        />

        <input
          className="border rounded-lg p-3"
          placeholder="Pincode"
          name="pincode"
          value={form.pincode}
          onChange={handleChange}
        />
      </div>

      <button
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Company"}
      </button>
    </form>
  );
}