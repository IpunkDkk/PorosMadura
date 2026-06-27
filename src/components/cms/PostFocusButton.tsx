'use client'

import { useEffect, useRef, useState } from 'react'
import { Maximize2 } from 'lucide-react'

type PostFocusButtonProps = {
  slug?: string | null
}

export function PostFocusButton({ slug }: PostFocusButtonProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [currentSlug, setCurrentSlug] = useState(slug || '')

  useEffect(() => {
    const form = rootRef.current?.closest('form')
    if (!form) return

    function syncSlug() {
      const slugField = form?.querySelector<HTMLInputElement>('input[name="slug"]')
      setCurrentSlug(slugField?.value || slug || '')
    }

    syncSlug()
    form.addEventListener('input', syncSlug)
    form.addEventListener('change', syncSlug)
    const interval = setInterval(syncSlug, 1000)

    return () => {
      form.removeEventListener('input', syncSlug)
      form.removeEventListener('change', syncSlug)
      clearInterval(interval)
    }
  }, [slug])

  return (
    <div ref={rootRef}>
      <button
        type="button"
        disabled={!currentSlug}
        onClick={() => {
          if (currentSlug) window.location.href = `/cms/posts/${currentSlug}/focus`
        }}
        className="inline-flex items-center gap-2 rounded-md border border-border-light bg-white px-4 py-2 text-sm font-bold text-text-primary hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        title={currentSlug ? 'Buka mode fokus konten' : 'Isi judul atau tunggu autosave dulu'}
      >
        <Maximize2 size={16} />
        Fokus
      </button>
    </div>
  )
}
