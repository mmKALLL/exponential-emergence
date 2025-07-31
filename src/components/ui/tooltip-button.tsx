import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { JSX } from 'react/jsx-runtime'

export function TooltipWrapper({ component, content }: { component: JSX.Element; content: string | undefined }): JSX.Element {
  return content ? (
    <Tooltip>
      <TooltipTrigger asChild>{component}</TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  ) : (
    component
  )
}
