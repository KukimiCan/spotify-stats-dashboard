import { ReactNode, useState } from 'react';

export interface TopListItem {
  id: string;
  title: string;
  subtitle?: string;
  value: string;
  url?: string;
}

interface TopListProps {
  title: string;
  icon: ReactNode;
  items?: TopListItem[];
  itemsByTime?: TopListItem[];
  itemsByPlays?: TopListItem[];
  defaultSort?: 'time' | 'plays';
  actionIcon?: ReactNode;
  onItemAction?: (item: TopListItem) => void;
}

export function TopList({ title, icon, items, itemsByTime, itemsByPlays, defaultSort = 'plays', actionIcon, onItemAction }: TopListProps) {
  const [sortBy, setSortBy] = useState<'time' | 'plays'>(defaultSort);
  const showToggle = !!itemsByTime && !!itemsByPlays;

  const displayItems = showToggle 
    ? (sortBy === 'time' ? itemsByTime : itemsByPlays)
    : items;

  if (!displayItems) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg h-[460px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {showToggle && (
          <div className="flex bg-zinc-950 rounded-lg p-0.5 border border-zinc-800 shadow-inner">
            <button 
              onClick={() => setSortBy('plays')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${sortBy === 'plays' ? 'bg-zinc-800 text-green-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Plays
            </button>
            <button 
              onClick={() => setSortBy('time')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${sortBy === 'time' ? 'bg-zinc-800 text-purple-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Time
            </button>
          </div>
        )}
      </div>
      <div className="overflow-y-auto pr-2 space-y-4 flex-1 custom-scrollbar">
        {displayItems.map((item, index) => {
          return (
            <div key={item.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <span className="text-zinc-500 font-mono text-sm w-6 shrink-0">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <div className="flex flex-col flex-1 min-w-0">
                  {item.url ? (
                    <a 
                      href={item.url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-zinc-100 truncate hover:text-green-400 transition-colors"
                      title={item.title}
                    >
                      {item.title}
                    </a>
                  ) : (
                    <p className="text-zinc-100 font-medium truncate">{item.title}</p>
                  )}
                  {item.subtitle && <p className="text-zinc-500 text-sm truncate">{item.subtitle}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="text-zinc-400 text-sm whitespace-nowrap">
                  {item.value}
                </div>
                {onItemAction && actionIcon && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onItemAction(item);
                    }}
                    className="p-1.5 text-zinc-500 hover:text-green-400 hover:bg-zinc-800 rounded-md transition-colors opacity-60 hover:opacity-100"
                    title={`View ${item.title} insights`}
                  >
                    {actionIcon}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
