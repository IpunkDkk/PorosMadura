'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Upload, X, Copy, Check, Image as ImageIcon, AlertCircle, Loader2, RotateCcw } from 'lucide-react'
import { deleteMediaAction, uploadMediaAction } from '@/lib/cms-admin'
import { getMediaUrl } from '@/lib/media'
import { CmsConfirmSubmit } from '@/components/cms/CmsConfirmSubmit'

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

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

function isNextRedirectError(error: unknown) {
  return Boolean(
    typeof error === 'object' &&
      error &&
      'digest' in error &&
      typeof (error as { digest?: unknown }).digest === 'string' &&
      (error as { digest: string }).digest.startsWith('NEXT_REDIRECT'),
  )
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
            <Image
              src={url}
              alt={item.alt || ''}
              width={640}
              height={480}
              className="max-h-[340px] max-w-full object-contain rounded-lg"
            />
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewDimensions, setPreviewDimensions] = useState<{ width: number; height: number } | null>(null)
  const [uploadError, setUploadError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewObjectUrlRef = useRef('')

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) URL.revokeObjectURL(previewObjectUrlRef.current)
    }
  }, [])

  const setInputFile = useCallback((file: File) => {
    if (!fileInputRef.current) return
    const dt = new DataTransfer()
    dt.items.add(file)
    fileInputRef.current.files = dt.files
  }, [])

  const resetFileSelection = useCallback(() => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current)
      previewObjectUrlRef.current = ''
    }
    setSelectedFile(null)
    setFileName('')
    setPreviewUrl('')
    setPreviewDimensions(null)
    setUploadError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const chooseFile = useCallback((file: File | undefined, syncInput = false) => {
    setUploadError('')
    if (!file) return

    if (!file.type.startsWith('image/')) {
      resetFileSelection()
      setUploadError('File harus berupa gambar.')
      return
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      resetFileSelection()
      setUploadError('Ukuran file maksimal 10MB.')
      return
    }

    setSelectedFile(file)
    setFileName(file.name)
    if (previewObjectUrlRef.current) URL.revokeObjectURL(previewObjectUrlRef.current)
    const objectUrl = URL.createObjectURL(file)
    previewObjectUrlRef.current = objectUrl
    setPreviewUrl(objectUrl)
    setPreviewDimensions(null)

    const previewImage = new window.Image()
    previewImage.onload = () => {
      if (previewObjectUrlRef.current !== objectUrl) return
      setPreviewDimensions({
        width: previewImage.naturalWidth,
        height: previewImage.naturalHeight,
      })
    }
    previewImage.onerror = () => {
      if (previewObjectUrlRef.current !== objectUrl) return
      resetFileSelection()
      setUploadError('Preview gambar gagal dibaca.')
    }
    previewImage.src = objectUrl

    if (syncInput) setInputFile(file)
  }, [resetFileSelection, setInputFile])

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
    chooseFile(file, true)
  }, [chooseFile])

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <section className="rounded-xl border border-border-light bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-heading text-lg font-bold text-poros-navy">Upload Media</h2>
        <form
          ref={formRef}
          action={async (formData: FormData) => {
            setUploadError('')
            setIsUploading(true)
            try {
              await uploadMediaAction(formData)
              resetFileSelection()
              if (formRef.current) formRef.current.reset()
              window.location.reload()
            } catch (error) {
              if (isNextRedirectError(error)) throw error
              setUploadError(error instanceof Error ? error.message : 'Upload gagal. Coba ulangi.')
            } finally {
              setIsUploading(false)
            }
          }}
          className="space-y-4"
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative grid gap-4 rounded-xl border-2 border-dashed p-4 transition-colors md:grid-cols-[minmax(0,1fr)_260px] ${
              isDragging
                ? 'border-poros-red bg-red-50'
                : 'border-border-light hover:border-poros-red/50 hover:bg-gray-50'
            }`}
          >
            <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
              <Upload size={34} className={isDragging ? 'text-poros-red' : 'text-gray-400'} />
              <p className="mt-3 text-sm font-semibold text-text-secondary">
                {isDragging ? 'Lepas file untuk memilih gambar' : fileName ? fileName : 'Drag & drop gambar di sini'}
              </p>
              <p className="mt-1 text-xs text-gray-400">PNG, JPG, WebP, GIF hingga 10MB</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <label className="cursor-pointer rounded-lg bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors">
                  {selectedFile ? 'Ganti File' : 'Pilih File'}
                  <input
                    ref={fileInputRef}
                    name="file"
                    type="file"
                    accept="image/*"
                    required
                    className="hidden"
                    onChange={(e) => chooseFile(e.target.files?.[0])}
                  />
                </label>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={resetFileSelection}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border-light px-4 py-2 text-sm font-semibold text-text-secondary hover:border-poros-red hover:text-poros-red"
                  >
                    <RotateCcw size={14} /> Reset
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border-light bg-white p-3">
              {previewUrl ? (
                <div className="space-y-3">
                  <div
                    className="aspect-[16/10] rounded-md border border-border-light bg-gray-100 bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${previewUrl})` }}
                    aria-label="Preview gambar"
                  />
                  <div className="space-y-1 text-xs text-text-secondary">
                    <p className="truncate font-semibold text-gray-800" title={fileName}>{fileName}</p>
                    <p>{formatBytes(selectedFile?.size)}</p>
                    <p>{previewDimensions ? `${previewDimensions.width} × ${previewDimensions.height}px` : 'Membaca dimensi...'}</p>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-[16/10] flex-col items-center justify-center rounded-md border border-dashed border-border-light bg-gray-50 text-center text-gray-400">
                  <ImageIcon size={28} />
                  <p className="mt-2 text-xs font-semibold">Preview muncul setelah file dipilih</p>
                </div>
              )}
            </div>
          </div>

          {uploadError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

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
              disabled={isUploading || !selectedFile}
              className="inline-flex items-center gap-2 rounded-lg bg-poros-red px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {isUploading ? 'Mengupload...' : 'Upload'}
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
              <Image
                src={getMediaUrl(item as Record<string, unknown>)}
                alt={item.alt || item.filename || 'Media'}
                fill
                sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform group-hover:scale-105"
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
