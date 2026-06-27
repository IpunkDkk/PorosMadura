import { PostForm } from '@/components/cms/PostForm'
import { getCmsPostFormData } from '@/lib/cms-admin'

export const dynamic = 'force-dynamic'

export default async function CmsNewPostPage() {
  const data = await getCmsPostFormData()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-poros-red">Artikel</p>
        <h1 className="font-heading text-3xl font-black text-poros-navy">Artikel Baru</h1>
      </div>
      <PostForm
        categories={data.categories}
        authors={data.authors}
        tags={data.tags}
        mediaItems={data.media}
      />
    </div>
  )
}
