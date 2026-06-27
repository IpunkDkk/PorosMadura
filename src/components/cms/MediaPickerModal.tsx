'use client'

import { useState } from 'react'
import { Image as ImageIcon, X, Check } from 'lucide-react'
import { getMediaUrl } from '@/lib/media'

type MediaItem = {
  id: number
  alt?: string | null
  filename?: string | null
  url?: string | null
  sizesThumbnailUrl?: string | null
  sizesCardUrl?: string | null
}

type MediaPickerProps = {
  name: string
  label: string
  mediaItems: MediaItem[]
  defaultValue?: number | string | null
  hint?: string
  clearLabel?: string
}

export function MediaPickerModal({
  name,
  label,
  mediaItems,
  defaultValue,
  hint,
  clearLabel = 'Tanpa gambar',
}: MediaPickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string>(defaultValue ? String(defaultValue) : '')

  const selectedItem = mediaItems.find((m) => String(m.id) === selectedId)

  const thumbnailUrl = (item: MediaItem) =>
    item.sizesThumbnailUrl ||
    item.sizesCardUrl ||
    item.url ||
    getMediaUrl(item as Record<string, unknown>)

  return (
    <>
      <input type="hidden" name={name} value={selectedId} />

      <div>
        <label className="block text-sm font-semibold mb-1.5">{label}</label>
        {hint && <p className="mb-2 text-xs text-text-secondary">{hint}</p>}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-lg border-2 border-dashed border-border-light hover:border-poros-red/50 transition-colors p-1"
        >
          {selectedItem ? (
            <div className="relative group">
              <img
                src={thumbnailUrl(selectedItem)}
                alt={selectedItem.alt || ''}
                className="aspect-[16/9] w-full rounded-lg object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                <span className="text-xs font-bold text-white uppercase tracking-wider bg-poros-navy/80 px-2.5 py-1 rounded">
                  Ganti Gambar
                </span>
              </div>
              <div className="absolute top-2 right-2 rounded-full bg-green-500 p-1">
                <Check size={12} className="text-white" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-gray-400">
              <ImageIcon size={28} />
              <span className="text-sm font-semibold">Klik untuk pilih gambar</span>
            </div>
          )}
        </button>

        {selectedItem && (
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-text-secondary truncate text-left max-w-[200px]" title={selectedItem.alt || selectedItem.filename || ''}>
              {selectedItem.alt || selectedItem.filename}
            </p>
            <button
              type="button"
              onClick={() => setSelectedId('')}
              className="ml-2 shrink-0 text-xs font-semibold text-poros-red hover:underline"
            >
              Hapus pilihan
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-8"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-4xl rounded-xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
              <h2 className="font-heading text-lg font-bold text-poros-navy">Pilih {label}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-text-secondary hover:bg-gray-100"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="mb-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId('')
                    setOpen(false)
                  }}
                  className="rounded-lg border border-border-light px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-gray-50 transition-colors"
                >
                  {clearLabel}
                </button>
              </div>

              {!mediaItems.length ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center text-text-secondary">
                  <ImageIcon size={36} className="text-gray-300" />
                  <p className="font-semibold">Belum ada media</p>
                  <p className="text-xs">Upload gambar di halaman Media terlebih dahulu</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {mediaItems.map((item) => {
                    const isSelected = String(item.id) === selectedId
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedId(String(item.id))
                          setOpen(false)
                        }}
                        className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-poros-red shadow-md scale-95'
                            : 'border-transparent hover:border-poros-red/50'
                        }`}
                      >
                        <img
                          src={thumbnailUrl(item)}
                          alt={item.alt || item.filename || ''}
                          className="h-full w-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 rounded-full bg-poros-red p-0.5">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left">
                          <p className="truncate text-[10px] text-white font-medium">{item.alt || item.filename}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
