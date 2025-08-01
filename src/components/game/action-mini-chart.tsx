import type { JSX } from 'react/jsx-runtime'
import type { ChartConfig } from '../ui/chart'
import { ProgressChart } from '../ui/progress-chart'
import { MAX_LIFESPAN, TICK_LENGTH } from '@/lib/types'

const defaultChartConfig = {
  current: {
    label: 'Current',
    color: 'var(--chart-1)',
  },
  best: {
    label: 'Best',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function ActionMiniChart({
  height,
  valueHistory,
  bestValueHistory,
  showLegend,
}: {
  height?: number
  valueHistory: number[]
  bestValueHistory: number[]
  showLegend: boolean
}): JSX.Element {
  const data = Array(MAX_LIFESPAN / TICK_LENGTH - 1)
    .fill(0)
    .map((_, i) => ({
      time: `${Math.round(i * TICK_LENGTH)}s`,
      current: valueHistory[i] ?? 0,
      best: bestValueHistory[i] ?? 0,
    }))

  return <ProgressChart className="h-36 w-full" height={height ?? 36} config={defaultChartConfig} data={data} showLegend={showLegend} />
}
