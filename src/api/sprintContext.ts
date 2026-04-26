import type { Sprint } from "../types"

export async function getSprints(projectId: number): Promise<Sprint[]> {
   const res = await fetch(`/api/projects/${projectId}/sprints`)
   return res.json()
}