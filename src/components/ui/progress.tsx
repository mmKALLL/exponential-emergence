import type * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/lib/utils'

function Progress({
  className,
  value,
  max,
  indicatorColor,
  danger,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { indicatorColor?: string; danger?: boolean }) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn('bg-primary/20 relative h-2 w-full overflow-hidden rounded-full', danger && 'animate-lifespan-danger', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{
          transform: `translateX(-${100 - ((value || -1) / (max || 100)) * 100}%)`,
          backgroundColor: indicatorColor,
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
