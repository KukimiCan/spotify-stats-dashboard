"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Compass, List } from 'lucide-react';

interface DiscoveryChartProps {
  data: Array<{ month: string; newArtists: number; artists: string[] }>;
  onViewDetails: () => void;
}

export function DiscoveryChart({ data, onViewDetails }: DiscoveryChartProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg h-[220px] flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <Compass className="w-64 h-64 text-purple-500" />
      </div>
      
      <div className="flex justify-between items-center mb-6 relative z-10 text-white">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Compass className="w-5 h-5 text-purple-500" />
          New Artists Discovered
        </h3>
        <button 
          onClick={onViewDetails}
          className="text-xs bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 px-3 py-1 rounded-full transition-colors flex items-center gap-1.5"
        >
          <List className="w-3.5 h-3.5" />
          View Log
        </button>
      </div>
      <div className="flex-1 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorDiscovery" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#71717a" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#71717a" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip 
              cursor={{ stroke: '#52525b', strokeWidth: 1 }}
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#a855f7' }}
              formatter={(value: any) => [`${value} artists`, 'Discovered'] as any}
            />
            <Area 
              type="monotone" 
              dataKey="newArtists" 
              stroke="#a855f7" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorDiscovery)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
