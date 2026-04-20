import { mockTasks } from './tasks'
import { mockUsers } from './users'
import { mockSprints, getActiveSprint } from './sprints'

import {
  buildTaskStatusDistribution,
  buildMemberDetail,
} from '../utils/teamPerformance'

// ----------------------------

export function getTaskStatusDistributionForMember(
  sprintId: number,
  userId: number
) {
  const tasks = mockTasks.filter(
    (t) => t.sprintId === sprintId && t.assigneeId === userId
  )

  return buildTaskStatusDistribution(tasks)
}

// ----------------------------

export function getMemberDetail(userId: number) {
  const user = mockUsers.find((u) => u.id === userId)
  if (!user) return null

  const activeSprintId = getActiveSprint()?.id ?? 1

  return buildMemberDetail({
    user,
    tasks: mockTasks,
    allSprints: mockSprints,
    activeSprintId,
  })
}