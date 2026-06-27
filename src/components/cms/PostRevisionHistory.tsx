import { RotateCcw } from 'lucide-react'
import { restorePostRevisionAction } from '@/lib/cms-admin'

type Revision = {
  id: number
  type: string
  title?: string | null
  createdAt: Date | string
}

type PostRevisionHistoryProps = {
  postId: number
  revisions: Revision[]
}

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function revisionLabel(type: string) {
  if (type === 'autosave') return 'Autosave'
  if (type === 'restore') return 'Restore'
  return 'Manual'
}

export function PostRevisionHistory({ postId, revisions }: PostRevisionHistoryProps) {
  if (!revisions.length) return null

  return (
    <section className="bg-white border border-border-light rounded-lg p-5 space-y-4">
      <div>
        <h2 className="font-heading text-lg font-bold text-poros-navy">Version History</h2>
        <p className="text-xs text-text-secondary">Riwayat autosave, simpan manual, dan restore artikel.</p>
      </div>

      <div className="divide-y divide-border-light">
        {revisions.map((revision) => (
          <div key={revision.id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-bold uppercase text-text-secondary">
                  {revisionLabel(revision.type)}
                </span>
                <p className="truncate text-sm font-semibold text-poros-navy">
                  {revision.title || 'Tanpa judul'}
                </p>
              </div>
              <p className="mt-1 text-xs text-text-secondary">{formatDate(revision.createdAt)}</p>
            </div>
            <form action={restorePostRevisionAction.bind(null, postId, revision.id)}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md border border-border-light px-3 py-1.5 text-xs font-bold text-text-secondary hover:border-poros-red hover:text-poros-red"
              >
                <RotateCcw size={14} />
                Restore
              </button>
            </form>
          </div>
        ))}
      </div>
    </section>
  )
}
