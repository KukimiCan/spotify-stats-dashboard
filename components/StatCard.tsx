import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  onClick?: () => void;
  headerAction?: ReactNode;
}

export function StatCard({ title, value, icon, description, onClick, headerAction }: StatCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4 shadow-lg transition-colors ${onClick ? 'cursor-pointer hover:border-green-500/50 hover:bg-zinc-800' : 'hover:border-zinc-700'}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-zinc-400 font-medium text-sm truncate pr-2">{title}</h3>
        <div className="flex items-center gap-2 shrink-0">
          {headerAction}
          <div className="text-green-500">{icon}</div>
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-white">{value}</p>
        {description && <p className="text-zinc-500 text-xs mt-1">{description}</p>}
      </div>
    </div>
  );
}
