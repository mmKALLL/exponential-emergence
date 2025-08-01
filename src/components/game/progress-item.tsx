import type { JSX } from 'react'
import { Progress } from '../ui/progress'

export function ProgressItem({
  value,
  max,
  children,
}: {
  value: number
  max: number
  children: (JSX.Element | string | number | boolean | null)[]
}): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-2">
      {children}
      <Progress value={value} max={max} />
    </div>
  )
}
