"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Sun } from 'lucide-react';

interface TimeOfDayChartProps {
  data: Array<{ period: string; msPlayed: number }>;
}

export function TimeOfDayChart({ data }: TimeOfDayChartProps) {
  const chartData = data.map(d => ({
    period: d.period.split(" ")[0], // "Morning", "Afternoon", etc
    hours: Math.round(d.msPlayed / (1000 * 60 * 60))
  }));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg shrink-0 h-[180px] flex flex-col w-full">
      <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
        <Sun className="w-5 h-5 text-yellow-500" />
        Listening by Time of Day (Hours)
      </h3>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="period" 
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
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip 
              cursor={{ fill: '#27272a' }}
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#eab308' }}
            />
            <Bar dataKey="hours" fill="#eab308" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
