'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, FileText, Gauge, Image, LogOut, Megaphone, Settings, Tags, Users } from 'lucide-react'
import { cmsLogoutAction } from '@/lib/cms-admin'

type NavItem = {
  href: string
  label: string
  icon: string
  children?: {
    href: string
    label: string
  }[]
}

type CmsShellProps = {
  children: ReactNode
  navItems: NavItem[]
  user?: {
    email: string
    role: string
  } | null
}

const breadcrumbLabels: Record<string, string> = {
  cms: 'CMS',
  posts: 'Artikel',
  new: 'Baru',
  media: 'Media',
  ads: 'Iklan',
  taxonomy: 'Taksonomi',
  categories: 'Kategori',
  tags: 'Tag',
  authors: 'Penulis',
  users: 'Users',
  settings: 'Settings',
  login: 'Login',
}

const navIcons = {
  dashboard: Gauge,
  posts: FileText,
  media: Image,
  ads: Megaphone,
  taxonomy: Tags,
  users: Users,
  settings: Settings,
}

function buildBreadcrumbs(pathname: string) {
  const parts = pathname.split('/').filter(Boolean)
  return parts.map((part, index) => {
    const href = `/${parts.slice(0, index + 1).join('/')}`
    return {
      href,
      label: breadcrumbLabels[part] || (Number.isFinite(Number(part)) ? `#${part}` : part),
    }
  })
}

function pageTitle(pathname: string) {
  const crumbs = buildBreadcrumbs(pathname)
  const last = crumbs[crumbs.length - 1]
  if (!last || last.href === '/cms') return 'Dashboard'
  return last.label
}

export function CmsShell({ children, navItems, user }: CmsShellProps) {
  const pathname = usePathname()
  const isLogin = pathname === '/cms/login'
  const crumbs = buildBreadcrumbs(pathname)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  if (isLogin) {
    return (
      <div className="min-h-screen bg-page-bg text-text-primary">
        <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page-bg text-text-primary lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-border-light bg-poros-navy text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-white/10">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-5 py-5">
            <Link href="/cms" className="font-heading text-xl font-black">
              PorosMadura CMS
            </Link>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-white/55">
              Custom dashboard
            </p>
          </div>

          <nav className="flex flex-1 gap-1 overflow-x-auto px-3 py-3 lg:block lg:space-y-1 lg:overflow-visible">
            {navItems.map((item) => {
              const Icon = navIcons[item.icon as keyof typeof navIcons] || Gauge
              const active = item.href === '/cms'
                ? pathname === '/cms'
                : pathname.startsWith(item.href)
              const hasChildren = Boolean(item.children?.length)
              const open = openGroups[item.href] ?? active

              return (
                <div key={item.href} className="shrink-0 lg:w-full">
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => setOpenGroups((current) => ({ ...current, [item.href]: !open }))}
                      className={`inline-flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-white text-poros-navy'
                          : 'text-white/75 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon size={17} />
                      <span className="min-w-0 flex-1 text-left">{item.label}</span>
                      <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`inline-flex min-h-10 shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors lg:w-full ${
                        active
                          ? 'bg-white text-poros-navy'
                          : 'text-white/75 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon size={17} />
                      {item.label}
                    </Link>
                  )}

                  {hasChildren && open && (
                    <div className="mt-1 flex gap-1 pl-3 lg:block lg:space-y-1 lg:pl-8">
                      {item.children?.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="inline-flex min-h-9 shrink-0 items-center rounded-md px-3 py-2 text-xs font-semibold text-white/65 hover:bg-white/10 hover:text-white lg:w-full"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          <div className="hidden border-t border-white/10 p-4 lg:block">
            <p className="truncate text-sm font-semibold">{user?.email || 'Tidak login'}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-white/50">{user?.role || 'viewer'}</p>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-border-light bg-white/95 backdrop-blur">
          <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <nav className="mb-1 flex items-center gap-1 text-xs font-semibold text-text-secondary">
                  {crumbs.map((crumb, index) => (
                    <span key={crumb.href} className="inline-flex items-center gap-1">
                      {index > 0 && <ChevronRight size={13} />}
                      {index === crumbs.length - 1 ? (
                        <span className="truncate text-text-primary">{crumb.label}</span>
                      ) : (
                        <Link href={crumb.href} className="truncate hover:text-poros-red">
                          {crumb.label}
                        </Link>
                      )}
                    </span>
                  ))}
                </nav>
                <h1 className="font-heading text-xl font-black text-poros-navy lg:text-2xl">
                  {pageTitle(pathname)}
                </h1>
              </div>

              <form action={cmsLogoutAction}>
                <button className="inline-flex h-9 items-center gap-2 rounded-md border border-border-light bg-white px-3 text-sm font-semibold text-text-secondary hover:border-poros-red hover:text-poros-red">
                  <LogOut size={16} /> Keluar
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
