import Link from 'next/link'
import { ArrowLeft, Eye, Save } from 'lucide-react'
import { updatePostAction } from '@/lib/cms-admin'
import { MediaPickerModal } from '@/components/cms/MediaPickerModal'
import { PostAutosave } from '@/components/cms/PostAutosave'
import { PostPreviewButton } from '@/components/cms/PostPreviewButton'
import { PostFocusEditor } from '@/components/cms/PostFocusEditor'
import { PostFocusSidePanel } from '@/components/cms/PostFocusSidePanel'

type Option = {
  id: number
  name: string
  slug?: string | null
}

type PostFocusFormProps = {
  post: any
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

function Panel({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="rounded-lg border border-border-light bg-white">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-poros-navy">
        {title}
      </summary>
      <div className="space-y-4 border-t border-border-light p-4">
        {children}
      </div>
    </details>
  )
}

export function PostFocusForm({
  post,
  categories,
  authors,
  tags,
  mediaItems = [],
  selectedTagIds = new Set(),
}: PostFocusFormProps) {
  const action = updatePostAction.bind(null, post.id as number)

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="autosavePostId" defaultValue={String(post.id)} />

      <div className="sticky top-0 z-20 -mx-4 border-b border-border-light bg-page-bg/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/cms/posts/${post.slug}`}
              className="inline-flex items-center gap-2 rounded-md border border-border-light bg-white px-3 py-2 text-sm font-bold text-text-primary hover:bg-gray-50"
            >
              <ArrowLeft size={16} />
              Editor biasa
            </Link>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-poros-red">Mode fokus</p>
              <h1 className="font-heading text-xl font-black text-poros-navy">Edit konten artikel</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <PostAutosave postId={post.id} />
            <PostPreviewButton postId={post.id} />
            <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
              <Save size={16} /> Simpan
            </button>
          </div>
        </div>
      </div>

      <PostFocusEditor
        initialTitle={post.title || ''}
        initialExcerpt={post.excerpt || ''}
        initialContent={contentToHtml(post.content)}
        initialFeaturedImageId={post.featuredImageId}
        initialCategoryId={post.categoryId}
        initialAuthorId={post.authorId}
        initialTagIds={Array.from(selectedTagIds).filter(Boolean)}
        initialPublishedAt={post.publishedAt}
        initialReadingTime={post.readingTime}
        mediaItems={mediaItems}
        categories={categories}
        authors={authors}
        tags={tags}
      />

      <PostFocusSidePanel>
        <Panel title="Publikasi" open>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="slug">Slug</label>
              <input id="slug" name="slug" defaultValue={post.slug || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue={post.status || 'draft'} className="w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm">
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="publishedAt">Tanggal Publish</label>
              <input id="publishedAt" name="publishedAt" type="datetime-local" defaultValue={inputDate(post.publishedAt)} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="readingTime">Menit baca</label>
              <input id="readingTime" name="readingTime" type="number" min="0" defaultValue={post.readingTime || 0} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input name="isFeatured" type="checkbox" defaultChecked={Boolean(post.isFeatured)} className="h-4 w-4" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input name="isBreakingNews" type="checkbox" defaultChecked={Boolean(post.isBreakingNews)} className="h-4 w-4" />
              Breaking news
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input name="allowIndex" type="checkbox" defaultChecked={post.allowIndex !== false} className="h-4 w-4" />
              Index mesin pencari
            </label>
          </div>
        </Panel>

        <Panel title="SEO">
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="seoTitle">SEO Title</label>
            <input id="seoTitle" name="seoTitle" defaultValue={post.seoTitle || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="seoDescription">SEO Description</label>
            <textarea id="seoDescription" name="seoDescription" rows={3} defaultValue={post.seoDescription || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="canonicalUrl">Canonical URL</label>
            <input id="canonicalUrl" name="canonicalUrl" defaultValue={post.canonicalUrl || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
          </div>
        </Panel>

        <Panel title="Gambar">
          <MediaPickerModal
            name="featuredImageId"
            label="Featured Image"
            mediaItems={mediaItems}
            defaultValue={post.featuredImageId}
          />
          <MediaPickerModal
            name="ogImageId"
            label="OG Image"
            mediaItems={mediaItems}
            defaultValue={post.ogImageId}
            hint="Opsional. Jika kosong, akan mengikuti featured image."
            clearLabel="Ikuti featured / default"
          />
        </Panel>

        <Panel title="Relasi">
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="categoryId">Kategori</label>
            <select id="categoryId" name="categoryId" defaultValue={post.categoryId || ''} className="w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm">
              <option value="">Tanpa kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="authorId">Penulis</label>
            <select id="authorId" name="authorId" defaultValue={post.authorId || ''} className="w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm">
              <option value="">Tanpa penulis</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>{author.name}</option>
              ))}
            </select>
          </div>
          <div className="grid max-h-52 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 text-sm">
                <input name="tagIds" value={tag.id} type="checkbox" defaultChecked={selectedTagIds.has(tag.id)} className="h-4 w-4" />
                {tag.name}
              </label>
            ))}
          </div>
        </Panel>

        <Panel title="Sumber">
          <input name="sourceName" placeholder="Nama sumber" defaultValue={post.sourceName || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
          <input name="sourceUrl" placeholder="URL sumber" defaultValue={post.sourceUrl || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
        </Panel>

        <Panel title="Aksi cepat">
          <Link
            href={`/preview/posts/${post.id}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-md border border-border-light bg-white px-4 py-2 text-sm font-bold text-text-primary hover:bg-gray-50"
          >
            <Eye size={16} />
            Preview public
          </Link>
        </Panel>
      </PostFocusSidePanel>
    </form>
  )
}
