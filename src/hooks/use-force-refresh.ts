import { useEffect, useState } from 'react'

export function useForceRefresh(ms: number) {
  const [, setTick] = useState(0)

  const forceRefresh = () => {
    setTick((prev) => prev + 1)
  }

  useEffect(() => {
    const intervalId = setInterval(forceRefresh, ms)
    return () => clearInterval(intervalId)
  }, [ms])

  return { forceRefresh }
}
