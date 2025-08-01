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
  const pointsPerSecond = 5
  const totalPoints = MAX_LIFESPAN * pointsPerSecond
  const totalTicks = MAX_LIFESPAN / TICK_LENGTH
  const ticksPerPoint = totalTicks / totalPoints
  const data = Array(totalPoints - 1)
    .fill(0)
    .map((_, i) => ({
      time: `${Math.round(i * TICK_LENGTH * ticksPerPoint)}s`,
      current: valueHistory[Math.round(i * ticksPerPoint)] ?? 0,
      best: bestValueHistory[Math.round(i * ticksPerPoint)] ?? 0,
    }))

  return <ProgressChart className="h-36 w-full" height={height ?? 36} config={defaultChartConfig} data={data} showLegend={showLegend} />
}
