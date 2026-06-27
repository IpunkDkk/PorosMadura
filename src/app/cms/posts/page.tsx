import Link from 'next/link'
import { FilePlus2, Pencil, Search } from 'lucide-react'
import { getCmsPostList } from '@/lib/cms-admin'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{
    q?: string
    status?: string
    issue?: string
    category?: string
    author?: string
    page?: string
  }>
}

const statusOptions = [
  { value: '', label: 'Semua status' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

const issueOptions = [
  { value: '', label: 'Semua kelengkapan' },
  { value: 'missing-image', label: 'Tanpa gambar' },
  { value: 'missing-seo', label: 'SEO belum lengkap' },
]

function positiveInt(value: string | undefined) {
  const parsed = Number(value || '1')
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function optionalInt(value: string | undefined) {
  const parsed = Number(value || '')
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

function pageHref(params: {
  q?: string
  status?: string
  issue?: string
  category?: string
  author?: string
  page: number
}) {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.status) search.set('status', params.status)
  if (params.issue) search.set('issue', params.issue)
  if (params.category) search.set('category', params.category)
  if (params.author) search.set('author', params.author)
  if (params.page > 1) search.set('page', String(params.page))
  const query = search.toString()
  return query ? `/cms/posts?${query}` : '/cms/posts'
}

export default async function CmsPostsPage({ searchParams }: Props) {
  const params = await searchParams
  const q = (params.q || '').trim()
  const status = statusOptions.some((item) => item.value === params.status) ? params.status : ''
  const issue = issueOptions.some((item) => item.value === params.issue) ? params.issue : ''
  const category = params.category || ''
  const author = params.author || ''
  const page = positiveInt(params.page)
  const result = await getCmsPostList({
    q,
    status,
    issue,
    categoryId: optionalInt(category),
    authorId: optionalInt(author),
    page,
  })
  const posts = result.docs

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-poros-red">Konten</p>
          <h1 className="font-heading text-3xl font-black text-poros-navy">Artikel</h1>
        </div>
        <Link href="/cms/posts/new" className="inline-flex items-center gap-2 rounded-md bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
          <FilePlus2 size={16} /> Artikel Baru
        </Link>
      </div>

      <form action="/cms/posts" className="rounded-lg border border-border-light bg-white p-4">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_160px_190px_180px_180px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari judul, slug, atau ringkasan"
              className="h-10 w-full rounded-md border border-border-light pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
            />
          </div>
          <select
            name="status"
            defaultValue={status}
            className="h-10 rounded-md border border-border-light bg-white px-3 text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            name="category"
            defaultValue={category}
            className="h-10 rounded-md border border-border-light bg-white px-3 text-sm"
          >
            <option value="">Semua kategori</option>
            {result.categories.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <select
            name="issue"
            defaultValue={issue}
            className="h-10 rounded-md border border-border-light bg-white px-3 text-sm"
          >
            {issueOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            name="author"
            defaultValue={author}
            className="h-10 rounded-md border border-border-light bg-white px-3 text-sm"
          >
            <option value="">Semua penulis</option>
            {result.authors.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="h-10 rounded-md bg-poros-navy px-4 text-sm font-bold text-white hover:bg-poros-navy/90">
              Filter
            </button>
            <Link href="/cms/posts" className="inline-flex h-10 items-center rounded-md border border-border-light px-4 text-sm font-semibold text-text-secondary hover:border-poros-red hover:text-poros-red">
              Reset
            </Link>
          </div>
        </div>
      </form>

      <div className="flex flex-col gap-2 text-sm text-text-secondary md:flex-row md:items-center md:justify-between">
        <p>
          Menampilkan {posts.length} dari {result.totalDocs} artikel
        </p>
        <p>
          Halaman {result.page} dari {result.totalPages}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-light bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-text-secondary">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Penulis</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Publish</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{post.title || 'Tanpa judul'}</p>
                  <p className="text-xs text-text-secondary">/{post.slug}</p>
                </td>
                <td className="px-4 py-3">{post.category?.name || '-'}</td>
                <td className="px-4 py-3">{post.author?.name || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                    post.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : post.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-700'
                        : post.status === 'review'
                          ? 'bg-amber-100 text-amber-700'
                          : post.status === 'archived'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-gray-100 text-gray-500'
                  }`}>
                    {post.status || 'draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleString('id-ID') : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/cms/posts/${post.slug}`} className="inline-flex items-center gap-1 font-bold text-poros-red hover:text-red-700">
                    <Pencil size={14} /> Edit
                  </Link>
                </td>
              </tr>
            ))}
            {!posts.length && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">Belum ada artikel.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {result.page > 1 && (
            <Link
              href={pageHref({ q, status, issue, category, author, page: result.page - 1 })}
              className="rounded-lg border border-border-light bg-white px-4 py-2 text-sm font-semibold hover:border-poros-red hover:text-poros-red"
            >
              Sebelumnya
            </Link>
          )}
          <span className="px-3 py-2 text-sm font-semibold text-text-secondary">
            {result.page} / {result.totalPages}
          </span>
          {result.page < result.totalPages && (
            <Link
              href={pageHref({ q, status, issue, category, author, page: result.page + 1 })}
              className="rounded-lg bg-poros-navy px-4 py-2 text-sm font-semibold text-white hover:bg-poros-navy/90"
            >
              Selanjutnya
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
