import { jsonrepair } from 'jsonrepair'

type JsonObject = Record<string, any>

export type AiNewsProgress = {
  stage: string
  progress: number
  message: string
}

type AiNewsProgressCallback = (progress: AiNewsProgress) => void | Promise<void>

export type AiPostDraft = {
  source: {
    url: string
    title: string
    siteName: string
    imageUrl: string
  }
  form: {
    title: string
    slug: string
    excerpt: string
    content: string
    seoTitle: string
    seoDescription: string
    canonicalUrl: string
    sourceName: string
    sourceUrl: string
    category: string
    tagNames: string[]
    featuredImageId?: number
    ogImageId?: number
    readingTime: number
    status: 'draft'
    allowIndex: boolean
  }
  social: {
    caption: string
    hashtags: string[]
    imagePrompt: string
  }
  diagnostics: {
    scrapedCharacters: number
    pipeline: string[]
    warnings?: string[]
  }
}

class NineRouterError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
  }
}

class AiJsonParseError extends Error {
  constructor(readonly rawContent: string, message: string) {
    super(message)
  }
}

function get9RouterConfig() {
  return {
    baseUrl: (process.env.NINE_ROUTER_BASE_URL || 'http://127.0.0.1:20128/v1').replace(/\/$/, ''),
    apiKey: process.env.NINE_ROUTER_API_KEY || '',
    textModel: process.env.NINE_ROUTER_TEXT_MODEL || 'kr/claude-sonnet-4.5',
    fallbackModel: process.env.NINE_ROUTER_FALLBACK_MODEL || '',
  }
}

async function call9Router(path: string, body: JsonObject, timeoutMs: number) {
  const config = get9RouterConfig()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`

  const response = await fetch(`${config.baseUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  })
  const text = await response.text()
  let result: JsonObject = {}

  try {
    result = JSON.parse(text || '{}')
  } catch {
    throw new Error(`9Router mengembalikan respons non-JSON (${response.status})`)
  }

  if (!response.ok) {
    throw new NineRouterError(
      response.status,
      result.error?.message || result.message || `9Router gagal (${response.status})`,
    )
  }

  return result
}

function parseJsonContent(content: string): JsonObject {
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')

  try {
    return JSON.parse(cleaned)
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start >= 0 && end > start) {
      const objectText = cleaned.slice(start, end + 1)
      try {
        return JSON.parse(objectText)
      } catch {
        try {
          return JSON.parse(jsonrepair(objectText))
        } catch (error) {
          throw new AiJsonParseError(objectText, error instanceof Error ? error.message : 'JSON AI tidak valid')
        }
      }
    }
  }

  throw new AiJsonParseError(cleaned, 'AI tidak mengembalikan object JSON yang valid')
}

async function repairJsonContent(rawContent: string, requiredFieldsHint: string, model: string) {
  const response = await call9Router('/chat/completions', {
    model,
    messages: [
      {
        role: 'system',
        content: 'Anda adalah JSON repair tool. Ubah input menjadi satu object JSON valid. Jangan tambah markdown, komentar, atau penjelasan.',
      },
      {
        role: 'user',
        content: `Field wajib: ${requiredFieldsHint}\n\nJSON RUSAK:\n${rawContent.slice(0, 12000)}`,
      },
    ],
    temperature: 0,
    stream: false,
    max_tokens: 4500,
    reasoning_effort: 'none',
  }, 120_000)

  const repaired = response.choices?.[0]?.message?.content
  if (typeof repaired !== 'string' || !repaired.trim()) {
    throw new Error('AI gagal memperbaiki JSON')
  }

  return parseJsonContent(repaired)
}

async function generateJson(
  system: string,
  prompt: string,
  maxTokens = 3500,
  requiredFieldsHint = 'field sesuai instruksi',
): Promise<JsonObject> {
  const config = get9RouterConfig()
  const models = [...new Set([config.textModel, config.fallbackModel].filter(Boolean))]
  const body: JsonObject = {
    model: config.textModel,
    messages: [
      { role: 'system', content: `${system}\n\nKembalikan HANYA satu object JSON valid tanpa markdown.` },
      { role: 'user', content: prompt },
    ],
    temperature: 0,
    stream: false,
    max_tokens: maxTokens,
    reasoning_effort: 'none',
  }

  let lastError: unknown
  for (const model of models) {
    body.model = model
    try {
      const response = await call9Router('/chat/completions', body, 180_000)
      const content = response.choices?.[0]?.message?.content
      if (typeof content !== 'string' || !content.trim()) {
        throw new Error('AI tidak mengembalikan konten teks')
      }
      try {
        return parseJsonContent(content)
      } catch (error) {
        if (error instanceof AiJsonParseError) {
          return await repairJsonContent(error.rawContent, requiredFieldsHint, model)
        }
        throw error
      }
    } catch (error) {
      lastError = error
      const canFallback = error instanceof NineRouterError && [400, 401, 402, 403, 408, 429, 500, 502, 503, 504, 524].includes(error.status)
      if (!canFallback || model === models.at(-1)) throw error
    }
  }

  throw lastError
}

function isLogoOrIcon(url: string) {
  const lower = url.toLowerCase()
  return [
    'logo',
    'icon',
    'favicon',
    'avatar',
    'loader',
    'themes/',
    'theme/',
    'banner',
    'badge',
    'advertisement',
    'ads.',
    'social-',
    'share-',
    'facebook',
    'twitter',
    'instagram',
    'youtube',
    'transparent.png',
  ].some((flag) => lower.includes(flag)) || lower.endsWith('.svg') || lower.endsWith('.ico')
}

function extractMeta(html: string, property: string) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escaped}["']`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return decodeHtml(match[1].trim())
  }
  return ''
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function cleanArticleMarkdown(markdown: string, articleTitle: string) {
  const lines = markdown.replace(/\r/g, '').split('\n')
  const normalizedTitle = articleTitle
    .replace(/\s+-\s+[^-]+$/, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase()

  const titleMatches: number[] = []
  lines.forEach((line, index) => {
    const normalizedLine = line
      .replace(/^#+\s*/, '')
      .replace(/\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/[^a-z0-9]+/gi, ' ')
      .trim()
      .toLowerCase()
    if (normalizedTitle && normalizedLine.includes(normalizedTitle)) titleMatches.push(index)
  })

  const earlyMatches = titleMatches.filter((index) => index < Math.min(lines.length * 0.6, 250))
  const start = (earlyMatches.at(-1) ?? titleMatches.at(-1) ?? -1) + 1
  const content: string[] = []

  for (let index = Math.max(start, 0); index < lines.length; index += 1) {
    const rawLine = lines[index].trim()
    if (/^#{2,6}\s*(kata kunci|tags?|rekomendasi|artikel terkait|berita (terbaru|lainnya))/i.test(rawLine)) break
    if (!rawLine) {
      if (content.at(-1) !== '') content.push('')
      continue
    }
    if (/^(title:|url source:|published time:|markdown content:|bagikan|oleh\s+-|editor\s+-)/i.test(rawLine)) continue
    if (/^\[?!\[.*\]\([^)]*\)\]?$/i.test(rawLine)) continue

    const cleaned = rawLine
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/^#{1,6}\s*/, '')
      .replace(/^\*\s+/, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (cleaned.length >= 20 && !/^https?:\/\//i.test(cleaned)) content.push(cleaned)
  }

  return content.join('\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 18000)
}

async function scrapeArticle(url: string) {
  let title = ''
  let text = ''
  let imageUrl = ''
  let rawHtml = ''
  const siteName = new URL(url).hostname.replace(/^www\./, '')

  const htmlResponse = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    },
    signal: AbortSignal.timeout(8000),
  }).catch(() => null)

  if (htmlResponse?.ok) {
    rawHtml = await htmlResponse.text()
    title = extractMeta(rawHtml, 'og:title') || rawHtml.match(/<title>(.*?)<\/title>/i)?.[1]?.trim() || ''
    const metaImage = extractMeta(rawHtml, 'og:image') || extractMeta(rawHtml, 'twitter:image')
    if (metaImage && !isLogoOrIcon(metaImage)) imageUrl = metaImage
  }

  const jinaResponse = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`, {
    headers: { Accept: 'text/plain' },
    signal: AbortSignal.timeout(16000),
  }).catch(() => null)

  if (jinaResponse?.ok) {
    const markdown = await jinaResponse.text()
    if (!title) title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || ''
    if (!imageUrl) {
      const candidates = [...markdown.matchAll(/!\[.*?\]\((https?:\/\/.*?)\)/gi)].map((match) => match[1])
      imageUrl = candidates.find((candidate) => !isLogoOrIcon(candidate)) || ''
    }
    text = cleanArticleMarkdown(markdown, title)
  }

  if (!text && rawHtml) {
    const paragraphs = rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .match(/<p\b[^>]*>(.*?)<\/p>/gi)

    text = paragraphs
      ?.map((paragraph) => decodeHtml(paragraph.replace(/<[^>]*>/g, '').trim()))
      .filter((paragraph) => paragraph.length > 30)
      .join('\n\n') || ''
  }

  if (!text || text.length < 250) {
    throw new Error('Konten artikel sumber terlalu pendek atau tidak bisa discrape')
  }

  return {
    title: decodeHtml(title) || 'Artikel sumber',
    text,
    imageUrl,
    siteName,
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function paragraphsToHtml(value: string) {
  return value
    .replace(/\\n/g, '\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const html = escapeHtml(paragraph).replace(/\n/g, '<br>')
      const hasDirectQuote = /(["“])[^"“”]{12,}(["”])/.test(paragraph)
      return hasDirectQuote
        ? `<blockquote><p>${html}</p></blockquote>`
        : `<p>${html}</p>`
    })
    .join('\n\n')
}

function stringField(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function stringArray(value: unknown) {
  if (typeof value === 'string') {
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 12)
  }
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 12)
}

function estimateReadingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 220))
}

export async function generateAiPostDraft(
  articleUrl: string,
  onProgress?: AiNewsProgressCallback,
): Promise<AiPostDraft> {
  if (!/^https?:\/\//i.test(articleUrl)) {
    throw new Error('URL artikel harus diawali http:// atau https://')
  }
  if (!get9RouterConfig().apiKey) {
    throw new Error('NINE_ROUTER_API_KEY belum diisi')
  }

  await onProgress?.({ stage: 'scrape', progress: 10, message: 'Mengambil konten artikel sumber' })
  const scraped = await scrapeArticle(articleUrl)
  await onProgress?.({ stage: 'scrape', progress: 25, message: 'Konten artikel sumber berhasil dibaca' })
  const sourcePayload = `SOURCE TITLE: ${scraped.title}\nSOURCE SITE: ${scraped.siteName}\nSOURCE URL: ${articleUrl}\n\nSOURCE CONTENT:\n${scraped.text}`
  const pipeline: string[] = ['scrape']

  await onProgress?.({ stage: 'article', progress: 35, message: 'Menulis draft artikel CMS' })
  let article = await generateJson(
    `Anda adalah editor berita Poros Madura. Susun draft artikel CMS yang lengkap, akurat, dan siap diedit dari bahan sumber.
Aturan mutlak:
- Gunakan hanya fakta dari SOURCE CONTENT.
- Jangan mengarang nama, jabatan, lokasi, tanggal, angka, kutipan, atau dampak.
- Pertahankan semua informasi inti yang relevan dari sumber.
- Gaya bahasa Indonesia newsroom, netral, padat, dan mudah dibaca.
- title harus berbeda dari SOURCE TITLE kecuali nama resmi atau istilah kunci.
- Jangan menyalin urutan paragraf sumber secara mentah.
- Kutipan langsung boleh dipertahankan apa adanya, tetapi narasi di luar kutipan harus ditulis ulang.
- content harus 5-9 paragraf, dipisah newline ganda, bukan HTML.
- excerpt maksimal 160 karakter.
- category pilih salah satu: viral, kriminal, politik, olahraga, hiburan, kesehatan, ekonomi, nasional, internasional, teknologi, bencana, breaking news.
- tagNames berisi 3-8 tag pendek yang relevan.`,
    `${sourcePayload}\n\nJSON field wajib: title, excerpt, content, category, tagNames.`,
    4200,
    'title, excerpt, content, category, tagNames',
  )
  pipeline.push('article')

  await onProgress?.({ stage: 'rewrite', progress: 52, message: 'Mengubah struktur dan diksi agar tidak terlalu mirip sumber' })
  article = await generateJson(
    `Anda adalah editor orisinalitas Poros Madura. Revisi draft agar substansinya tetap akurat tetapi struktur dan pilihan katanya berbeda jelas dari artikel sumber.
Aturan mutlak:
- Gunakan hanya fakta dari SOURCE CONTENT dan DRAFT.
- Jangan menambah klaim, opini, konteks, nama, jabatan, tanggal, angka, lokasi, atau kutipan baru.
- Ubah susunan informasi: jangan mengikuti urutan paragraf sumber jika tidak perlu.
- Ubah title agar tidak identik dengan SOURCE TITLE, tetapi tetap faktual dan layak berita.
- Ubah struktur kalimat, pembuka paragraf, transisi, dan pilihan kata narasi.
- Gabungkan atau pecah paragraf bila membantu membuat alur baru.
- Hindari frasa naratif non-kutipan yang sama dengan sumber lebih dari 8 kata berurutan.
- Nama orang, lembaga, jabatan, tempat, angka, tanggal, istilah resmi, dan kutipan langsung boleh tetap sama.
- Kutipan langsung harus tetap akurat dan jangan diparafrasekan sebagai kutipan.
- Tetap gaya newsroom Indonesia yang netral, padat, dan mudah dibaca.
- content harus 5-9 paragraf, dipisah newline ganda, bukan HTML.
- excerpt maksimal 160 karakter.
- Pertahankan category dan tagNames jika masih relevan.`,
    `${sourcePayload}\n\nDRAFT SAAT INI:\n${JSON.stringify(article)}\n\nJSON field wajib: title, excerpt, content, category, tagNames.`,
    4200,
    'title, excerpt, content, category, tagNames',
  )
  pipeline.push('rewrite')

  await onProgress?.({ stage: 'seo', progress: 70, message: 'Menyusun judul SEO, deskripsi, slug, dan kata kunci' })
  const seo = await generateJson(
    `Anda spesialis SEO Poros Madura. Buat metadata SEO dari draft artikel tanpa menambah fakta baru.
Aturan:
- seoTitle 40-60 karakter jika memungkinkan.
- seoDescription 100-160 karakter.
- slug huruf kecil, strip, tanpa domain.
- focusKeyphrase harus muncul natural di seoTitle dan seoDescription.`,
    `SOURCE TITLE: ${scraped.title}\nDRAFT:\n${JSON.stringify(article)}\n\nJSON field wajib: seoTitle, seoDescription, slug, focusKeyphrase, seoKeywords.`,
    1800,
    'seoTitle, seoDescription, slug, focusKeyphrase, seoKeywords',
  )
  pipeline.push('seo')

  await onProgress?.({ stage: 'social', progress: 84, message: 'Membuat caption sosial dan prompt gambar' })
  const social = await generateJson(
    `Anda social media editor Poros Madura. Buat pendukung distribusi sosial dari draft, tanpa menambah fakta baru.
Aturan:
- caption Facebook informatif, singkat, ada CTA ringan, tidak sensasional.
- hashtags 3-8 item.
- imagePrompt bahasa Inggris untuk ilustrasi/foto jurnalistik realistis tanpa teks.`,
    `DRAFT:\n${JSON.stringify(article)}\n\nJSON field wajib: caption, hashtags, imagePrompt.`,
    1800,
    'caption, hashtags, imagePrompt',
  )
  pipeline.push('social')
  await onProgress?.({ stage: 'finalize', progress: 94, message: 'Merapikan field artikel CMS' })

  const title = stringField(article.title, scraped.title)
  const contentText = stringField(article.content, scraped.text)
  const excerpt = stringField(article.excerpt, contentText.replace(/\s+/g, ' ').slice(0, 157))
  const slug = slugify(stringField(seo.slug, title)) || slugify(title)
  const tagNames = [...new Set([...stringArray(article.tagNames), ...stringArray(seo.seoKeywords)])].slice(0, 10)

  const draft: AiPostDraft = {
    source: {
      url: articleUrl,
      title: scraped.title,
      siteName: scraped.siteName,
      imageUrl: scraped.imageUrl,
    },
    form: {
      title,
      slug,
      excerpt,
      content: paragraphsToHtml(contentText),
      seoTitle: stringField(seo.seoTitle, title).slice(0, 80),
      seoDescription: stringField(seo.seoDescription, excerpt).slice(0, 180),
      canonicalUrl: articleUrl,
      sourceName: scraped.siteName,
      sourceUrl: articleUrl,
      category: stringField(article.category, ''),
      tagNames,
      readingTime: estimateReadingTime(contentText),
      status: 'draft',
      allowIndex: true,
    },
    social: {
      caption: stringField(social.caption, ''),
      hashtags: stringArray(social.hashtags),
      imagePrompt: stringField(social.imagePrompt, ''),
    },
    diagnostics: {
      scrapedCharacters: scraped.text.length,
      pipeline,
    },
  }

  await onProgress?.({ stage: 'complete', progress: 100, message: 'Draft artikel AI selesai' })
  return draft
}
