'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

type CmsModalNoticeProps = {
  open: boolean
  title: string
  description: string
}

export function CmsModalNotice({ open: initialOpen, title, description }: CmsModalNoticeProps) {
  const [open, setOpen] = useState(initialOpen)
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-sm rounded-lg border border-border-light bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-50 text-poros-red">
            <AlertTriangle size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-heading text-lg font-black text-poros-navy">{title}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-text-secondary hover:bg-gray-100 hover:text-text-primary"
                aria-label="Tutup modal"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="w-full rounded-md bg-poros-red px-3 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          Mengerti
        </button>
      </div>
    </div>
  )
}
