'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type PostFocusSidePanelProps = {
  children: ReactNode
  defaultOpen?: boolean
}

export function PostFocusSidePanel({ children, defaultOpen = false }: PostFocusSidePanelProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`fixed right-0 top-1/2 z-40 inline-flex h-14 w-9 -translate-y-1/2 items-center justify-center rounded-l-lg border border-r-0 border-border-light bg-white text-poros-navy shadow-lg transition-transform hover:text-poros-red ${
          open ? '-translate-x-[360px]' : 'translate-x-0'
        }`}
        aria-label={open ? 'Sembunyikan panel pengaturan' : 'Buka panel pengaturan'}
        title={open ? 'Sembunyikan panel' : 'Buka panel'}
      >
        {open ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
      </button>

      <aside
        className={`fixed inset-y-0 right-0 z-30 w-[360px] max-w-[calc(100vw-2.5rem)] border-l border-border-light bg-page-bg shadow-2xl transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-border-light bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-poros-red">Panel artikel</p>
            <h2 className="font-heading text-lg font-black text-poros-navy">Pengaturan</h2>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {children}
          </div>
        </div>
      </aside>
    </>
  )
}
