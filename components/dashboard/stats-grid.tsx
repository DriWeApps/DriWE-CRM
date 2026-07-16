"use client";

import {
  Building2,
  Users,
  ClipboardList,
  Calendar,
} from "lucide-react";

import StatCard from "./stat-card";

interface Props {
  employees: number;
  companies: number;
  tasks: number;
  meetings: number;
}

export default function StatsGrid({
  employees,
  companies,
  tasks,
  meetings,
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Employees"
        value={employees}
        icon={Users}
      />

      <StatCard
        title="Companies"
        value={companies}
        icon={Building2}
      />

      <StatCard
        title="Tasks"
        value={tasks}
        icon={ClipboardList}
      />

      <StatCard
        title="Meetings"
        value={meetings}
        icon={Calendar}
      />
    </div>
  );
}