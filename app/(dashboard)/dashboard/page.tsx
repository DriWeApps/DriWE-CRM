"use client";

import { useEffect, useState } from "react";
import StatsGrid from "@/components/dashboard/stats-grid";

interface DashboardData {
  employees: number;
  companies: number;
  tasks: number;
  meetings: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    employees: 0,
    companies: 0,
    tasks: 0,
    meetings: 0,
  });

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-muted-foreground">
          Welcome to DriWE CRM
        </p>
      </div>

      <StatsGrid {...data} />
    </div>
  );
}