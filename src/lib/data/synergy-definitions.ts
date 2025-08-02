import type { LevelName, SynergyConfig } from '../types'

// This is basically just for type safety
export function defineSynergies<T extends LevelName>(defs: SynergyConfig<T>[]): SynergyConfig<T>[] {
  return defs
}

export const synergyDefinitions = defineSynergies([
  {
    basedOn: {
      level: 'amoeba',
      resourceName: 'divisions',
    },
    description: (value) => `Start with ${value} cells`,
    affectedLevel: 'multicellular',
    onLevelStart: (gs, value) => {
      gs.levels.multicellular.resources.cells = value
      return gs
    },
  },
  {
    basedOn: {
      level: 'amoeba',
      resourceName: 'energy',
    },
    description: (value) => `Start with ${value} energy`,
    affectedLevel: 'multicellular',
    onLevelStart: (gs, value) => {
      gs.levels.multicellular.resources.energy = value
      return gs
    },
  },
])
