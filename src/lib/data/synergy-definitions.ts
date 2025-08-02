import type { LevelName, SynergyConfig } from '../types'

// To get proper typing for basedOn
type SynergyConfigMap = {
  [K in LevelName]: SynergyConfig<K>
}

export const synergyDefinitions = [
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
] satisfies readonly SynergyConfigMap[LevelName][]
