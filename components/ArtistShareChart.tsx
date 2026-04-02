"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { AlignLeft } from 'lucide-react';

interface ArtistShareChartProps {
  artists: Array<{ name: string; msPlayed: number }>;
  totalMs: number;
}

export function ArtistShareChart({ artists, totalMs }: ArtistShareChartProps) {
  // Top 5 artists + Others
  const topArtists = artists.slice(0, 5);
  const topMs = topArtists.reduce((sum, a) => sum + a.msPlayed, 0);
  const othersMs = totalMs - topMs;

  const chartData = [
    {
      name: "Share",
      ...topArtists.reduce((acc, a) => ({ ...acc, [a.name]: a.msPlayed }), {}),
      "Others": othersMs
    }
  ];
  
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#3f3f46'];
  const keys = [...topArtists.map(a => a.name), "Others"];

  const formatPercentage = (value: number) => {
    return `${((value / totalMs) * 100).toFixed(1)}%`;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg min-h-[280px] flex flex-col justify-center">
      <h3 className="text-white font-semibold text-lg mb-8 flex items-center gap-2">
        <AlignLeft className="w-5 h-5 text-pink-500" />
        Artist Share (Time)
      </h3>
      <div className="w-full h-[60px] mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: any, name: any) => [
                formatPercentage(value as number), 
                name
              ]}
            />
            {keys.map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                stackId="a" 
                fill={COLORS[index % COLORS.length]} 
                radius={
                  index === 0 ? [8, 0, 0, 8] : index === keys.length - 1 ? [0, 8, 8, 0] : [0, 0, 0, 0]
                } 
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 mt-auto">
        {keys.map((key, index) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-zinc-300">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="max-w-[120px] truncate" title={key}>{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
