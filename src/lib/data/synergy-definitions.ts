import type { LevelName, SynergyConfig } from '../types'

// To get proper typing for basedOn
type SynergyConfigMap = {
  [K in LevelName]: SynergyConfig<K>
}

export const synergyDefinitions = [
  // MULTICELLULAR

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

  // ALGAE

  {
    basedOn: {
      level: 'multicellular',
      resourceName: 'cells',
    },
    description: (value) => `Start with ${Math.floor(value / 100)} millimeters`,
    affectedLevel: 'algae',
    onLevelStart: (gs, value) => {
      gs.levels.algae.resources.millimeters = Math.floor(value / 100)
      return gs
    },
  },
  {
    basedOn: {
      level: 'multicellular',
      resourceName: 'efficiency',
    },
    description: (value) => `Start with ${value} chlorophyll`,
    affectedLevel: 'algae',
    onLevelStart: (gs, value) => {
      gs.levels.algae.resources.chlorophyll = value
      return gs
    },
  },
  {
    basedOn: {
      level: 'multicellular',
      resourceName: 'nutrients',
    },
    description: (value) => `Start with ${value} hardness`,
    affectedLevel: 'algae',
    onLevelStart: (gs, value) => {
      gs.levels.algae.resources.hardness = value
      return gs
    },
  },

  // INSECT

  {
    basedOn: {
      level: 'multicellular',
      resourceName: 'food',
    },
    description: (value) => `Start with ${Math.floor(value / 10)} speed`,
    affectedLevel: 'insect',
    onLevelStart: (gs, value) => {
      gs.levels.insect.resources.speed = Math.floor(value / 10)
      return gs
    },
  },
  {
    basedOn: {
      level: 'algae',
      resourceName: 'chlorophyll',
    },
    description: (value) => `Start with ${value} digestion`,
    affectedLevel: 'insect',
    onLevelStart: (gs, value) => {
      gs.levels.insect.resources.digestion = value
      return gs
    },
  },
  {
    basedOn: {
      level: 'multicellular',
      resourceName: 'efficiency',
    },
    description: (value) => `Start with ${value} perception`,
    affectedLevel: 'insect',
    onLevelStart: (gs, value) => {
      gs.levels.insect.resources.perception = value
      return gs
    },
  },

  // CRUSTACEAN

  {
    basedOn: {
      level: 'amoeba',
      resourceName: 'energy',
    },
    description: (value) => `Start with ${value} strength`,
    affectedLevel: 'crustacean',
    onLevelStart: (gs, value) => {
      gs.levels.crustacean.resources.strength = value
      return gs
    },
  },
  {
    basedOn: {
      level: 'insect',
      resourceName: 'speed',
    },
    description: (value) => `Start with ${value} dexterity`,
    affectedLevel: 'crustacean',
    onLevelStart: (gs, value) => {
      gs.levels.crustacean.resources.dexterity = value
      return gs
    },
  },
  {
    basedOn: {
      level: 'algae',
      resourceName: 'hardness',
    },
    description: (value) => `Start with ${value} vitality`,
    affectedLevel: 'crustacean',
    onLevelStart: (gs, value) => {
      gs.levels.crustacean.resources.vitality = value
      return gs
    },
  },
  {
    basedOn: {
      level: 'insect',
      resourceName: 'perception',
    },
    description: (value) => `Start with ${value} intelligence`,
    affectedLevel: 'crustacean',
    onLevelStart: (gs, value) => {
      gs.levels.crustacean.resources.intelligence = value
      return gs
    },
  },
  {
    basedOn: {
      level: 'multicellular',
      resourceName: 'cells',
    },
    description: (value) => `Start with ${Math.floor(value / 100)}g mass`,
    affectedLevel: 'crustacean',
    onLevelStart: (gs, value) => {
      gs.levels.crustacean.resources.mass = Math.floor(value / 100)
      return gs
    },
  },
] satisfies readonly SynergyConfigMap[LevelName][]
