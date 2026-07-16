"use client";

import { useEffect, useState } from "react";
import CompanyTable from "@/components/companies/company-table";
import { Company } from "@/types/company";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    fetch("/api/companies")
      .then((res) => res.json())
      .then(setCompanies);
  }, []);

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Companies</h1>

        <a
          href="/companies/add"
          className="rounded-lg bg-blue-600 px-5 py-2 text-white"
        >
          + Add Company
        </a>
      </div>

      <CompanyTable companies={companies} />
    </div>
  );
}