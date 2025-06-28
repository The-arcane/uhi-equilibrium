'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';

type TrendChartProps = {
  data: {
    date: string;
    score: number;
  }[];
};

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="h-[350px] w-full">
        <ChartContainer config={{}} className="h-full w-full">
            <ResponsiveContainer>
            <LineChart
                data={data}
                margin={{
                top: 5,
                right: 20,
                left: -10,
                bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                    dataKey="date" 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                 />
                <Tooltip
                    cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2, strokeDasharray: '3 3' }}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--accent))"
                    strokeWidth={3}
                    dot={{
                        r: 6,
                        fill: 'hsl(var(--accent))',
                        stroke: 'hsl(var(--background))',
                        strokeWidth: 2,
                    }}
                     activeDot={{
                        r: 8,
                        fill: 'hsl(var(--accent))',
                        stroke: 'hsl(var(--background))',
                        strokeWidth: 2,
                    }}
                />
            </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    </div>
  );
}
