'use client'

import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import NextImage from 'next/image'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import { getMediaUrl } from '@/lib/media'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
  Unlink,
  X,
  Link as LinkIcon2,
  Globe,
} from 'lucide-react'

type MediaItem = {
  id: number
  alt?: string | null
  filename?: string | null
  url?: string | null
  sizesThumbnailUrl?: string | null
  sizesCardUrl?: string | null
}

type RichTextEditorProps = {
  name: string
  initialContent?: string
  mediaItems?: MediaItem[]
}

type ToolbarButtonProps = {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

function ToolbarButton({ label, active, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'border-poros-red bg-poros-red text-white'
          : 'border-border-light bg-white hover:border-poros-red hover:text-poros-red'
      }`}
    >
      {children}
    </button>
  )
}

// Custom Image Extension to support Width and Custom Alignment rendering
const CustomImage = Image.extend({
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: '100%',
        parseHTML: element => element.style.width || element.getAttribute('width') || '100%',
      },
      align: {
        default: 'center',
        parseHTML: element => {
          const margin = element.style.margin || ''
          if (margin.includes('0px auto 0px 0px') || margin.includes('0 auto 0 0') || element.style.marginLeft === '0px') return 'left'
          if (margin.includes('0px 0px 0px auto') || margin.includes('0 0 0 auto') || element.style.marginRight === '0px') return 'right'
          return 'center'
        },
      }
    }
  },
  renderHTML({ HTMLAttributes }) {
    const { width, align, style, ...rest } = HTMLAttributes
    
    let margin = '0 auto'
    if (align === 'left') margin = '0 auto 0 0'
    if (align === 'right') margin = '0 0 0 auto'

    const customStyle = `width: ${width || '100%'}; max-width: 100%; height: auto; display: block; margin: ${margin}; ${style || ''}`

    return ['img', {
      ...rest,
      style: customStyle,
    }]
  }
})

export function RichTextEditor({ name, initialContent = '', mediaItems = [] }: RichTextEditorProps) {
  const [html, setHtml] = useState(initialContent)
  
  // Modals visibility states
  const [pickerOpen, setPickerOpen] = useState(false)
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [externalImageModalOpen, setExternalImageModalOpen] = useState(false)

  // Configure Image modal state
  const [configImageOpen, setConfigImageOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editPos, setEditPos] = useState<number | null>(null)
  
  const [selectedImageUrl, setSelectedImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [imageWidth, setImageWidth] = useState('100%')
  const [imageAlign, setImageAlign] = useState('center')

  // Modals form states
  const [linkUrl, setLinkUrl] = useState('')
  const [externalImageUrl, setExternalImageUrl] = useState('')

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({
        placeholder: 'Tulis isi artikel...',
      }),
      CustomImage.configure({
        HTMLAttributes: {
          class: 'rounded-md shadow-sm border border-border-light cursor-pointer hover:ring-2 hover:ring-poros-red/50 transition-shadow',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'min-h-[420px] px-4 py-3 text-base leading-7 focus:outline-none prose max-w-none prose-red',
      },
    },
    onUpdate({ editor }) {
      setHtml(editor.getHTML())
    },
  })

  // Open Link Modal with prefilled current selection URL (if exists)
  const openLinkModal = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href as string || ''
    setLinkUrl(previousUrl)
    setLinkModalOpen(true)
  }, [editor])

  const handleLinkSubmit = () => {
    if (!editor) return

    if (!linkUrl) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    }
    setLinkModalOpen(false)
    setLinkUrl('')
  }

  // Open Image settings configuration before inserting
  const handleImageSelect = (url: string, altText: string) => {
    setSelectedImageUrl(url)
    setImageAlt(altText)
    setImageWidth('100%')
    setImageAlign('center')
    setIsEditMode(false)
    setEditPos(null)
    setPickerOpen(false)
    setExternalImageModalOpen(false)
    setConfigImageOpen(true)
  }

  const handleInsertImageFinal = () => {
    if (!editor || !selectedImageUrl) return

    if (isEditMode && editPos !== null) {
      // 1. Tiptap command execution
      editor
        .chain()
        .focus()
        .updateAttributes('image', {
          src: selectedImageUrl,
          alt: imageAlt,
          width: imageWidth,
          align: imageAlign,
        })
        .run()

      // 2. ProseMirror direct node transaction (fallback / fail-safe)
      try {
        editor.view.dispatch(
          editor.view.state.tr
            .setNodeAttribute(editPos, 'src', selectedImageUrl)
            .setNodeAttribute(editPos, 'alt', imageAlt)
            .setNodeAttribute(editPos, 'width', imageWidth)
            .setNodeAttribute(editPos, 'align', imageAlign)
        )
      } catch (err) {
        console.error('ProseMirror direct update error:', err)
      }
      
      // Force trigger editor HTML state update
      setHtml(editor.getHTML())
    } else {
      editor
        .chain()
        .focus()
        .setImage({
          src: selectedImageUrl,
          alt: imageAlt,
        })
        .updateAttributes('image', {
          width: imageWidth,
          align: imageAlign,
        })
        .run()
    }

    setConfigImageOpen(false)
    setSelectedImageUrl('')
    setImageAlt('')
    setIsEditMode(false)
    setEditPos(null)
  }

  const handleExternalImageSubmit = () => {
    if (!externalImageUrl) return

    handleImageSelect(externalImageUrl, '')
    setExternalImageUrl('')
  }

  // Handle double click using standard React DOM event to avoid stale closure bugs
  const handleDoubleClick = (e: React.MouseEvent) => {
    const target = e.target
    if (target instanceof HTMLImageElement && editor) {
      const parent = target.parentNode
      if (!parent) return
      
      // Official ProseMirror DOM mapping to resolve exact child index position
      const index = Array.from(parent.childNodes).indexOf(target)
      const pos = editor.view.posAtDOM(parent, index)
      
      if (pos === undefined || pos === null) return

      // Select the node programmatically
      editor.commands.setNodeSelection(pos)

      // Fetch current attributes directly from DOM element to guarantee accuracy
      const src = target.getAttribute('src') || ''
      const alt = target.getAttribute('alt') || ''
      const width = target.style.width || target.getAttribute('width') || '100%'
      const margin = target.style.margin || ''
      let align = 'center'
      if (margin.includes('0px auto 0px 0px') || margin.includes('0 auto 0 0') || target.style.marginLeft === '0px') align = 'left'
      if (margin.includes('0px 0px 0px auto') || margin.includes('0 0 0 auto') || target.style.marginRight === '0px') align = 'right'

      setSelectedImageUrl(src)
      setImageAlt(alt)
      setImageWidth(width)
      setImageAlign(align)
      setEditPos(pos) // Store the position for bulletproof transaction updates
      setIsEditMode(true)
      setConfigImageOpen(true)
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-border-light bg-white">
      <input type="hidden" name={name} value={html} />
      
      <div className="flex flex-wrap gap-1 border-b border-border-light bg-gray-50 p-2 items-center justify-between">
        <div className="flex flex-wrap gap-1">
          <ToolbarButton label="Bold" active={editor?.isActive('bold')} disabled={!editor} onClick={() => editor?.chain().focus().toggleBold().run()}>
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton label="Italic" active={editor?.isActive('italic')} disabled={!editor} onClick={() => editor?.chain().focus().toggleItalic().run()}>
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton label="Heading 2" active={editor?.isActive('heading', { level: 2 })} disabled={!editor} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 size={16} />
          </ToolbarButton>
          <ToolbarButton label="Heading 3" active={editor?.isActive('heading', { level: 3 })} disabled={!editor} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 size={16} />
          </ToolbarButton>
          <ToolbarButton label="Bullet list" active={editor?.isActive('bulletList')} disabled={!editor} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton label="Ordered list" active={editor?.isActive('orderedList')} disabled={!editor} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={16} />
          </ToolbarButton>
          <ToolbarButton label="Quote" active={editor?.isActive('blockquote')} disabled={!editor} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
            <Quote size={16} />
          </ToolbarButton>
          <ToolbarButton label="Align left" active={editor?.isActive({ textAlign: 'left' })} disabled={!editor} onClick={() => editor?.chain().focus().setTextAlign('left').run()}>
            <AlignLeft size={16} />
          </ToolbarButton>
          <ToolbarButton label="Align center" active={editor?.isActive({ textAlign: 'center' })} disabled={!editor} onClick={() => editor?.chain().focus().setTextAlign('center').run()}>
            <AlignCenter size={16} />
          </ToolbarButton>
          <ToolbarButton label="Align right" active={editor?.isActive({ textAlign: 'right' })} disabled={!editor} onClick={() => editor?.chain().focus().setTextAlign('right').run()}>
            <AlignRight size={16} />
          </ToolbarButton>
          <ToolbarButton label="Link" active={editor?.isActive('link')} disabled={!editor} onClick={openLinkModal}>
            <LinkIcon size={16} />
          </ToolbarButton>
          <ToolbarButton label="Unlink" disabled={!editor || !editor.isActive('link')} onClick={() => editor?.chain().focus().unsetLink().run()}>
            <Unlink size={16} />
          </ToolbarButton>
          <ToolbarButton label="Sisipkan Gambar" disabled={!editor} onClick={() => setPickerOpen(true)}>
            <ImageIcon size={16} />
          </ToolbarButton>
          <ToolbarButton label="Undo" disabled={!editor || !editor.can().undo()} onClick={() => editor?.chain().focus().undo().run()}>
            <Undo2 size={16} />
          </ToolbarButton>
          <ToolbarButton label="Redo" disabled={!editor || !editor.can().redo()} onClick={() => editor?.chain().focus().redo().run()}>
            <Redo2 size={16} />
          </ToolbarButton>
        </div>
        
        <span className="text-[10px] text-gray-400 mr-2 hidden md:inline font-semibold">
          💡 Double-click gambar di editor untuk resize/align
        </span>
      </div>

      <div onDoubleClick={handleDoubleClick}>
        <EditorContent editor={editor} />
      </div>

      {/* 1. Media Library Image Picker Modal */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-8"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="w-full max-w-4xl rounded-xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
              <h2 className="font-heading text-lg font-bold text-poros-navy">Pilih Gambar untuk Artikel</h2>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="rounded-md p-1.5 text-text-secondary hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="mb-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPickerOpen(false)
                    setExternalImageModalOpen(true)
                  }}
                  className="rounded-lg border border-border-light px-4 py-2 text-sm font-semibold text-poros-navy hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Globe size={15} /> Gunakan URL Gambar Luar
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
                    const url = getMediaUrl(item as Record<string, unknown>)
                    const thumb = item.sizesThumbnailUrl || item.sizesCardUrl || url
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleImageSelect(url, item.alt || '')}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-border-light bg-white hover:border-poros-red transition-all p-1"
                      >
                        <NextImage
                          src={thumb}
                          alt={item.alt || item.filename || ''}
                          fill
                          sizes="(min-width: 768px) 20vw, 50vw"
                          className="rounded-lg object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-left rounded-b-lg">
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

      {/* 2. Link Insert/Edit Modal */}
      {linkModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 px-4"
          onClick={() => setLinkModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
              <h2 className="font-heading text-base font-bold text-poros-navy flex items-center gap-2">
                <LinkIcon2 size={16} className="text-poros-red" /> Atur Link URL
              </h2>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="rounded-md p-1 hover:bg-gray-100 text-text-secondary"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  URL Tujuan
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (editor) {
                      editor.chain().focus().extendMarkRange('link').unsetLink().run()
                    }
                    setLinkModalOpen(false)
                  }}
                  className="rounded-lg border border-border-light px-4 py-2 text-sm font-semibold text-poros-red hover:bg-red-50"
                >
                  Hapus Link
                </button>
                <button
                  type="button"
                  onClick={handleLinkSubmit}
                  className="rounded-lg bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. External Image URL Modal */}
      {externalImageModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 px-4"
          onClick={() => setExternalImageModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
              <h2 className="font-heading text-base font-bold text-poros-navy flex items-center gap-2">
                <Globe size={16} className="text-poros-red" /> Sisipkan Gambar Eksternal
              </h2>
              <button
                type="button"
                onClick={() => setExternalImageModalOpen(false)}
                className="rounded-md p-1 hover:bg-gray-100 text-text-secondary"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  URL Gambar (.jpg, .png, etc)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://domain.com/path/to/image.jpg"
                  value={externalImageUrl}
                  onChange={(e) => setExternalImageUrl(e.target.value)}
                  className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExternalImageModalOpen(false)}
                  className="rounded-lg border border-border-light px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExternalImageSubmit}
                  className="rounded-lg bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors"
                >
                  Lanjut
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Configure Image Size & Alignment Modal (Before Insert & On Edit) */}
      {configImageOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 px-4"
          onClick={() => setConfigImageOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
              <h2 className="font-heading text-base font-bold text-poros-navy">
                {isEditMode ? 'Edit Pengaturan Gambar' : 'Konfigurasi Gambar'}
              </h2>
              <button
                type="button"
                onClick={() => setConfigImageOpen(false)}
                className="rounded-md p-1 hover:bg-gray-100 text-text-secondary"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center bg-gray-50 rounded-lg p-2 max-h-[140px] overflow-hidden border border-border-light">
                {/* eslint-disable-next-line @next/next/no-img-element -- editor accepts arbitrary external preview URLs that are not in next.config remotePatterns */}
                <img src={selectedImageUrl} alt="Preview" className="max-h-[120px] object-contain rounded" />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  Alt Text (Deskripsi Gambar)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Suasana Karapan Sapi Madura"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Lebar Gambar
                  </label>
                  <select
                    value={imageWidth}
                    onChange={(e) => setImageWidth(e.target.value)}
                    className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
                  >
                    <option value="25%">25%</option>
                    <option value="50%">50%</option>
                    <option value="75%">75%</option>
                    <option value="100%">100%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Posisi Perataan
                  </label>
                  <select
                    value={imageAlign}
                    onChange={(e) => setImageAlign(e.target.value)}
                    className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
                  >
                    <option value="left">Kiri</option>
                    <option value="center">Tengah</option>
                    <option value="right">Kanan</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfigImageOpen(false)}
                  className="rounded-lg border border-border-light px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleInsertImageFinal}
                  className="rounded-lg bg-poros-red px-5 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors"
                >
                  {isEditMode ? 'Simpan Perubahan' : 'Sisipkan Gambar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
