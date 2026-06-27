import { notFound } from 'next/navigation'
import { PostForm } from '@/components/cms/PostForm'
import { PostRevisionHistory } from '@/components/cms/PostRevisionHistory'
import { getCmsPostFormData, getPostRevisions } from '@/lib/cms-admin'

export const dynamic = 'force-dynamic'

export default async function CmsEditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!slug) notFound()

  const data = await getCmsPostFormData(slug)
  if (!data.post) notFound()
  const revisions = (await getPostRevisions(data.post.id)).map((revision) => ({
    ...revision,
    createdAt: revision.createdAt instanceof Date ? revision.createdAt.toISOString() : revision.createdAt,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase text-poros-red">Artikel</p>
          <h1 className="font-heading text-3xl font-black text-poros-navy">Edit Artikel</h1>
        </div>
        <PostRevisionHistory postId={data.post.id} revisions={revisions} />
      </div>
      <PostForm
        post={data.post}
        categories={data.categories}
        authors={data.authors}
        tags={data.tags}
        mediaItems={data.media}
        selectedTagIds={data.selectedTagIds}
      />
    </div>
  )
}
