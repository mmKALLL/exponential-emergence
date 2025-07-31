import type { JSX } from 'react/jsx-runtime'
import type { ChartConfig } from '../ui/chart'
import { ProgressChart } from '../ui/progress-chart'

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

export function ActionMiniChart({ height, valueHistory, bestValueHistory }: { height?: number; valueHistory: number[]; bestValueHistory: number[] }): JSX.Element {
  const data = Array(599)
    .fill(0)
    .map((_, i) => ({
      time: `${Math.round(i / 10)}s`,
      current: valueHistory[i] ?? 0,
      best: bestValueHistory[i] ?? 0,
    }))

  return <ProgressChart className="h-36 w-full" height={height} config={defaultChartConfig} data={data} />
}
