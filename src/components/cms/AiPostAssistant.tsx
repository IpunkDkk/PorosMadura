'use client'

import { useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Link2, Loader2, Sparkles } from 'lucide-react'

type Option = {
  id: number
  name: string
}

type AiPostAssistantProps = {
  categories: Option[]
  tags: Option[]
}

type AiDraft = {
  form: {
    title: string
    slug: string
    excerpt: string
    content: string
    seoTitle: string
    seoDescription: string
    canonicalUrl: string
    sourceName: string
    sourceUrl: string
    category: string
    tagNames: string[]
    featuredImageId?: number
    ogImageId?: number
    readingTime: number
    status: 'draft'
    allowIndex: boolean
  }
  diagnostics: {
    scrapedCharacters: number
    pipeline: string[]
    warnings?: string[]
  }
  importedMedia?: {
    id: number
    alt?: string | null
    filename?: string | null
    url?: string | null
    sizesThumbnailUrl?: string | null
    sizesCardUrl?: string | null
  }
}

type AiDraftResponse = {
  success: boolean
  jobId?: string
  job?: {
    id: string
    status: 'queued' | 'running' | 'completed' | 'failed'
    stage: string
    progress: number
    message: string
    error?: string
    draft?: AiDraft
  }
  draft?: AiDraft
  error?: string
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function dispatchFieldEvent(element: Element) {
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

export function AiPostAssistant({ categories, tags }: AiPostAssistantProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [articleUrl, setArticleUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [importImage, setImportImage] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [normalize(category.name), category.id]))
  }, [categories])

  function getForm() {
    return rootRef.current?.closest('form') || null
  }

  function setField(name: string, value: string | number | boolean) {
    const form = getForm()
    const field = form?.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${name}"]`)
    if (!field) return

    if (field instanceof HTMLInputElement && field.type === 'checkbox') {
      field.checked = Boolean(value)
    } else {
      field.value = String(value ?? '')
    }
    dispatchFieldEvent(field)
  }

  function applyTags(tagNames: string[]) {
    const form = getForm()
    if (!form) return

    const normalizedAiTags = new Set(tagNames.map(normalize).filter(Boolean))
    const matchedTagIds = tags
      .filter((tag) => normalizedAiTags.has(normalize(tag.name)))
      .map((tag) => String(tag.id))

    form.querySelectorAll<HTMLInputElement>('input[name="tagIds"]').forEach((checkbox) => {
      checkbox.checked = matchedTagIds.includes(checkbox.value)
      dispatchFieldEvent(checkbox)
    })
  }

  function applyCategory(categoryName: string) {
    const exact = categoryMap.get(normalize(categoryName))
    if (exact) {
      setField('categoryId', exact)
      return
    }

    const partial = categories.find((category) => {
      const left = normalize(category.name)
      const right = normalize(categoryName)
      return left && right && (left.includes(right) || right.includes(left))
    })
    if (partial) setField('categoryId', partial.id)
  }

  function applyDraft(draft: NonNullable<AiDraftResponse['draft']>) {
    const { form } = draft
    setField('title', form.title)
    setField('slug', form.slug)
    setField('status', 'draft')
    setField('excerpt', form.excerpt)
    setField('seoTitle', form.seoTitle)
    setField('seoDescription', form.seoDescription)
    setField('canonicalUrl', form.canonicalUrl)
    setField('sourceName', form.sourceName)
    setField('sourceUrl', form.sourceUrl)
    setField('readingTime', form.readingTime)
    setField('allowIndex', form.allowIndex)
    applyCategory(form.category)
    applyTags(form.tagNames)
    if (form.featuredImageId) {
      setField('featuredImageId', form.featuredImageId)
      window.dispatchEvent(new CustomEvent('cms:set-media-field', {
        detail: { name: 'featuredImageId', id: form.featuredImageId, media: draft.importedMedia },
      }))
    }
    if (form.ogImageId) {
      setField('ogImageId', form.ogImageId)
      window.dispatchEvent(new CustomEvent('cms:set-media-field', {
        detail: { name: 'ogImageId', id: form.ogImageId, media: draft.importedMedia },
      }))
    }

    window.dispatchEvent(new CustomEvent('cms:set-rich-text-content', {
      detail: {
        name: 'content',
        html: form.content,
      },
    }))
  }

  async function pollJob(jobId: string) {
    while (true) {
      const response = await fetch(`/api/cms/ai-news/${jobId}`, {
        cache: 'no-store',
      })
      const data = await response.json() as AiDraftResponse
      if (!response.ok || !data.success || !data.job) {
        throw new Error(data.error || 'Gagal membaca status job AI.')
      }

      setProgress(Math.max(0, Math.min(100, Number(data.job.progress || 0))))
      setStage(data.job.stage)
      setMessage(data.job.message || `Pipeline ${data.job.stage}`)

      if (data.job.status === 'completed') {
        if (!data.job.draft) throw new Error('Job selesai tetapi draft kosong.')
        applyDraft(data.job.draft)
        const warnings = data.job.draft.diagnostics.warnings
        setMessage(warnings?.length ? `Draft terisi. Catatan: ${warnings.join('; ')}` : 'Draft terisi dari pipeline AI.')
        return
      }

      if (data.job.status === 'failed') {
        throw new Error(data.job.error || 'Pipeline AI gagal.')
      }

      await new Promise((resolve) => setTimeout(resolve, 1500))
    }
  }

  async function handleGenerate() {
    const url = articleUrl.trim()
    if (!url) {
      setError('Masukkan URL artikel sumber.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/cms/ai-news/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleUrl: url, importImage }),
      })
      const data = await response.json() as AiDraftResponse
      if (!response.ok || !data.success || !data.jobId) {
        throw new Error(data.error || 'Gagal membuat job artikel AI.')
      }

      setProgress(3)
      setStage('queued')
      setMessage('Job AI masuk antrean.')
      await pollJob(data.jobId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal generate artikel.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={rootRef} className="bg-white border border-border-light rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold text-poros-navy">AI Assistant</h2>
          <p className="text-xs text-text-secondary">Generate draft dari URL artikel sumber.</p>
        </div>
        <Sparkles size={20} className="text-poros-red" />
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <label className="sr-only" htmlFor="aiArticleUrl">URL artikel sumber</label>
        <div className="relative flex-1">
          <Link2 size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            id="aiArticleUrl"
            type="url"
            value={articleUrl}
            onChange={(event) => setArticleUrl(event.target.value)}
            placeholder="https://domain.com/artikel-sumber"
            className="w-full rounded-md border border-border-light py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
          />
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Generate
        </button>
      </div>

      <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
        <input
          type="checkbox"
          checked={importImage}
          onChange={(event) => setImportImage(event.target.checked)}
          className="h-4 w-4"
        />
        Impor gambar sumber ke Media Library dan gunakan sebagai Featured/OG Image
      </label>

      {message && (
        <div className="space-y-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
          {(loading || progress > 0) && (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-wide">
                <span>{stage || 'queued'}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-green-100">
                <div
                  className="h-full rounded-full bg-poros-red transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
