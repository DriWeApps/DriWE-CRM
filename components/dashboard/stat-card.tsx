import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card
      className="
        group
        cursor-pointer
        overflow-hidden
        border-slate-800
        bg-zinc-900/70
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-cyan-500/40
        hover:shadow-2xl
        hover:shadow-cyan-500/20
        active:scale-95
      "
    >
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <h2 className="mt-2 text-4xl font-bold text-white">
            {value}
          </h2>
        </div>

        <div className="rounded-2xl bg-cyan-500/10 p-4 transition-all duration-300 group-hover:bg-cyan-500 group-hover:scale-110">
          <Icon className="h-8 w-8 text-cyan-400 group-hover:text-white" />
        </div>
      </CardContent>
    </Card>
  );
}