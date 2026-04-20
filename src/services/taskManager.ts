import { getTasks, getMembers, getSprints } from "../api/taskManagerApi"

export async function loadTaskManagerData(projectId: number) {
  const [tasks, members, sprints] = await Promise.all([
    getTasks(projectId),
    getMembers(projectId),
    getSprints(projectId),
  ])

  return { tasks, members, sprints }
}