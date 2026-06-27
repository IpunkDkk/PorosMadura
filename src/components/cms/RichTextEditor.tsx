'use client'

import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
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
} from 'lucide-react'

type RichTextEditorProps = {
  name: string
  initialContent?: string
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

export function RichTextEditor({ name, initialContent = '' }: RichTextEditorProps) {
  const [html, setHtml] = useState(initialContent)
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
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'min-h-[420px] px-4 py-3 text-base leading-7 focus:outline-none prose-content',
      },
    },
    onUpdate({ editor }) {
      setHtml(editor.getHTML())
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL', previousUrl || 'https://')

    if (url === null) return
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('URL gambar', 'https://')
    if (!url) return
    editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  return (
    <div className="overflow-hidden rounded-md border border-border-light bg-white">
      <input type="hidden" name={name} value={html} />
      <div className="flex flex-wrap gap-1 border-b border-border-light bg-gray-50 p-2">
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
        <ToolbarButton label="Link" active={editor?.isActive('link')} disabled={!editor} onClick={setLink}>
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton label="Unlink" disabled={!editor || !editor.isActive('link')} onClick={() => editor?.chain().focus().unsetLink().run()}>
          <Unlink size={16} />
        </ToolbarButton>
        <ToolbarButton label="Image" disabled={!editor} onClick={addImage}>
          <ImageIcon size={16} />
        </ToolbarButton>
        <ToolbarButton label="Undo" disabled={!editor || !editor.can().undo()} onClick={() => editor?.chain().focus().undo().run()}>
          <Undo2 size={16} />
        </ToolbarButton>
        <ToolbarButton label="Redo" disabled={!editor || !editor.can().redo()} onClick={() => editor?.chain().focus().redo().run()}>
          <Redo2 size={16} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
