// STILL NEEDS TO BE REFACTORED

import { useState, useMemo } from 'react'
import { getActivityLog } from '../mock/activityLog'
import { mockSprints } from '../mock/sprints'
import { mockUsers } from '../mock/users'
import type { ActivityLogEntry } from '../types'

import { Badge } from '../components/ui/Badge'
import { Section } from '../components/ui/Section'
import { Select } from '../components/ui/Select'
import { Label } from '../components/ui/Label'
import { Table, THead, TRow, TH, TD } from '../components/ui/Table'
import { Button } from '../components/ui/Button'

const REFERENCE_TODAY = new Date('2025-02-15')
REFERENCE_TODAY.setHours(23, 59, 59, 999)

type DateRangeKey = 'hoy' | '7d' | '30d'

const ENTITY_LABELS: Record<string, string> = {
  tarea: 'Tarea',
  sprint: 'Sprint',
  usuario: 'Usuario',
  sistema: 'Sistema',
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isWithinRange(entry: ActivityLogEntry, range: DateRangeKey): boolean {
  const d = new Date(entry.timestamp)
  const start = new Date(REFERENCE_TODAY)

  if (range === 'hoy') {
    start.setHours(0, 0, 0, 0)
  } else if (range === '7d') {
    start.setDate(start.getDate() - 7)
    start.setHours(0, 0, 0, 0)
  } else {
    start.setDate(start.getDate() - 30)
    start.setHours(0, 0, 0, 0)
  }

  return d >= start && d <= REFERENCE_TODAY
}

function getEntityVariant(type: string) {
  switch (type) {
    case 'tarea':
      return 'default'
    case 'sprint':
      return 'success'
    case 'usuario':
      return 'warning'
    default:
      return 'danger'
  }
}

export function ActivityLog() {
  const [dateRange, setDateRange] = useState<DateRangeKey>('30d')
  const [sprintId, setSprintId] = useState('')
  const [userId, setUserId] = useState('')
  const [eventType, setEventType] = useState('')

  const filteredEntries = useMemo(() => {
    let list = getActivityLog()
    list = list.filter((e) => isWithinRange(e, dateRange))
    if (sprintId) list = list.filter((e) => e.sprintId === sprintId)
    if (userId) list = list.filter((e) => e.userId === userId)
    if (eventType) list = list.filter((e) => e.entityType === eventType)
    return list
  }, [dateRange, sprintId, userId, eventType])

  const hasActiveFilters =
    sprintId !== '' || userId !== '' || eventType !== '' || dateRange !== '30d'

  const resetFilters = () => {
    setDateRange('30d')
    setSprintId('')
    setUserId('')
    setEventType('')
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-2xl font-semibold text-[var(--color-text)]">
        Historial de Actividad
      </h1>

      {/* Filters (same layout, just components swapped) */}
      <Section>
        <div className="flex flex-wrap items-end gap-4">

          <div>
            <Label>Rango de fechas</Label>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeKey)}
            >
              <option value="hoy">Hoy</option>
              <option value="7d">7 días</option>
              <option value="30d">30 días</option>
            </Select>
          </div>

          <div>
            <Label>Sprint</Label>
            <Select
              value={sprintId}
              onChange={(e) => setSprintId(e.target.value)}
            >
              <option value="">Todos</option>
              {mockSprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Usuario</Label>
            <Select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              <option value="">Todos</option>
              {mockUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Tipo de evento</Label>
            <Select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="tarea">Tarea</option>
              <option value="sprint">Sprint</option>
              <option value="usuario">Usuario</option>
              <option value="sistema">Sistema</option>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button variant="outline" onClick={resetFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </Section>

      {/* Table (kept structure, just wrapped) */}
      <Section>
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH>Fecha y hora</TH>
                <TH>Usuario</TH>
                <TH>Acción</TH>
                <TH>Entidad</TH>
                <TH>Detalle</TH>
              </tr>
            </THead>

            <tbody>
              {filteredEntries.length === 0 ? (
                <TRow>
                  <TD>
                    <div className="py-4 text-center text-[var(--color-text-muted)]">
                      No hay actividad con los filtros seleccionados.
                    </div>
                  </TD>
                </TRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TRow key={entry.id}>
                    <TD className="whitespace-nowrap text-[var(--color-text-muted)]">
                      {formatTimestamp(entry.timestamp)}
                    </TD>

                    <TD className="font-medium">
                      {entry.userName}
                    </TD>

                    <TD>
                      <Badge variant="default">{entry.action}</Badge>
                    </TD>

                    <TD>
                      <Badge variant={getEntityVariant(entry.entityType)}>
                        {ENTITY_LABELS[entry.entityType]}
                      </Badge>
                    </TD>

                    <TD className="text-[var(--color-text-muted)]">
                      {entry.details ?? '—'}
                    </TD>
                  </TRow>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Section>
    </div>
  )
}