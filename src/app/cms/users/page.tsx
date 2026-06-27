import { getCmsUsers } from '@/lib/cms-admin'
import { CmsUsersClient } from '@/components/cms/CmsUsersClient'

export const dynamic = 'force-dynamic'

export default async function CmsUsersPage() {
  const users = await getCmsUsers()
  return (
    <div className="space-y-6">
      <CmsUsersClient users={users} />
    </div>
  )
}
