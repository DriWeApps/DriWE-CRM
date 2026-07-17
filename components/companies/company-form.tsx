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
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate-400">Company name</label>
          <input
            className={inputClass}
            placeholder="DriWE Solutions"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-400">Company type</label>
          <input
            className={inputClass}
            placeholder="Enterprise"
            name="companyType"
            value={form.companyType}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-400">Contact person</label>
          <input
            className={inputClass}
            placeholder="Jane Doe"
            name="contactPerson"
            value={form.contactPerson}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-400">Designation</label>
          <input
            className={inputClass}
            placeholder="Operations Lead"
            name="designation"
            value={form.designation}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-400">Mobile</label>
          <input
            className={inputClass}
            placeholder="9876543210"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-400">Alternate mobile</label>
          <input
            className={inputClass}
            placeholder="9876543211"
            name="alternateMobile"
            value={form.alternateMobile}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-400">Email</label>
          <input
            className={inputClass}
            type="email"
            placeholder="hello@company.com"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-400">Website</label>
          <input
            className={inputClass}
            placeholder="https://company.com"
            name="website"
            value={form.website}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-400">Address</label>
        <textarea
          className={`${inputClass} min-h-24`}
          placeholder="Street, suite, landmark"
          name="address"
          value={form.address}
          onChange={handleChange}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm text-slate-400">City</label>
          <input
            className={inputClass}
            placeholder="Mumbai"
            name="city"
            value={form.city}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-400">State</label>
          <input
            className={inputClass}
            placeholder="Maharashtra"
            name="state"
            value={form.state}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-400">Pincode</label>
          <input
            className={inputClass}
            placeholder="400001"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate-400">GST number</label>
          <input
            className={inputClass}
            placeholder="27ABCDE1234F1Z5"
            name="gstNumber"
            value={form.gstNumber}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-400">PAN number</label>
          <input
            className={inputClass}
            placeholder="ABCDE1234F"
            name="panNumber"
            value={form.panNumber}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate-400">Assigned employee</label>
          <input
            className={inputClass}
            placeholder="Employee ID"
            name="assignedEmployeeId"
            value={form.assignedEmployeeId}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-400">Status</label>
          <select
            className={inputClass}
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-400">Notes</label>
        <textarea
          className={`${inputClass} min-h-24`}
          placeholder="Additional context about the client"
          name="notes"
          value={form.notes}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
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