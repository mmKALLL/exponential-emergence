import { useUpdate } from '@/hooks/use-update'
import { Game } from '@/lib/gamestate-logic'
import { capitalize } from '@/lib/utils'
import { ArrowDown } from 'lucide-react'

export function SynergiesDisplay() {
  const synergies = useUpdate(() => Game.synergies || [])
  const outBoundSynergies = useUpdate(() => Game.outBoundSynergies || [])
  return (
    <>
      <h2 className="text-lg font-bold">Synergies</h2>
      <div className="text-xs">Based on your best scores.</div>
      {synergies.length > 0 && (
        <>
          <h3 className="mt-4 mb-2">In this level:</h3>
          <div className="flex flex-col gap-4 w-full">
            {synergies.map(({ basedOnLevel, synergyList }) => (
              <div key={basedOnLevel} className="flex flex-col items-center gap-1 w-full bg-accent p-2 rounded-md">
                <span className="text-sm font-bold mb-1">From {capitalize(basedOnLevel)}</span>
                {synergyList.map(({ basedOnResourceName, record, description }) => (
                  <div key={basedOnResourceName} className="text-xs flex flex-col gap-1 items-center mb-4">
                    <span className="text-xs">
                      Highest {basedOnResourceName}: {record}
                    </span>
                    <div>
                      <ArrowDown />
                    </div>
                    <div className="font-bold">{description}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
      {outBoundSynergies.length > 0 && (
        <>
          <h3 className="mt-4 mb-2">Affecting other levels:</h3>
          <div className="flex flex-col gap-4 w-full">
            {outBoundSynergies.map(({ basedOn, record, synergyList }) => (
              <div
                key={`${basedOn.level}-${basedOn.resourceName}`}
                className="flex flex-col items-center gap-1 w-full bg-accent p-2 rounded-md"
              >
                {/* <div className="text-sm font-bold">{capitalize(affectedLevel)}</div> */}
                <span className="text-xs">
                  Highest {basedOn.resourceName}: {record}
                </span>
                <div>
                  <ArrowDown />
                </div>
                {synergyList.map(({ description, affectedLevel }) => (
                  <div key={affectedLevel} className="text-xs flex flex-col gap-1 items-center">
                    <div className="font-bold">{capitalize(affectedLevel)}:</div>
                    <div>{description}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}
