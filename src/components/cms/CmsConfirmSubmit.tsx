'use client'

import { useState } from 'react'
import { Trash2, X } from 'lucide-react'

type CmsConfirmSubmitProps = {
  label?: string
  title: string
  description: string
  confirmLabel?: string
  className?: string
}

export function CmsConfirmSubmit({
  label = 'Hapus',
  title,
  description,
  confirmLabel = 'Ya, hapus',
  className,
}: CmsConfirmSubmitProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className || 'inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50'}
      >
        <Trash2 size={15} /> {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-sm rounded-lg border border-border-light bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-black text-poros-navy">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-text-secondary hover:bg-gray-100 hover:text-text-primary"
                aria-label="Tutup modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-border-light px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-poros-red px-3 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                <Trash2 size={15} /> {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
