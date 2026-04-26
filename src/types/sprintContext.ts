import type {Sprint} from "./index.ts"

export interface SprintContextValue {
   selectedSprintId: number
   setSelectedSprintId: (id: number) => void
   sprints: Sprint[]
   loading: boolean
}