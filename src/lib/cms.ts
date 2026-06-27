import { getImageSizeUrl } from '@/lib/media'

export interface PublicCategory {
  id?: number | string
  name: string
  slug: string
}

export interface PublicAuthor {
  id?: number | string
  name: string
  slug?: string
}

export interface PublicPost {
  id: number | string
  title: string
  slug: string
  excerpt: string
  featuredImage?: unknown
  category?: PublicCategory | null
  author?: PublicAuthor | null
  publishedAt: string
  isFeatured?: boolean
  isBreakingNews?: boolean
  views?: number
}

export interface PublicSettings {
  siteName: string
  tagline: string
  siteDescription: string
  siteUrl: string
  contactEmail: string
  logo?: unknown
  defaultOgImage?: unknown
  socialLinks?: Record<string, string | undefined>
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

export function normalizeCategory(value: unknown): PublicCategory | null {
  const category = asRecord(value)
  if (!category.slug || !category.name) return null
  return {
    id: category.id as number | string | undefined,
    name: String(category.name),
    slug: String(category.slug),
  }
}

export function normalizeAuthor(value: unknown): PublicAuthor | null {
  const author = asRecord(value)
  if (!author.name) return null
  return {
    id: author.id as number | string | undefined,
    name: String(author.name),
    slug: author.slug ? String(author.slug) : undefined,
  }
}

export function normalizePost(value: unknown): PublicPost {
  const post = asRecord(value)
  return {
    id: post.id as number | string,
    title: String(post.title || ''),
    slug: String(post.slug || ''),
    excerpt: String(post.excerpt || ''),
    featuredImage: post.featuredImage,
    category: normalizeCategory(post.category),
    author: normalizeAuthor(post.author),
    publishedAt: String(post.publishedAt || ''),
    isFeatured: Boolean(post.isFeatured),
    isBreakingNews: Boolean(post.isBreakingNews),
    views: typeof post.views === 'number' ? post.views : undefined,
  }
}

export function normalizeSettings(value: unknown): PublicSettings {
  const settings = asRecord(value)
  return {
    siteName: String(settings.siteName || 'PorosMadura'),
    tagline: String(settings.tagline || 'Berita Tepat, Fakta Kuat'),
    siteDescription: String(
      settings.siteDescription ||
      settings.defaultSeoDescription ||
      'Portal berita digital Madura yang menyajikan informasi cepat, akurat, dan kredibel.',
    ),
    siteUrl: String(settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    contactEmail: String(settings.contactEmail || 'redaksi@porosmadura.com'),
    logo: settings.logo,
    defaultOgImage: settings.defaultOgImage,
    socialLinks: asRecord(settings.socialLinks) as Record<string, string | undefined>,
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderLexicalChildren(children: unknown): string {
  if (!Array.isArray(children)) return ''
  return children.map(renderLexicalNode).join('')
}

function renderTextNode(node: Record<string, unknown>) {
  let html = escapeHtml(String(node.text || ''))
  const format = typeof node.format === 'number' ? node.format : 0

  if (format & 1) html = `<strong>${html}</strong>`
  if (format & 2) html = `<em>${html}</em>`
  if (format & 4) html = `<s>${html}</s>`
  if (format & 8) html = `<u>${html}</u>`
  if (format & 16) html = `<code>${html}</code>`

  return html
}

function renderLexicalNode(value: unknown): string {
  const node = asRecord(value)
  const type = String(node.type || '')

  if (type === 'text') return renderTextNode(node)

  const children = renderLexicalChildren(node.children)
  if (!children && type !== 'linebreak') return ''

  if (type === 'linebreak') return '<br />'
  if (type === 'heading') {
    const tag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(String(node.tag))
      ? String(node.tag)
      : 'h2'
    return `<${tag}>${children}</${tag}>`
  }
  if (type === 'paragraph') return `<p>${children}</p>`
  if (type === 'quote') return `<blockquote>${children}</blockquote>`
  if (type === 'list') {
    const tag = node.listType === 'number' ? 'ol' : 'ul'
    return `<${tag}>${children}</${tag}>`
  }
  if (type === 'listitem') return `<li>${children}</li>`
  if (type === 'link') {
    const url = typeof node.url === 'string' ? node.url : '#'
    const safeUrl = escapeHtml(url)
    return `<a href="${safeUrl}" rel="noopener noreferrer">${children}</a>`
  }

  return children
}

export async function renderRichText(content: unknown): Promise<string> {
  if (typeof content === 'string') return content || '<p>Konten belum tersedia.</p>'

  const lexicalContent = asRecord(content)
  if (!lexicalContent.root) return '<p>Konten belum tersedia.</p>'

  const root = asRecord(lexicalContent.root)
  const html = renderLexicalChildren(root.children)
  return html || '<p>Konten belum tersedia.</p>'
}

export function getSettingsOgImage(settings: PublicSettings): string {
  return getImageSizeUrl(settings.defaultOgImage as Record<string, unknown> | null | undefined, 'og')
}
