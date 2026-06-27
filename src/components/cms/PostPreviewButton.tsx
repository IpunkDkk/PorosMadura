'use client'

import { useEffect, useRef, useState } from 'react'
import { Eye } from 'lucide-react'

type PostPreviewButtonProps = {
  postId?: number | null
}

export function PostPreviewButton({ postId }: PostPreviewButtonProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [currentPostId, setCurrentPostId] = useState(postId ? String(postId) : '')

  useEffect(() => {
    const form = rootRef.current?.closest('form')
    if (!form) return

    function syncPostId() {
      const hidden = form?.querySelector<HTMLInputElement>('input[name="autosavePostId"]')
      setCurrentPostId(hidden?.value || (postId ? String(postId) : ''))
    }

    syncPostId()
    form.addEventListener('input', syncPostId)
    form.addEventListener('change', syncPostId)
    const interval = setInterval(syncPostId, 1000)

    return () => {
      form.removeEventListener('input', syncPostId)
      form.removeEventListener('change', syncPostId)
      clearInterval(interval)
    }
  }, [postId])

  function openPreview() {
    if (!currentPostId) return
    window.open(`/preview/posts/${currentPostId}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div ref={rootRef}>
      <button
        type="button"
        onClick={openPreview}
        disabled={!currentPostId}
        className="inline-flex items-center gap-2 rounded-md border border-border-light bg-white px-4 py-2 text-sm font-bold text-text-primary hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        title={currentPostId ? 'Buka preview artikel' : 'Autosave dulu untuk membuat preview'}
      >
        <Eye size={16} />
        Preview
      </button>
    </div>
  )
}
