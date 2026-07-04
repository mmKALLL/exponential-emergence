import type { LevelName } from '@/lib/types'

export type TutorialTrigger =
  | { type: 'levelStart'; level: LevelName } // first time the player is in-game on this level
  | { type: 'actionUnlocked'; actionName: string } // when this action first becomes available

export type TutorialMessage = { id: string; title: string; body: string; trigger: TutorialTrigger }

// Short, plain-language copy aimed at the biggest confusion points. (Draft — will be edited.)
export const tutorialMessages: TutorialMessage[] = [
  {
    id: 'welcome',
    trigger: { type: 'levelStart', level: 'amoeba' },
    title: 'Using actions',
    body: 'Click an action to start it. It will progress automatically. Click it again to pause.',
  },
  {
    id: 'amoeba-resources',
    trigger: { type: 'actionUnlocked', actionName: 'Absorb food' },
    title: 'Resources',
    body: 'You can see your resources on the right. Use your food to make nutrients.',
  },
  {
    id: 'amoeba-lifespan',
    trigger: { type: 'actionUnlocked', actionName: 'Generate energy' },
    title: 'Lifespan',
    body: 'You have a 60 second lifespan. Life is only used when an action is active. You can select the current action to pause.',
  },
  {
    id: 'amoeba-divide',
    trigger: { type: 'actionUnlocked', actionName: 'Divide cell' },
    title: 'Divisions',
    body: 'You unlocked the ability to divide into multiple cells! It requires energy, but with 3 divisions you will finish the level.',
  },
  {
    id: 'multi-multiply',
    trigger: { type: 'actionUnlocked', actionName: 'Multiply' },
    title: 'Multicellular output',
    body: 'Multiply doubles your cells, leading to faster output. However, each multiply costs more energy.',
  },
  {
    id: 'multi-filter',
    trigger: { type: 'actionUnlocked', actionName: 'Filter waste' },
    title: 'Filter waste',
    body: 'Filtering waste increases the amount of food you gain from your Catch Food action.',
  },
  {
    id: 'algae-synergies',
    trigger: { type: 'levelStart', level: 'algae' },
    title: 'Synergies',
    body: 'You have now unlocked synergies, which increase your starting resources. See the synergies tab on the right.',
  },
  {
    id: 'tutorial-finished',
    trigger: { type: 'levelStart', level: 'algae' },
    title: 'Tutorial complete',
    body: 'This is the end of the tutorial. You can view a summary with the Help button in the bottom right. Good luck!',
  },
]
