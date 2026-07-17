"use client";

import {
  Building2,
  Users,
  CheckSquare,
  CalendarDays,
} from "lucide-react";

interface Props {
  stats: {
    companies: number;
    employees: number;
    tasks: number;
    meetings: number;
  };
}

export default function DashboardCards({
  stats,
}: Props) {
  const cards = [
    {
      title: "Companies",
      value: stats.companies,
      icon: Building2,
      color: "bg-blue-500",
    },
    {
      title: "Employees",
      value: stats.employees,
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Tasks",
      value: stats.tasks,
      icon: CheckSquare,
      color: "bg-orange-500",
    },
    {
      title: "Meetings",
      value: stats.meetings,
      icon: CalendarDays,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-xl border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {card.title}
                </p>

                <h2 className="mt-2 text-4xl font-bold">
                  {card.value}
                </h2>
              </div>

              <div
                className={`rounded-xl p-4 text-white ${card.color}`}
              >
                <Icon className="h-7 w-7" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}