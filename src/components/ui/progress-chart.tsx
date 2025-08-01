import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { JSX } from 'react'

export const description = 'An area chart with a legend'

const defaultChartData = [
  { key: '1s', desktop: 186, mobile: 80, nada: 123 },
  { key: '2s', desktop: 305, mobile: 200, nada: 156 },
  { key: '3s', desktop: 237, mobile: 120, nada: 289 },
  { key: '4s', desktop: 223, mobile: 190, nada: 101 },
  { key: '5s', desktop: 209, mobile: 130, nada: 112 },
  { key: '6s', desktop: 214, mobile: 140, nada: 131 },
  { key: '7s', desktop: 200, mobile: 150, nada: 145 },
  { key: '8s', desktop: 180, mobile: 160, nada: 160 },
  { key: '9s', desktop: 170, mobile: 170, nada: 170 },
  { key: '10s', desktop: undefined, mobile: undefined, nada: undefined },
  { key: '10s', desktop: undefined, mobile: undefined, nada: undefined },
  { key: '10s', desktop: undefined, mobile: undefined, nada: undefined },
]

const defaultChartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
  mobile: {
    label: 'Mobile',
    color: 'var(--chart-2)',
  },
  nada: {
    label: 'Nada',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig

export function ProgressChart({
  className,
  height,
  config,
  data,
  showLegend,
}: {
  className: string
  height: number
  config: ChartConfig
  data: Record<string, number | string>[]
  showLegend?: boolean
}): JSX.Element {
  return (
    <ChartContainer config={config ?? defaultChartConfig} className={`h-${height ?? 36} w-full ${className}`}>
      <AreaChart accessibilityLayer data={data ?? defaultChartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={true}
          tickMargin={8}
          tickFormatter={(value) => value}
          dx={8}
          interval="equidistantPreserveStart"
        />
        {showLegend && <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />}
        {Object.entries(config ?? defaultChartConfig).map(([key, item]) => (
          <defs key={item.label as string}>
            <linearGradient id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={item.color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={item.color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
        ))}
        {Object.entries(config ?? defaultChartConfig).map(([key]) => (
          <Area
            key={key}
            dataKey={key}
            type="linear"
            fill={`url(#fill-${key})`}
            fillOpacity={0.5}
            stroke={`var(--color-${key})`}
            stackId={key}
          />
        ))}
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
      </AreaChart>
    </ChartContainer>
  )
}
