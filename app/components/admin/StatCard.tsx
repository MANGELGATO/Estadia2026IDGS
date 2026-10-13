import React from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
};

const iconVariants: Record<NonNullable<StatCardProps['variant']>, string> = {
  primary: 'bg-[rgba(168,30,113,0.1)] text-plai',
  success: 'bg-[rgba(16,185,129,0.1)] text-[#10B981]',
  warning: 'bg-[rgba(245,158,11,0.1)] text-[#F59E0B]',
  danger: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444]',
};

export default function StatCard({ title, value, icon, variant = 'primary' }: StatCardProps) {
  return (
    <div className="flex items-center gap-6 rounded-2xl border border-black/[0.08] bg-white p-6 shadow-plai-sm transition-all duration-[250ms] hover:-translate-y-0.5 hover:shadow-plai-md">
      <div className={`flex size-[60px] shrink-0 items-center justify-center rounded-full text-[1.75rem] ${iconVariants[variant]}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="mb-1 font-body text-sm font-semibold uppercase tracking-[0.05em] text-plai-muted">{title}</span>
        <span className="font-heading text-[1.75rem] font-bold leading-none text-navy">{value}</span>
      </div>
    </div>
  );
}
