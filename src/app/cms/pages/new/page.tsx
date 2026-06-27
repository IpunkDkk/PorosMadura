import { PageForm } from '@/components/cms/PageForm'
import { getCmsPageFormData } from '@/lib/cms-admin'

export const dynamic = 'force-dynamic'

export default async function CmsNewPage() {
  const data = await getCmsPageFormData()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-poros-red">Halaman Statis</p>
        <h1 className="font-heading text-3xl font-black text-poros-navy">Buat Halaman Baru</h1>
      </div>
      <PageForm
        page={null}
        mediaItems={data.media}
      />
    </div>
  )
}
