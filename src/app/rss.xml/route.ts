import { getPublishedPosts } from '@/lib/custom-cms'

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://porosmadura.com'

  const { docs: posts } = await getPublishedPosts({
    limit: 50,
    sort: '-publishedAt',
  })

  const items = (posts as Array<Record<string, unknown>>).map((post) => {
    const categoryName = typeof post.category === 'object' ? (post.category as Record<string, string>)?.name : ''
    const authorName = typeof post.author === 'object' ? (post.author as Record<string, string>)?.name : ''
    const categorySlug = typeof post.category === 'object' ? (post.category as Record<string, string>)?.slug : ''
    const excerpt = (post.excerpt as string) || (post.title as string)

    return `
    <item>
      <title><![CDATA[${post.title as string}]]></title>
      <link>${siteUrl}/${categorySlug}/${post.slug as string}</link>
      <description><![CDATA[${excerpt}]]></description>
      <pubDate>${new Date(post.publishedAt as string).toUTCString()}</pubDate>
      <guid>${siteUrl}/${categorySlug}/${post.slug as string}</guid>
      ${authorName ? `<author>${authorName}</author>` : ''}
      ${categoryName ? `<category>${categoryName}</category>` : ''}
    </item>`
  }).join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PorosMadura</title>
    <link>${siteUrl}</link>
    <description>Berita Tepat, Fakta Kuat</description>
    <language>id</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
