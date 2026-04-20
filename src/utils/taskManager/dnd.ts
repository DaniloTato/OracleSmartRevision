export function getUpdatedAssignee(overId: any, poolId: string): number | null {
  if (overId === poolId) return null

  const parsed = Number(overId)
  return Number.isNaN(parsed) ? null : parsed
}