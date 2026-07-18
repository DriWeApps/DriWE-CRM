"use client";

import Link from "next/link";
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
      <Link href="/employees" className="block">
        <StatCard
          title="Employees"
          value={employees}
          icon={Users}
        />
      </Link>

      <Link href="/companies" className="block">
        <StatCard
          title="Companies"
          value={companies}
          icon={Building2}
        />
      </Link>

      <Link href="/tasks" className="block">
        <StatCard
          title="Tasks"
          value={tasks}
          icon={ClipboardList}
        />
      </Link>

      <Link href="/meetings" className="block">
        <StatCard
          title="Meetings"
          value={meetings}
          icon={Calendar}
        />
      </Link>
    </div>
  );
}