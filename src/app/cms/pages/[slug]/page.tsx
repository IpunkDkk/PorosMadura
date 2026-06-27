import { notFound } from 'next/navigation'
import { PageForm } from '@/components/cms/PageForm'
import { getCmsPageFormData } from '@/lib/cms-admin'

export const dynamic = 'force-dynamic'

export default async function CmsEditPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!slug) notFound()

  const data = await getCmsPageFormData(slug)
  if (!data.page) notFound()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-poros-red">Halaman Statis</p>
        <h1 className="font-heading text-3xl font-black text-poros-navy">Edit Halaman</h1>
      </div>
      <PageForm
        page={data.page}
        mediaItems={data.media}
      />
    </div>
  )
}
