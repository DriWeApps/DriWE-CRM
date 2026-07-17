import CompanyForm from "@/components/companies/company-form";

export default function AddCompanyPage() {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-2xl shadow-black/30 sm:p-6 lg:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          New client
        </p>
        <h1 className="text-3xl font-bold text-white">Add company</h1>
        <p className="mt-1 text-sm text-slate-400">
          Create a polished client profile with all the important account details.
        </p>
      </div>

      <CompanyForm />
    </div>
  );
}