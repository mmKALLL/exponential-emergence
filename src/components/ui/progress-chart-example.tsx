'use client'

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export const description = 'An area chart with a legend'

const defaultChartData = [
  { time: '1s', desktop: 186, mobile: 80, nada: 123 },
  { time: '2s', desktop: 305, mobile: 200, nada: 156 },
  { time: '3s', desktop: 237, mobile: 120, nada: 289 },
  { time: '4s', desktop: 223, mobile: 190, nada: 101 },
  { time: '5s', desktop: 209, mobile: 130, nada: 112 },
  { time: '6s', desktop: 214, mobile: 140, nada: 131 },
  { time: '7s', desktop: 200, mobile: 150, nada: 145 },
  { time: '8s', desktop: 180, mobile: 160, nada: 160 },
  { time: '9s', desktop: 170, mobile: 170, nada: 170 },
  { time: '10s', desktop: undefined, mobile: undefined, nada: undefined },
  { time: '10s', desktop: undefined, mobile: undefined, nada: undefined },
  { time: '10s', desktop: undefined, mobile: undefined, nada: undefined },
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

export function ProgressChartExample({ className, height, config, data }: { className?: string; height?: number; config?: ChartConfig; data?: Record<string, any>[] }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Area Chart - Legend</CardTitle>
        <CardDescription>From this lifespan</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config ?? defaultChartConfig} className={`h-${height ?? 40} w-full`}>
          <AreaChart accessibilityLayer data={data ?? defaultChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillNada" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-nada)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-nada)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area dataKey="mobile" type="natural" fill="url(#fillMobile)" fillOpacity={0.5} stroke="var(--color-mobile)" stackId="a" />
            <Area dataKey="desktop" type="natural" fill="url(#fillDesktop)" fillOpacity={0.5} stroke="var(--color-desktop)" stackId="b" />
            <Area dataKey="nada" type="natural" fill="url(#fillNada)" fillOpacity={0.5} stroke="var(--color-nada)" stackId="c" />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
