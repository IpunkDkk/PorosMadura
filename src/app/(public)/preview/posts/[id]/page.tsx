import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getPostPreviewById } from '@/lib/custom-cms'
import { asRecord } from '@/lib/cms'
import { requireCmsRole } from '@/lib/cms-auth'
import { ArticleDetail } from '@/components/article/ArticleDetail'

type Props = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Preview Artikel - PorosMadura',
  robots: { index: false, follow: false },
}

export default async function PostPreviewPage({ params }: Props) {
  const session = await requireCmsRole(['admin', 'editor', 'author'])
  const { id } = await params
  const postId = Number(id)
  if (!Number.isFinite(postId)) notFound()

  const post = await getPostPreviewById(postId)
  if (!post) notFound()

  const postData = asRecord(post)
  const authorData = asRecord(postData.author)
  if (session.role === 'author' && Number(authorData.userId || 0) !== session.id) {
    redirect('/cms/posts')
  }

  return <ArticleDetail post={post} slug={String(postData.slug || id)} preview />
}
