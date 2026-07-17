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
    <div className="space-y-6 rounded-3xl border border-slate-800/80 bg-slate-900/70 p-8 shadow-2xl shadow-black/30">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          Update client
        </p>
        <h1 className="text-3xl font-bold text-white">Edit company</h1>
        <p className="mt-1 text-sm text-slate-400">
          Update the existing client profile and keep the CRM current.
        </p>
      </div>

      <CompanyForm mode="edit" companyId={id} />
    </div>
  );
}
