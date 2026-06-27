'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Copy, Check, Image as ImageIcon } from 'lucide-react'
import { deleteMediaAction, uploadMediaAction } from '@/lib/cms-admin'
import { getMediaUrl } from '@/lib/media'
import { CmsConfirmSubmit } from '@/components/cms/CmsConfirmSubmit'

type MediaItem = {
  id: number
  alt?: string | null
  caption?: string | null
  credit?: string | null
  filename?: string | null
  mimeType?: string | null
  filesize?: number | null
  width?: number | null
  height?: number | null
  url?: string | null
}

function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function MediaDetailModal({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const url = getMediaUrl(item as Record<string, unknown>)

  const copyUrl = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8" onClick={onClose}>
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
          <h2 className="font-heading text-lg font-bold text-poros-navy truncate pr-4">{item.alt || item.filename || 'Media'}</h2>
          <button type="button" onClick={onClose} className="shrink-0 rounded-md p-1.5 text-text-secondary hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-gray-100 flex items-center justify-center min-h-[200px] max-h-[360px] p-2">
            <img src={url} alt={item.alt || ''} className="max-h-[340px] max-w-full object-contain rounded-lg" />
          </div>
          <div className="p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">URL</span>
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-poros-red hover:bg-red-50"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? 'Tersalin!' : 'Salin URL'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 break-all bg-gray-50 rounded-md p-2 font-mono border border-border-light">{url}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-text-secondary">Filename</p>
                  <p className="font-semibold truncate text-gray-800" title={item.filename || ''}>{item.filename || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Tipe</p>
                  <p className="font-semibold text-gray-800">{item.mimeType || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Ukuran</p>
                  <p className="font-semibold text-gray-800">{formatBytes(item.filesize)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Dimensi</p>
                  <p className="font-semibold text-gray-800">{item.width && item.height ? `${item.width} × ${item.height}` : '-'}</p>
                </div>
                {item.alt && (
                  <div className="col-span-2">
                    <p className="text-xs text-text-secondary">Alt text</p>
                    <p className="font-semibold text-gray-800">{item.alt}</p>
                  </div>
                )}
                {item.caption && (
                  <div className="col-span-2">
                    <p className="text-xs text-text-secondary">Caption</p>
                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2 rounded-md border border-border-light">{item.caption}</p>
                  </div>
                )}
                {item.credit && (
                  <div className="col-span-2">
                    <p className="text-xs text-text-secondary">Credit</p>
                    <p className="text-xs text-gray-600">{item.credit}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-border-light">
              <form action={deleteMediaAction.bind(null, item.id)}>
                <CmsConfirmSubmit
                  title="Hapus media?"
                  description="File media akan dihapus dari database dan storage. Konten yang memakai file ini bisa kehilangan gambar."
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50 transition-colors"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MediaGrid({ initialItems }: { initialItems: MediaItem[] }) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file || !formRef.current) return
    const dt = new DataTransfer()
    dt.items.add(file)
    const fileInput = formRef.current.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      fileInput.files = dt.files
      setFileName(file.name)
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <section className="rounded-xl border border-border-light bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-heading text-lg font-bold text-poros-navy">Upload Media</h2>
        <form
          ref={formRef}
          action={async (formData: FormData) => {
            setIsUploading(true)
            await uploadMediaAction(formData)
            setIsUploading(false)
            setFileName('')
            if (formRef.current) formRef.current.reset()
            window.location.reload() // Reload page to fetch updated list
          }}
          className="space-y-4"
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
              isDragging
                ? 'border-poros-red bg-red-50'
                : 'border-border-light hover:border-poros-red/50 hover:bg-gray-50'
            }`}
          >
            <Upload size={32} className={isDragging ? 'text-poros-red' : 'text-gray-400'} />
            <p className="mt-2 text-sm font-semibold text-text-secondary">
              {fileName ? `File terpilih: ${fileName}` : 'Drag & drop file di sini, atau'}
            </p>
            <label className="mt-2 cursor-pointer">
              <span className="rounded-lg bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors">
                Pilih File
              </span>
              <input
                name="file"
                type="file"
                accept="image/*"
                required
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFileName(e.target.files[0].name)
                  }
                }}
              />
            </label>
            <p className="mt-2 text-xs text-gray-400">PNG, JPG, WebP, GIF hingga 10MB</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Alt Text <span className="text-poros-red">*</span>
              </label>
              <input
                name="alt"
                required
                placeholder="Deskripsi gambar"
                className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Caption</label>
              <input
                name="caption"
                placeholder="Keterangan gambar"
                className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Credit / Sumber</label>
              <input
                name="credit"
                placeholder="Fotografer / sumber"
                className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-lg bg-poros-red px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              <Upload size={16} /> {isUploading ? 'Mengupload...' : 'Upload'}
            </button>
          </div>
        </form>
      </section>

      {/* Media Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-text-secondary">{initialItems.length} file media ditemukan</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {initialItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedItem(item)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border-light bg-white hover:border-poros-red hover:shadow-md transition-all"
            >
              <img
                src={getMediaUrl(item as Record<string, unknown>)}
                alt={item.alt || item.filename || 'Media'}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-left">
                <p className="truncate text-xs font-semibold text-white">{item.alt || item.filename}</p>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="rounded-full bg-white/90 p-1">
                  <ImageIcon size={12} className="text-poros-navy" />
                </div>
              </div>
            </button>
          ))}
          {!initialItems.length && (
            <div className="col-span-full flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-light bg-white py-16 text-center shadow-sm">
              <ImageIcon size={40} className="text-gray-300" />
              <div>
                <p className="font-semibold text-text-secondary">Belum ada media</p>
                <p className="text-xs text-gray-400 mt-1">Upload gambar pertama kamu di atas</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      {selectedItem && (
        <MediaDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  )
}
