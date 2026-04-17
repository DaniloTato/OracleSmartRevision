/**
 * Right-side drawer for AI recommendations. Accept applies assignment; Ignore hides the item.
 */

import type { AIRecommendation } from '../../mock/aiRecommendations'

interface AISuggestionsDrawerProps {
  isOpen: boolean
  onClose: () => void
  recommendations: AIRecommendation[]
  ignoredIds: Set<string>
  appliedIds: Set<string>
  onAccept: (rec: AIRecommendation) => void
  onIgnore: (recId: string) => void
}

export function AISuggestionsDrawer({
  isOpen,
  onClose,
  recommendations,
  ignoredIds,
  appliedIds,
  onAccept,
  onIgnore,
}: AISuggestionsDrawerProps) {
  const visible = recommendations.filter(
    (r) => !ignoredIds.has(r.id) && !appliedIds.has(r.id)
  )

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-xl flex flex-col border-l border-[var(--color-border)]"
        aria-label="Recomendaciones de IA"
      >
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Recomendaciones de IA
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[var(--color-text-muted)] hover:bg-gray-100 hover:text-[var(--color-text)]"
            aria-label="Cerrar"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="p-3 border-b border-[var(--color-border)] bg-amber-50/80 rounded-none">
          <p className="text-xs text-amber-900 flex items-center gap-1.5">
            <span aria-hidden className="text-base">ℹ️</span>
            Estas recomendaciones son simuladas (mock) para la demostración.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {visible.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              No hay recomendaciones pendientes.
            </p>
          ) : (
            <ul className="space-y-4">
              {visible.map((rec) => (
                <li
                  key={rec.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-sidebar-bg)] p-3"
                >
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    Asignar &quot;{rec.taskTitle}&quot; a &quot;{rec.suggestedUserName}&quot; (
                    <span className="text-[var(--color-oracle-orange)]">
                      Confianza {rec.confidence}%
                    </span>
                    )
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {rec.reason}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onAccept(rec)}
                      className="rounded-lg bg-[var(--color-oracle-orange)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                    >
                      Aceptar
                    </button>
                    <button
                      type="button"
                      onClick={() => onIgnore(rec.id)}
                      className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:bg-gray-100"
                    >
                      Ignorar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
