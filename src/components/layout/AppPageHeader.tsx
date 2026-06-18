import type { ReactNode } from "react";

interface AppPageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  badge?: ReactNode;
}

export function AppPageHeader({ title, subtitle, action, badge }: AppPageHeaderProps) {
  return (
    <div
      className="sticky top-0 z-20 flex h-14 items-center justify-between border-b px-6 md:px-8"
      style={{
        background: "rgba(248,250,252,0.97)",
        borderColor: "#e2e8f0",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[#0f172a]">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="mt-0 truncate text-[12px] text-[#64748b]">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  );
}
