"use client";

import Link from "next/link";
import {
  Building2,
  Users,
  CheckSquare,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";

interface Props {
  stats: {
    companies: number;
    employees: number;
    tasks: number;
    meetings: number;
  };
}

console.log("DashboardCards Loaded");
export default function DashboardCards({ stats }: Props) {
  const cards = [
    {
      title: "Companies",
      value: stats.companies,
      icon: Building2,
      href: "/companies",
      color: "from-cyan-500 to-blue-500",
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
    },
    {
      title: "Employees",
      value: stats.employees,
      icon: Users,
      href: "/employees",
      color: "from-emerald-500 to-green-500",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
    },
    {
      title: "Tasks",
      value: stats.tasks,
      icon: CheckSquare,
      href: "/tasks",
      color: "from-orange-500 to-yellow-500",
      bg: "bg-orange-500/10",
      text: "text-orange-400",
    },
    {
      title: "Meetings",
      value: stats.meetings,
      icon: CalendarDays,
      href: "/meetings",
      color: "from-violet-500 to-fuchsia-500",
      bg: "bg-violet-500/10",
      text: "text-violet-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Link
            key={card.title}
            href={card.href}
            className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-zinc-900/70 p-7 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20 active:scale-[0.98] cursor-pointer"
          >
            {/* Top Gradient */}
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.color}`}
            />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-wider text-slate-400">
                  {card.title}
                </p>

                <h2 className="mt-4 text-5xl font-bold tracking-tight text-white">
                  {card.value}
                </h2>

                <p className="mt-3 text-sm text-slate-500">
                  Total {card.title.toLowerCase()}
                </p>
              </div>

              <div
                className={`${card.bg} rounded-2xl p-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
              >
                <Icon className={`h-8 w-8 ${card.text}`} />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-5">
              <span className="text-xs uppercase tracking-widest text-slate-500">
                Click to View
              </span>

              <ArrowUpRight
                className={`h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 ${card.text}`}
              />
            </div>

            <div className="absolute inset-0 rounded-3xl ring-0 transition-all duration-300 group-hover:ring-2 group-hover:ring-cyan-500/20" />
          </Link>
        );
      })}
    </div>
  );
}