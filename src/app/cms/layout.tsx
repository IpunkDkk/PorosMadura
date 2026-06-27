import type { ReactNode } from 'react'
import { CmsShell } from '@/components/cms/CmsShell'
import { getCmsSession, type CmsRole } from '@/lib/cms-auth'
import '@/css/globals.css'

const navItems = [
  { href: '/cms', label: 'Dashboard', icon: 'dashboard', roles: ['admin', 'editor', 'author'] },
  { href: '/cms/posts', label: 'Artikel', icon: 'posts', roles: ['admin', 'editor', 'author'] },
  { href: '/cms/media', label: 'Media', icon: 'media', roles: ['admin', 'editor'] },
  { href: '/cms/ads', label: 'Iklan', icon: 'ads', roles: ['admin', 'editor'] },
  {
    href: '/cms/taxonomy',
    label: 'Taksonomi',
    icon: 'taxonomy',
    roles: ['admin', 'editor'],
    children: [
      { href: '/cms/taxonomy/categories', label: 'Kategori' },
      { href: '/cms/taxonomy/tags', label: 'Tag' },
      { href: '/cms/taxonomy/authors', label: 'Penulis' },
    ],
  },
  { href: '/cms/users', label: 'Users', icon: 'users', roles: ['admin'] },
  { href: '/cms/settings', label: 'Settings', icon: 'settings', roles: ['admin'] },
]

export default async function CmsLayout({ children }: { children: ReactNode }) {
  const session = await getCmsSession()
  const role = session?.role || 'viewer'
  const visibleNavItems = navItems.filter((item) => item.roles.includes(role as CmsRole))

  return (
    <html lang="id">
      <body>
        <CmsShell navItems={visibleNavItems} user={session}>
          {children}
        </CmsShell>
      </body>
    </html>
  )
}
