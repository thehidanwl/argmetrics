'use client';

import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({ data, color = '#6366F1', width = 100, height = 30 }: SparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));

  if (!data || data.length === 0) {
    return <div style={{ width, height }} className="flex items-center justify-center text-[var(--text-muted)]">-</div>;
  }

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
