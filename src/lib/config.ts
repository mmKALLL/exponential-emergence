export type AppConfig = {
  animation: {
    intensity: number // 0 = off, 1 = default, tweakable upward
  }
}

const CONFIG_KEY = 'config' // separate from the 'gameState' save key

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

const defaultConfig: AppConfig = {
  animation: { intensity: prefersReducedMotion() ? 0.3 : 1 },
}

type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> }

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function deepMerge<T>(base: T, patch: DeepPartial<T>): T {
  const result = { ...base }
  for (const key in patch) {
    const pv = patch[key]
    const bv = base[key]
    if (isObject(pv) && isObject(bv)) {
      result[key] = deepMerge(bv, pv as DeepPartial<typeof bv>)
    } else if (pv !== undefined) {
      result[key] = pv as T[Extract<keyof T, string>]
    }
  }
  return result
}

let config: AppConfig = loadConfig()
const listeners = new Set<() => void>()

function loadConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    return raw ? deepMerge(defaultConfig, JSON.parse(raw)) : defaultConfig
  } catch {
    return defaultConfig
  }
}

export function getConfig(): AppConfig {
  return config
}

export function updateConfig(patch: DeepPartial<AppConfig>): void {
  config = deepMerge(config, patch)
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  } catch {
    // ignore persistence failures (e.g. private mode)
  }
  for (const l of listeners) l()
}

export function subscribeConfig(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
