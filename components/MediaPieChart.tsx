"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Headphones } from 'lucide-react';

interface MediaPieChartProps {
  musicMs: number;
  podcastsMs: number;
}

export function MediaPieChart({ musicMs, podcastsMs }: MediaPieChartProps) {
  const data = [
    { name: 'Music', value: Math.round(musicMs / (1000 * 60 * 60)) },
    { name: 'Podcasts', value: Math.round(podcastsMs / (1000 * 60 * 60)) },
  ];
  
  const COLORS = ['#22c55e', '#a855f7'];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg h-[400px] flex flex-col">
      <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
        <Headphones className="w-5 h-5 text-purple-500" />
        Music vs Podcasts (Hours)
      </h3>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: any) => [`${value} hours`, 'Time'] as any}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
