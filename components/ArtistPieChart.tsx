"use client";

import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface ArtistPieChartProps {
  artists: Array<{ name: string; msPlayed: number; count: number }>;
  totalMs: number;
  totalPlays: number;
}

export function ArtistPieChart({ artists, totalMs, totalPlays }: ArtistPieChartProps) {
  const [mode, setMode] = useState<'time' | 'plays'>('time');

  // Top 10 artists + Others based on mode
  const sortedArtists = [...artists].sort((a, b) => mode === 'time' ? b.msPlayed - a.msPlayed : b.count - a.count);
  const topArtists = sortedArtists.slice(0, 10);
  
  const topTotal = topArtists.reduce((sum, a) => sum + (mode === 'time' ? a.msPlayed : a.count), 0);
  const total = mode === 'time' ? totalMs : totalPlays;
  const others = total - topTotal;

  const data = [
    ...topArtists.map(a => ({ 
      name: a.name.length > 14 ? a.name.substring(0, 14) + '...' : a.name, 
      value: mode === 'time' ? a.msPlayed : a.count 
    })),
    { name: 'Others', value: others }
  ];

  // Extended beautiful color palette for Top 10
  const COLORS = [
    '#22c55e', '#10b981', '#06b6d4', '#3b82f6', 
    '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', 
    '#f43f5e', '#f97316'
  ];

  const formatPercentage = (value: number) => {
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg flex-1 min-h-[350px] flex flex-col w-full h-full">
      <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2 shrink-0">
        <PieChartIcon className="w-5 h-5 text-pink-500" />
        Artist Share ({mode === 'time' ? 'Time' : 'Plays'})
      </h3>
      <div className="flex-1 w-full flex flex-col pt-4">
        {/* Chart Area perfectly mathematically bounded */}
        <div className="relative w-full h-[75%]">
          
          {/* Circular Split Toggle Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div className="pointer-events-auto flex flex-col w-[76px] h-[76px] bg-zinc-900/90 backdrop-blur-md rounded-full overflow-hidden border-2 border-zinc-700/50 shadow-2xl">
              <button 
                onClick={() => setMode('plays')}
                className={`flex-1 flex items-center justify-center pt-2 text-[9px] font-bold tracking-widest transition-all duration-300 ${mode === 'plays' ? 'bg-emerald-500 text-black shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]' : 'bg-transparent text-zinc-400 hover:bg-zinc-800'}`}
              >
                <div>PLAYS</div>
              </button>
              <div className="h-[1px] w-full bg-zinc-700/50 z-10 shrink-0"></div>
              <button 
                onClick={() => setMode('time')}
                className={`flex-1 flex items-center justify-center pb-2 text-[9px] font-bold tracking-widest transition-all duration-300 ${mode === 'time' ? 'bg-purple-500 text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]' : 'bg-transparent text-zinc-400 hover:bg-zinc-800'}`}
              >
                <div>TIME</div>
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="50%"
                outerRadius="80%"
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name === 'Others' ? '#71717a' : COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: any, name: any) => [
                  formatPercentage(value as number), 
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom HTML Legend separated from SVG bounds */}
        <div className="h-[25%] flex flex-wrap justify-center content-center gap-x-5 gap-y-2.5 mt-4">
          {data.map((item, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-sm shrink-0 shadow-sm" 
                style={{ backgroundColor: item.name === 'Others' ? '#71717a' : COLORS[index % COLORS.length] }} 
              />
              <span className="text-[13px] font-medium text-zinc-300">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
