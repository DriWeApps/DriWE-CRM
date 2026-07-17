"use client";

import { ReactNode } from "react";

interface PageContainerProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

export default function PageContainer({
  title,
  description,
  icon,
  action,
  children,
}: PageContainerProps) {
  return (
    <div className="min-h-screen w-full bg-zinc-950 pb-12">

      <div className="sticky top-0 z-40 border-b border-slate-800 bg-zinc-950/80 backdrop-blur-lg">

        <div className="w-full px-8 py-5">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              {icon && (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                  {icon}
                </div>
              )}

              <div>
                <h1 className="text-3xl font-bold text-white">
                  {title}
                </h1>

                {description && (
                  <p className="mt-1 text-slate-400">
                    {description}
                  </p>
                )}
              </div>

            </div>

            {action}

          </div>

        </div>

      </div>

      <div className="w-full px-8 pt-8">
        {children}
      </div>

    </div>
  );
}