import { Building2, Pencil } from "lucide-react";
import CompanyForm from "@/components/companies/company-form";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCompanyPage({ params }: Props) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-12">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="w-full px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600">
              <Pencil className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-white">
                Edit Company
              </h1>
              <p className="text-xs text-slate-500">
                CRM • Update Company Information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-8 pt-8 space-y-8">
        {/* Hero */}
        <div className="rounded-3xl border border-slate-800 bg-zinc-900/70 p-8 md:p-10 shadow-2xl shadow-black/40">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-sm font-mono uppercase tracking-[0.12em] text-amber-400">
                COMPANY MANAGEMENT
              </p>

              <h1 className="mt-3 text-5xl font-semibold tracking-tight text-white">
                Edit Company
              </h1>

              <p className="mt-3 max-w-2xl text-lg text-slate-400">
                Update the company's information and keep your CRM records
                accurate and up to date.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-3 text-amber-400">
              <Building2 className="h-5 w-5" />
              <span className="font-medium">
                Update Company Details
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-3xl border border-slate-800 bg-zinc-900/60 p-8 shadow-xl">
          <CompanyForm mode="edit" companyId={id} />
        </div>
      </div>
    </div>
  );
}