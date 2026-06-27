import Link from 'next/link'
import { Save, Trash2 } from 'lucide-react'
import { createPostAction, deletePostAction, updatePostAction } from '@/lib/cms-admin'
import { RichTextEditor } from '@/components/cms/RichTextEditor'
import { MediaPickerModal } from '@/components/cms/MediaPickerModal'
import { CmsConfirmSubmit } from '@/components/cms/CmsConfirmSubmit'

type Option = {
  id: number
  name: string
}

type PostFormProps = {
  post?: any
  categories: Option[]
  authors: Option[]
  tags: Option[]
  mediaItems?: any[]
  selectedTagIds?: Set<number | null>
}

function inputDate(value: unknown) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 16)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function contentToHtml(content: unknown) {
  if (!content) return ''
  if (typeof content === 'string') return content

  const root = content && typeof content === 'object'
    ? (content as Record<string, any>).root
    : null
  const children = Array.isArray(root?.children) ? root.children : []
  if (!children.length) return JSON.stringify(content, null, 2)

  return children
    .map((block: any) => {
      const text = Array.isArray(block.children)
        ? block.children.map((child: any) => child.text || '').join('')
        : ''
      return text ? `<p>${escapeHtml(text)}</p>` : ''
    })
    .filter(Boolean)
    .join('\n\n')
}

export function PostForm({
  post,
  categories,
  authors,
  tags,
  mediaItems = [],
  selectedTagIds = new Set(),
}: PostFormProps) {
  const action = post?.id ? updatePostAction.bind(null, post.id as number) : createPostAction

  return (
    <>
    <form action={action} className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-5">
        <div className="bg-white border border-border-light rounded-lg p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="title">Judul</label>
            <input
              id="title"
              name="title"
              required
              defaultValue={post?.title || ''}
              className="w-full rounded-md border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="slug">Slug</label>
              <input
                id="slug"
                name="slug"
                defaultValue={post?.slug || ''}
                className="w-full rounded-md border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                defaultValue={post?.status || 'draft'}
                className="w-full rounded-md border border-border-light px-3 py-2 text-sm bg-white"
              >
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="excerpt">Ringkasan</label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              defaultValue={post?.excerpt || ''}
              className="w-full rounded-md border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Konten</label>
            <RichTextEditor name="content" initialContent={contentToHtml(post?.content)} mediaItems={mediaItems} />
          </div>
        </div>

        <div className="bg-white border border-border-light rounded-lg p-5 space-y-4">
          <h2 className="font-heading text-lg font-bold">SEO</h2>
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="seoTitle">SEO Title</label>
            <input id="seoTitle" name="seoTitle" defaultValue={post?.seoTitle || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="seoDescription">SEO Description</label>
            <textarea id="seoDescription" name="seoDescription" rows={3} defaultValue={post?.seoDescription || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="canonicalUrl">Canonical URL</label>
            <input id="canonicalUrl" name="canonicalUrl" defaultValue={post?.canonicalUrl || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Link href="/cms/posts" className="text-sm font-semibold text-text-secondary hover:text-poros-red">Kembali</Link>
          <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
            <Save size={16} /> Simpan
          </button>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="bg-white border border-border-light rounded-lg p-5 space-y-4">
          <h2 className="font-heading text-lg font-bold">Publikasi</h2>
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="publishedAt">Tanggal Publish</label>
            <input
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
              defaultValue={inputDate(post?.publishedAt)}
              className="w-full rounded-md border border-border-light px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input name="isFeatured" type="checkbox" defaultChecked={Boolean(post?.isFeatured)} className="h-4 w-4" />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="isBreakingNews" type="checkbox" defaultChecked={Boolean(post?.isBreakingNews)} className="h-4 w-4" />
            Breaking news
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="allowIndex" type="checkbox" defaultChecked={post?.allowIndex !== false} className="h-4 w-4" />
            Index mesin pencari
          </label>
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="readingTime">Menit baca</label>
            <input id="readingTime" name="readingTime" type="number" min="0" defaultValue={post?.readingTime || 0} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="bg-white border border-border-light rounded-lg p-5 space-y-4">
          <h2 className="font-heading text-lg font-bold">Gambar</h2>
          <MediaPickerModal
            name="featuredImageId"
            label="Featured Image"
            mediaItems={mediaItems}
            defaultValue={post?.featuredImageId}
          />
          <MediaPickerModal
            name="ogImageId"
            label="OG Image"
            mediaItems={mediaItems}
            defaultValue={post?.ogImageId}
            hint="Opsional. Jika kosong, akan mengikuti featured image."
            clearLabel="Ikuti featured / default"
          />
        </div>

        <div className="bg-white border border-border-light rounded-lg p-5 space-y-4">
          <h2 className="font-heading text-lg font-bold">Relasi</h2>
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="categoryId">Kategori</label>
            <select id="categoryId" name="categoryId" defaultValue={post?.categoryId || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm bg-white">
              <option value="">Tanpa kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="authorId">Penulis</label>
            <select id="authorId" name="authorId" defaultValue={post?.authorId || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm bg-white">
              <option value="">Tanpa penulis</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>{author.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Tags</p>
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 text-sm">
                <input name="tagIds" value={tag.id} type="checkbox" defaultChecked={selectedTagIds.has(tag.id)} className="h-4 w-4" />
                {tag.name}
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white border border-border-light rounded-lg p-5 space-y-4">
          <h2 className="font-heading text-lg font-bold">Sumber</h2>
          <input name="sourceName" placeholder="Nama sumber" defaultValue={post?.sourceName || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
          <input name="sourceUrl" placeholder="URL sumber" defaultValue={post?.sourceUrl || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
        </div>

      </aside>
    </form>

    {post?.id && (
      <form action={deletePostAction.bind(null, post.id as number)} className="mt-6 bg-white border border-red-200 rounded-lg p-5">
        <CmsConfirmSubmit
          label="Hapus artikel"
          title="Hapus artikel?"
          description="Artikel akan dihapus secara permanen dari database dan tidak dapat dipulihkan kembali."
        />
      </form>
    )}
    </>
  )
}
