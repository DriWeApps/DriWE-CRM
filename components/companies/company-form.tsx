"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Save } from "lucide-react";
import type { Company } from "@/types/company";

interface CompanyFormProps {
  mode?: "create" | "edit";
  company?: Company | null;
  companyId?: string;
}

const defaultForm: Company = {
  companyName: "",
  companyType: "",
  contactPerson: "",
  mobile: "",
  email: "",
  address: "",
  status: "Active",
};
const inputClass =
  "w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";

export default function CompanyForm({
  mode = "create",
  company,
  companyId,
}: CompanyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(mode === "edit" && !company);
  const [form, setForm] = useState<Company>({
    ...defaultForm,
    ...(company ?? {}),
    status: company?.status ?? "Active",
  });

  useEffect(() => {
    if (company) {
      setForm({
        ...defaultForm,
        ...company,
        status: company.status ?? "Active",
      });
    }
  }, [company]);

  useEffect(() => {
    if (mode !== "edit" || company || !companyId) return;

    const loadCompany = async () => {
      try {
        const res = await fetch(`/api/companies/${companyId}`);
        const data = await res.json();
        setForm({
          ...defaultForm,
          ...(data.company ?? {}),
          status: data.company?.status ?? "Active",
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingCompany(false);
      }
    };

    loadCompany();
  }, [company, companyId, mode]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      phone: form.phone ?? form.mobile ?? "",
    };

    const res = await fetch(
      `/api/companies${mode === "edit" && companyId ? `/${companyId}` : ""}`,
      {
        method: mode === "edit" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    setLoading(false);

    if (res.ok) {
      router.push("/companies");
    } else {
      alert("Something went wrong while saving the company.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-5">
    <div className="grid gap-6 md:grid-cols-2">

  {/* Company Name */}
  <div className="space-y-2">
    <label className="text-sm font-medium text-slate-300">
      Company Name
    </label>

    <input
      className={inputClass}
      name="companyName"
      placeholder="Enter company name"
      value={form.companyName}
      onChange={handleChange}
      required
    />
  </div>

  {/* Company Type */}
  <div className="space-y-2">
    <label className="text-sm font-medium text-slate-300">
      Company Type
    </label>

    <input
      className={inputClass}
      name="companyType"
      placeholder="IT, Manufacturing, Finance..."
      value={form.companyType}
      onChange={handleChange}
    />
  </div>

  {/* Contact Person */}
  <div className="space-y-2">
    <label className="text-sm font-medium text-slate-300">
      Contact Person Name
    </label>

    <input
      className={inputClass}
      name="contactPerson"
      placeholder="Enter contact person"
      value={form.contactPerson}
      onChange={handleChange}
    />
  </div>

  {/* Mobile */}
  <div className="space-y-2">
    <label className="text-sm font-medium text-slate-300">
      Mobile Number
    </label>

    <input
      className={inputClass}
      name="mobile"
      placeholder="9876543210"
      value={form.mobile}
      onChange={handleChange}
    />
  </div>

  {/* Email */}
  <div className="space-y-2 md:col-span-2">
    <label className="text-sm font-medium text-slate-300">
      Email
    </label>

    <input
      type="email"
      className={inputClass}
      name="email"
      placeholder="company@example.com"
      value={form.email}
      onChange={handleChange}
    />
  </div>

  {/* Address */}
  <div className="space-y-2 md:col-span-2">
    <label className="text-sm font-medium text-slate-300">
      Address
    </label>

    <textarea
      className={`${inputClass} min-h-28`}
      name="address"
      placeholder="Enter company address"
      value={form.address}
      onChange={handleChange}
    />
  </div>

</div>      <div className="flex items-center gap-3 pt-2">
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading || loadingCompany}
          type="submit"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {mode === "edit" ? "Update company" : "Save company"}
            </>
          )}
        </button>

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Building2 className="h-4 w-4" />
          {mode === "edit" ? "Edit existing client" : "Create a new client profile"}
        </div>
      </div>
    </form>
  );
}