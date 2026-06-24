import { useCallback } from 'react'
import { registerAnchor, unregisterAnchor } from './anchor-registry'

// Returns a ref callback. Attach to the element you want to anchor effects to:
//   const setAnchor = useAnchor(`action:${actionName}`)
//   <Card ref={setAnchor} />
export function useAnchor(id: string) {
  return useCallback(
    (el: HTMLElement | null) => {
      if (el) registerAnchor(id, el)
      else unregisterAnchor(id)
    },
    [id]
  )
}
