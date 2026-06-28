'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Upload, X, Copy, Check, Image as ImageIcon, AlertCircle, Loader2, RotateCcw, Crop } from 'lucide-react'
import { cropMediaAction, deleteMediaAction, uploadMediaAction } from '@/lib/cms-admin'
import { getMediaUrl } from '@/lib/media'
import { CmsConfirmSubmit } from '@/components/cms/CmsConfirmSubmit'

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export type CropMediaItem = {
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
  sizesThumbnailUrl?: string | null
  sizesCardUrl?: string | null
  sizesHeroUrl?: string | null
  sizesOgUrl?: string | null
}

type MediaItem = CropMediaItem

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

function mediaPreviewUrl(item: MediaItem) {
  return item.sizesCardUrl || item.sizesThumbnailUrl || item.sizesHeroUrl || getMediaUrl(item as Record<string, unknown>).split('?')[0]
}

export function MediaCropForm({ item, onSaved }: { item: CropMediaItem; onSaved?: () => void }) {
  const width = item.width || 0
  const height = item.height || 0
  const cropFrameRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef<{
    pointerId: number
    mode: 'move' | 'resize'
    startClientX: number
    startClientY: number
    startCrop: { x: number; y: number; width: number; height: number }
    imageRect: { left: number; top: number; width: number; height: number }
  } | null>(null)
  const [crop, setCrop] = useState(() => {
    const initialWidth = Math.round(width * 0.82)
    const initialHeight = Math.round(height * 0.82)
    return {
      x: Math.round((width - initialWidth) / 2),
      y: Math.round((height - initialHeight) / 2),
      width: initialWidth,
      height: initialHeight,
    }
  })
  const [isSavingCrop, setIsSavingCrop] = useState(false)
  const [cropError, setCropError] = useState('')
  const editorImageUrl = mediaPreviewUrl(item)

  if (!width || !height) {
    return (
      <div className="rounded-md border border-border-light bg-gray-50 px-3 py-2 text-xs font-semibold text-text-secondary">
        Dimensi original tidak tersedia untuk crop.
      </div>
    )
  }

  const minCropSize = 40
  const cropX = Math.round(crop.x)
  const cropY = Math.round(crop.y)
  const cropWidth = Math.round(crop.width)
  const cropHeight = Math.round(crop.height)
  const imageRatio = width / height
  const editorRatio = 16 / 10
  const imageArea = editorRatio > imageRatio
    ? {
        width: (imageRatio / editorRatio) * 100,
        height: 100,
        left: (100 - (imageRatio / editorRatio) * 100) / 2,
        top: 0,
      }
    : {
        width: 100,
        height: (editorRatio / imageRatio) * 100,
        left: 0,
        top: (100 - (editorRatio / imageRatio) * 100) / 2,
      }
  const overlayStyle = {
    left: `${imageArea.left + (cropX / width) * imageArea.width}%`,
    top: `${imageArea.top + (cropY / height) * imageArea.height}%`,
    width: `${(cropWidth / width) * imageArea.width}%`,
    height: `${(cropHeight / height) * imageArea.height}%`,
  }
  const cropSummary = `${cropWidth} × ${cropHeight}px`

  function normalizeCrop(next: { x: number; y: number; width: number; height: number }) {
    const nextWidth = Math.min(width, Math.max(minCropSize, next.width))
    const nextHeight = Math.min(height, Math.max(minCropSize, next.height))
    return {
      width: nextWidth,
      height: nextHeight,
      x: Math.min(width - nextWidth, Math.max(0, next.x)),
      y: Math.min(height - nextHeight, Math.max(0, next.y)),
    }
  }

  function getContainedImageRect(container: HTMLDivElement) {
    const rect = container.getBoundingClientRect()
    const imageRatio = width / height
    const boxRatio = rect.width / rect.height

    if (boxRatio > imageRatio) {
      const renderedWidth = rect.height * imageRatio
      return {
        left: rect.left + (rect.width - renderedWidth) / 2,
        top: rect.top,
        width: renderedWidth,
        height: rect.height,
      }
    }

    const renderedHeight = rect.width / imageRatio
    return {
      left: rect.left,
      top: rect.top + (rect.height - renderedHeight) / 2,
      width: rect.width,
      height: renderedHeight,
    }
  }

  function handleCropPointerDown(event: React.PointerEvent<HTMLDivElement>, mode: 'move' | 'resize') {
    event.preventDefault()
    event.stopPropagation()
    const frame = cropFrameRef.current
    if (!frame) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStateRef.current = {
      pointerId: event.pointerId,
      mode,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startCrop: crop,
      imageRect: getContainedImageRect(frame),
    }
  }

  function handleCropPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragStateRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    event.preventDefault()
    const deltaX = ((event.clientX - drag.startClientX) / drag.imageRect.width) * width
    const deltaY = ((event.clientY - drag.startClientY) / drag.imageRect.height) * height
    if (drag.mode === 'resize') {
      setCrop(normalizeCrop({
        ...drag.startCrop,
        width: drag.startCrop.width + deltaX,
        height: drag.startCrop.height + deltaY,
      }))
      return
    }

    setCrop(normalizeCrop({
      ...drag.startCrop,
      x: drag.startCrop.x + deltaX,
      y: drag.startCrop.y + deltaY,
    }))
  }

  function handleCropPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragStateRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragStateRef.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return (
    <form
      action={async (formData: FormData) => {
        setCropError('')
        setIsSavingCrop(true)
        try {
          await cropMediaAction(item.id, formData)
          if (onSaved) onSaved()
          else window.location.reload()
        } catch (error) {
          setCropError(error instanceof Error ? error.message : 'Crop gagal. Coba ulangi.')
          setIsSavingCrop(false)
        }
      }}
      className="space-y-4"
    >
      <input type="hidden" name="cropX" value={cropX} />
      <input type="hidden" name="cropY" value={cropY} />
      <input type="hidden" name="cropWidth" value={cropWidth} />
      <input type="hidden" name="cropHeight" value={cropHeight} />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase text-text-secondary">Editor Original</p>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
            Hasil {cropSummary}
          </span>
        </div>
        <div
          ref={cropFrameRef}
          className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border-light bg-gray-950"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Crop editor needs natural image ratio and overlay alignment. */}
          <img src={editorImageUrl} alt={item.alt || ''} className="h-full w-full object-contain" draggable={false} />
        <div className="absolute inset-0 bg-black/40" />
        <div
          role="button"
          aria-label="Area crop"
          tabIndex={0}
          onPointerDown={(event) => handleCropPointerDown(event, 'move')}
          onPointerMove={handleCropPointerMove}
          onPointerUp={handleCropPointerUp}
          onPointerCancel={handleCropPointerUp}
          className="absolute cursor-move touch-none border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] after:absolute after:inset-1 after:border after:border-white/70"
          style={overlayStyle}
        >
          <div
            role="button"
            aria-label="Ubah ukuran crop"
            tabIndex={0}
            onPointerDown={(event) => handleCropPointerDown(event, 'resize')}
            onPointerMove={handleCropPointerMove}
            onPointerUp={handleCropPointerUp}
            onPointerCancel={handleCropPointerUp}
            className="absolute -bottom-2 -right-2 h-5 w-5 cursor-nwse-resize touch-none rounded-full border-2 border-white bg-poros-red shadow-md"
          />
        </div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white opacity-80">
              Seret kotak atau tarik pojok
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-text-secondary sm:grid-cols-4">
        <div className="rounded-md border border-border-light bg-gray-50 p-2">
          <p className="font-bold text-gray-800">X</p>
          <p>{cropX}px</p>
        </div>
        <div className="rounded-md border border-border-light bg-gray-50 p-2">
          <p className="font-bold text-gray-800">Y</p>
          <p>{cropY}px</p>
        </div>
        <div className="rounded-md border border-border-light bg-gray-50 p-2">
          <p className="font-bold text-gray-800">Lebar</p>
          <p>{cropWidth}px</p>
        </div>
        <div className="rounded-md border border-border-light bg-gray-50 p-2">
          <p className="font-bold text-gray-800">Tinggi</p>
          <p>{cropHeight}px</p>
        </div>
      </div>

      {cropError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{cropError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSavingCrop}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-poros-red px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
      >
        {isSavingCrop ? <Loader2 size={16} className="animate-spin" /> : <Crop size={16} />}
        {isSavingCrop ? 'Menyimpan crop...' : 'Simpan sebagai original baru'}
      </button>
    </form>
  )
}

function MediaDetailModal({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const url = getMediaUrl(item as Record<string, unknown>)
  const previewUrl = mediaPreviewUrl(item)

  const copyUrl = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8" onClick={onClose}>
      <div className="relative w-full max-w-6xl rounded-xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-poros-red">Edit Media</p>
            <h2 className="truncate pr-4 font-heading text-lg font-bold text-poros-navy">{item.alt || item.filename || 'Media'}</h2>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-md p-1.5 text-text-secondary hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="max-h-[78vh] overflow-y-auto bg-gray-50 p-5">
            <MediaCropForm item={item} />
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-text-secondary sm:grid-cols-4">
              <div className="rounded-md border border-border-light bg-white p-3">
                <p className="font-bold text-gray-800">Original</p>
                <p>{item.width && item.height ? `${item.width} × ${item.height}` : '-'}</p>
              </div>
              <div className="rounded-md border border-border-light bg-white p-3">
                <p className="font-bold text-gray-800">Card</p>
                <p>640px</p>
              </div>
              <div className="rounded-md border border-border-light bg-white p-3">
                <p className="font-bold text-gray-800">Hero</p>
                <p>1280px</p>
              </div>
              <div className="rounded-md border border-border-light bg-white p-3">
                <p className="font-bold text-gray-800">OG</p>
                <p>1200 × 630</p>
              </div>
            </div>
          </div>
          <div className="max-h-[75vh] overflow-y-auto p-5 space-y-5">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border border-border-light bg-gray-100">
                <Image
                  src={previewUrl}
                  alt={item.alt || ''}
                  width={640}
                  height={360}
                  className="aspect-[16/10] w-full object-contain"
                />
              </div>
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

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <p className="font-bold">Crop mengubah original media.</p>
              <p className="mt-1">Media ID tetap sama, lalu thumbnail, card, hero, dan OG dibuat ulang dari original baru.</p>
            </div>

            <div className="border-t border-border-light pt-4">
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
                src={mediaPreviewUrl(item)}
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
