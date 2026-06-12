export function getUpdatedAssignee(
    overId: string | number,
    poolId: string
): number | null {
    if (overId === poolId) return null

    const parsed = Number(overId)
    return Number.isNaN(parsed) ? null : parsed
}
