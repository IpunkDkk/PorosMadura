'use client'

import { useEffect, useRef, useState } from 'react'
import { Calendar, Clock, Eye, EyeOff, User } from 'lucide-react'
import { RichTextEditor } from '@/components/cms/RichTextEditor'
import { getMediaUrl } from '@/lib/media'

type MediaItem = {
  id: number
  alt?: string | null
  filename?: string | null
  url?: string | null
  sizesThumbnailUrl?: string | null
  sizesCardUrl?: string | null
  sizesHeroUrl?: string | null
}

type RelationItem = {
  id: number
  name: string
  slug?: string | null
}

type PostFocusEditorProps = {
  initialTitle?: string
  initialExcerpt?: string | null
  initialContent?: string
  initialFeaturedImageId?: number | string | null
  initialCategoryId?: number | string | null
  initialAuthorId?: number | string | null
  initialTagIds?: Array<number | string | null>
  initialPublishedAt?: string | Date | null
  initialReadingTime?: number | string | null
  mediaItems?: MediaItem[]
  categories?: RelationItem[]
  authors?: RelationItem[]
  tags?: RelationItem[]
}

function formValue(form: HTMLFormElement, name: string) {
  const field = form.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${name}"]`)
  if (!field) return ''
  if (field instanceof HTMLInputElement && field.type === 'checkbox') return field.checked ? field.value || 'on' : ''
  return field.value
}

function selectedTagIds(form: HTMLFormElement) {
  return Array.from(form.querySelectorAll<HTMLInputElement>('input[name="tagIds"]:checked'))
    .map((field) => field.value)
}

function inputDateLabel(value: string | Date | null | undefined) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function mediaHeroUrl(media: MediaItem | undefined) {
  if (!media) return ''
  return media.sizesHeroUrl || media.sizesCardUrl || media.url || getMediaUrl(media as Record<string, unknown>)
}

function splitHtmlAtMiddle(html: string): [string, string] {
  const half = Math.floor(html.length / 2)
  const before = html.lastIndexOf('</p>', half)
  const after = html.indexOf('<p>', half)
  const splitAt = before > 0 && (after < 0 || half - before < after - half) ? before + 4 : after
  if (splitAt < 0) return [html, '']
  return [html.slice(0, splitAt), html.slice(splitAt)]
}

function PreviewAdPlaceholder({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wide text-gray-400 ${className}`}>
      {label}
    </div>
  )
}

function HtmlPreviewBlock({ html }: { html: string }) {
  if (!html) {
    return <p className="text-text-secondary">Konten preview akan tampil di sini.</p>
  }

  return <div key={html} dangerouslySetInnerHTML={{ __html: html }} />
}

export function PostFocusEditor({
  initialTitle = '',
  initialExcerpt = '',
  initialContent = '',
  initialFeaturedImageId = '',
  initialCategoryId = '',
  initialAuthorId = '',
  initialTagIds = [],
  initialPublishedAt = null,
  initialReadingTime = '',
  mediaItems = [],
  categories = [],
  authors = [],
  tags = [],
}: PostFocusEditorProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [title, setTitle] = useState(initialTitle)
  const [excerpt, setExcerpt] = useState(initialExcerpt || '')
  const [content, setContent] = useState(initialContent)
  const [previewContent, setPreviewContent] = useState(initialContent)
  const [previewCollapsed, setPreviewCollapsed] = useState(false)
  const [featuredImageId, setFeaturedImageId] = useState(initialFeaturedImageId ? String(initialFeaturedImageId) : '')
  const [categoryId, setCategoryId] = useState(initialCategoryId ? String(initialCategoryId) : '')
  const [authorId, setAuthorId] = useState(initialAuthorId ? String(initialAuthorId) : '')
  const [tagIds, setTagIds] = useState(initialTagIds.map((id) => String(id)).filter(Boolean))
  const [publishedAt, setPublishedAt] = useState(initialPublishedAt ? String(initialPublishedAt) : '')
  const [readingTime, setReadingTime] = useState(initialReadingTime ? String(initialReadingTime) : '')
  const featuredImage = mediaItems.find((item) => String(item.id) === featuredImageId)
  const category = categories.find((item) => String(item.id) === categoryId)
  const author = authors.find((item) => String(item.id) === authorId)
  const selectedTags = tags.filter((tag) => tagIds.includes(String(tag.id)))
  const contentParts = splitHtmlAtMiddle(previewContent)

  useEffect(() => {
    const timeout = setTimeout(() => setPreviewContent(content), 250)
    return () => clearTimeout(timeout)
  }, [content])

  useEffect(() => {
    const form = rootRef.current?.closest('form')
    if (!form) return
    const formElement = form

    function syncFromForm() {
      setFeaturedImageId(String(formValue(formElement, 'featuredImageId') || ''))
      setCategoryId(String(formValue(formElement, 'categoryId') || ''))
      setAuthorId(String(formValue(formElement, 'authorId') || ''))
      setPublishedAt(String(formValue(formElement, 'publishedAt') || ''))
      setReadingTime(String(formValue(formElement, 'readingTime') || ''))
      setTagIds(selectedTagIds(formElement))
    }

    syncFromForm()
    formElement.addEventListener('input', syncFromForm)
    formElement.addEventListener('change', syncFromForm)
    const interval = setInterval(syncFromForm, 1000)

    return () => {
      formElement.removeEventListener('input', syncFromForm)
      formElement.removeEventListener('change', syncFromForm)
      clearInterval(interval)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className="relative min-h-[calc(100vh-220px)]"
    >
      {previewCollapsed && (
        <button
          type="button"
          onClick={() => setPreviewCollapsed(false)}
          className="fixed right-12 top-24 z-30 inline-flex items-center gap-2 rounded-md border border-border-light bg-white px-3 py-2 text-xs font-bold text-text-primary shadow-lg hover:bg-gray-50"
        >
          <Eye size={14} />
          Tampilkan preview
        </button>
      )}

      <div
        className={`grid grid-cols-1 gap-5 ${
          previewCollapsed ? 'xl:grid-cols-1' : 'xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.82fr)]'
        }`}
      >
      <section className="space-y-4">
        <div className="bg-white border border-border-light rounded-lg p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="title">Judul</label>
            <input
              id="title"
              name="title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-md border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="excerpt">Ringkasan</label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              className="w-full rounded-md border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
            />
          </div>
        </div>

        <div className="bg-white border border-border-light rounded-lg p-5">
          <label className="block text-sm font-semibold mb-3">Konten</label>
          <RichTextEditor
            name="content"
            initialContent={initialContent}
            mediaItems={mediaItems}
            onChange={setContent}
            editorClassName="min-h-[62vh] px-5 py-4 text-base leading-8 focus:outline-none prose max-w-none prose-red"
          />
        </div>
      </section>

      {!previewCollapsed && (
      <aside className="xl:sticky xl:top-5 xl:self-start">
        <div className="rounded-lg border border-border-light bg-white">
          <div className="flex min-h-9 items-center justify-between gap-3 border-b border-border-light px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-poros-red">Preview sesuai halaman publik</p>
            <button
              type="button"
              onClick={() => setPreviewCollapsed(true)}
              className="inline-flex items-center gap-2 rounded-md border border-border-light bg-white px-3 py-1.5 text-xs font-bold text-text-primary hover:bg-gray-50"
            >
              <EyeOff size={14} />
              Sembunyikan
            </button>
          </div>

          <div className="max-h-[calc(100vh-150px)] overflow-y-auto">
              <div className="px-5 py-5">
                <nav className="mb-5 flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb preview">
                  <span className="font-medium">Home</span>
                  <span className="text-gray-300">/</span>
                  {category?.name && (
                    <>
                      <span className="font-medium">{category.name}</span>
                      <span className="text-gray-300">/</span>
                    </>
                  )}
                  <span className="truncate font-semibold text-gray-800">{title || 'Judul artikel'}</span>
                </nav>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                  <article className="lg:col-span-8">
                    <h1 className="font-heading text-3xl font-black leading-tight text-gray-900">
                      {title || 'Judul artikel'}
                    </h1>
                    {excerpt ? (
                      <p className="mt-4 text-base font-medium leading-relaxed text-gray-600">
                        {excerpt}
                      </p>
                    ) : null}

                    <div className="mb-6 mt-6 flex flex-wrap items-center gap-3 border-b border-gray-200 pb-5 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <User size={14} /> {author?.name || 'Redaksi'}
                      </span>
                      {publishedAt && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} /> {inputDateLabel(publishedAt)}
                        </span>
                      )}
                      {readingTime ? (
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} /> {readingTime} menit baca
                        </span>
                      ) : null}
                    </div>

                    {featuredImage && (
                      <div className="mb-6 overflow-hidden rounded-2xl">
                        {/* eslint-disable-next-line @next/next/no-img-element -- CMS preview reflects selected media immediately without requiring fixed Next image dimensions */}
                        <img
                          src={mediaHeroUrl(featuredImage)}
                          alt={featuredImage.alt || title || ''}
                          className="aspect-[16/9] w-full object-cover"
                        />
                      </div>
                    )}

                    <PreviewAdPlaceholder label="Slot iklan artikel atas" className="my-5 h-[90px]" />

                    <div className="prose prose-lg prose-headings:font-heading max-w-none leading-relaxed">
                      <HtmlPreviewBlock html={contentParts[0]} />
                    </div>

                    <PreviewAdPlaceholder label="Slot iklan artikel tengah" className="my-5 h-[90px]" />

                    {contentParts[1] ? (
                      <div className="prose prose-lg prose-headings:font-heading max-w-none leading-relaxed">
                        <HtmlPreviewBlock html={contentParts[1]} />
                      </div>
                    ) : null}

                    <PreviewAdPlaceholder label="Slot iklan artikel bawah" className="my-5 h-[90px]" />

                    {selectedTags.length > 0 && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                          <span
                            key={tag.id}
                            className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>

                  <aside className="space-y-6 lg:col-span-4">
                    <PreviewAdPlaceholder label="Slot iklan sidebar" className="h-[250px]" />
                    <div className="rounded-2xl border border-border-light bg-surface p-5">
                      <h3 className="font-heading text-lg font-black text-poros-navy">Terpopuler</h3>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Placeholder sidebar publik</p>
                      <div className="mt-4 space-y-4">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="flex gap-3">
                            <div className="w-8 shrink-0 text-right text-4xl font-black leading-none text-gray-200">{item}</div>
                            <div className="flex-1 space-y-2 pt-1">
                              <div className="h-3 w-20 rounded bg-gray-100" />
                              <div className="h-4 rounded bg-gray-100" />
                              <div className="h-4 w-3/4 rounded bg-gray-100" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
        </div>
      </aside>
      )}
      </div>
    </div>
  )
}
