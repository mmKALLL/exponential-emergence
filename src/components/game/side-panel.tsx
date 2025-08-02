import { useUpdate } from '@/hooks/use-update'
import { Card } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ResourceDisplay } from './resource-display'
import { SynergiesDisplay } from './synergies-display'
import { Game } from '@/lib/gamestate-logic'

export function SidePanel() {
  const hasSynergies = useUpdate(() => Game.hasSynergies)

  if (!hasSynergies) {
    return (
      <Card className="flex flex-col items-center p-4 gap-4 w-52 h-full">
        <ResourceDisplay />
      </Card>
    )
  }
  return (
    <Card className="flex flex-col items-center p-4 gap-4 w-52 h-full">
      <Tabs defaultValue="resources">
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="synergies">Synergies</TabsTrigger>
        </TabsList>
        <TabsContent value="resources">
          <ResourceDisplay />
        </TabsContent>
        <TabsContent value="synergies">
          <SynergiesDisplay />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
