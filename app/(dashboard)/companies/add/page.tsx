import CompanyForm from "@/components/companies/company-form";

export default function AddCompanyPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Add Company
      </h1>

      <CompanyForm />
    </div>
  );
}