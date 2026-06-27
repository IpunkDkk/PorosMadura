import { notFound } from 'next/navigation'
import { PostFocusForm } from '@/components/cms/PostFocusForm'
import { getCmsPostFormData } from '@/lib/cms-admin'

export const dynamic = 'force-dynamic'

export default async function CmsPostFocusPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!slug) notFound()

  const data = await getCmsPostFormData(slug)
  if (!data.post) notFound()

  return (
    <PostFocusForm
      post={data.post}
      categories={data.categories}
      authors={data.authors}
      tags={data.tags}
      mediaItems={data.media}
      selectedTagIds={data.selectedTagIds}
    />
  )
}
