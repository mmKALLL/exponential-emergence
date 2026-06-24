const registry = new Map<string, HTMLElement>()

export function registerAnchor(id: string, el: HTMLElement): void {
  registry.set(id, el)
}

export function unregisterAnchor(id: string): void {
  registry.delete(id)
}

export function rectFor(id: string): DOMRect | null {
  const el = registry.get(id)
  return el ? el.getBoundingClientRect() : null
}
