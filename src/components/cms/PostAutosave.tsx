'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2, Save, XCircle } from 'lucide-react'
import { formatPortalTime } from '@/lib/date'

type PostAutosaveProps = {
  postId?: number | null
}

function formValue(form: HTMLFormElement, name: string) {
  const field = form.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${name}"]`)
  if (!field) return ''
  if (field instanceof HTMLInputElement && field.type === 'checkbox') return field.checked
  return field.value
}

function collectPayload(form: HTMLFormElement, postId?: number | null) {
  const tagIds = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="tagIds"]:checked'))
    .map((field) => field.value)

  const autosavePostId = form.querySelector<HTMLInputElement>('input[name="autosavePostId"]')?.value || ''

  return {
    postId: postId || undefined,
    autosavePostId: autosavePostId || undefined,
    title: formValue(form, 'title'),
    slug: formValue(form, 'slug'),
    status: formValue(form, 'status'),
    excerpt: formValue(form, 'excerpt'),
    content: formValue(form, 'content'),
    seoTitle: formValue(form, 'seoTitle'),
    seoDescription: formValue(form, 'seoDescription'),
    canonicalUrl: formValue(form, 'canonicalUrl'),
    publishedAt: formValue(form, 'publishedAt'),
    isFeatured: formValue(form, 'isFeatured'),
    isBreakingNews: formValue(form, 'isBreakingNews'),
    allowIndex: formValue(form, 'allowIndex'),
    readingTime: formValue(form, 'readingTime'),
    featuredImageId: formValue(form, 'featuredImageId'),
    ogImageId: formValue(form, 'ogImageId'),
    categoryId: formValue(form, 'categoryId'),
    authorId: formValue(form, 'authorId'),
    sourceName: formValue(form, 'sourceName'),
    sourceUrl: formValue(form, 'sourceUrl'),
    tagIds,
  }
}

export function PostAutosave({ postId }: PostAutosaveProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastPayloadRef = useRef('')
  const applyingAutosaveRef = useRef(false)
  const [state, setState] = useState<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('Autosave aktif')

  useEffect(() => {
    const form = rootRef.current?.closest('form')
    if (!form) return
    lastPayloadRef.current = JSON.stringify(collectPayload(form, postId))

    async function saveNow() {
      if (!form) return
      const payload = collectPayload(form, postId)
      const serialized = JSON.stringify(payload)
      if (serialized === lastPayloadRef.current) return

      const hasMeaningfulContent = String(payload.title || '').trim() || String(payload.content || '').trim() || String(payload.excerpt || '').trim()
      if (!postId && !payload.autosavePostId && !hasMeaningfulContent) return

      setState('saving')
      setMessage('Menyimpan otomatis...')

      try {
        const response = await fetch('/api/cms/posts/autosave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: serialized,
        })
        const result = await response.json()
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Autosave gagal')
        }

        applyingAutosaveRef.current = true
        try {
          const hidden = form.querySelector<HTMLInputElement>('input[name="autosavePostId"]')
          if (hidden) hidden.value = String(result.postId)
          const slugField = form.querySelector<HTMLInputElement>('input[name="slug"]')
          if (slugField && result.slug) {
            slugField.value = String(result.slug)
          }
        } finally {
          applyingAutosaveRef.current = false
        }
        if (!postId && result.editUrl) {
          window.history.replaceState(null, '', result.editUrl)
        }

        lastPayloadRef.current = JSON.stringify(collectPayload(form, postId))
        setState('saved')
        setMessage(`Tersimpan otomatis ${formatPortalTime(result.savedAt)}`)
      } catch (error) {
        setState('error')
        setMessage(error instanceof Error ? error.message : 'Autosave gagal')
      }
    }

    function scheduleSave() {
      if (applyingAutosaveRef.current) return
      setState((current) => current === 'saving' ? current : 'dirty')
      setMessage('Perubahan belum tersimpan')
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(saveNow, 2500)
    }

    form.addEventListener('input', scheduleSave)
    form.addEventListener('change', scheduleSave)
    const interval = setInterval(saveNow, 30000)

    return () => {
      form.removeEventListener('input', scheduleSave)
      form.removeEventListener('change', scheduleSave)
      clearInterval(interval)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [postId])

  const icon = state === 'saving'
    ? <Loader2 size={14} className="animate-spin" />
    : state === 'error'
      ? <XCircle size={14} />
      : state === 'saved'
        ? <CheckCircle2 size={14} />
        : <Save size={14} />

  return (
    <div
      ref={rootRef}
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold ${
        state === 'error'
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-border-light bg-gray-50 text-text-secondary'
      }`}
    >
      {icon}
      <span>{message}</span>
    </div>
  )
}
