"use client";

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
  artists: Array<{ name: string; msPlayed: number }>;
  totalMs: number;
}

export function ArtistPieChart({ artists, totalMs }: ArtistPieChartProps) {
  // Top 5 artists + Others
  const topArtists = artists.slice(0, 5);
  const topMs = topArtists.reduce((sum, a) => sum + a.msPlayed, 0);
  const othersMs = totalMs - topMs;

  const data = [
    ...topArtists.map(a => ({ name: a.name, value: a.msPlayed })),
    { name: 'Others', value: othersMs }
  ];
  
  // Custom theme colors for artists
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#71717a'];

  const formatPercentage = (value: number) => {
    return `${((value / totalMs) * 100).toFixed(1)}%`;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg h-[220px] flex flex-col">
      <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
        <PieChartIcon className="w-4 h-4 text-pink-500" />
        Artist Share (Time)
      </h3>
      <div className="flex-1 w-full relative -mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={75}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            <Legend 
              verticalAlign="middle" 
              layout="vertical" 
              align="right"
              wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }}
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
