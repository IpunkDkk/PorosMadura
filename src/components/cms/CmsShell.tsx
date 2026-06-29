'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, FileText, Gauge, Image, LogOut, Megaphone, Menu, Settings, Tags, Users, X } from 'lucide-react'
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
  pages: 'Halaman',
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
  pages: FileText,
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
  const isFocusEditor = /^\/cms\/posts\/[^/]+\/focus$/.test(pathname)
  const crumbs = buildBreadcrumbs(pathname)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  function closeMobileNav() {
    setMobileNavOpen(false)
  }

  function renderNav(mode: 'drawer' | 'sidebar') {
    return (
      <nav className={mode === 'drawer'
        ? 'space-y-1 px-3 py-3'
        : 'hidden flex-1 px-3 py-3 lg:block lg:space-y-1'
      }>
        {navItems.map((item) => {
          const Icon = navIcons[item.icon as keyof typeof navIcons] || Gauge
          const active = item.href === '/cms'
            ? pathname === '/cms'
            : pathname.startsWith(item.href)
          const hasChildren = Boolean(item.children?.length)
          const open = openGroups[item.href] ?? active

          return (
            <div key={item.href}>
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => setOpenGroups((current) => ({ ...current, [item.href]: !open }))}
                  className={`inline-flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
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
                  onClick={closeMobileNav}
                  className={`inline-flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
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
                <div className="mt-1 space-y-1 pl-8">
                  {item.children?.map((child) => {
                    const childActive = pathname === child.href
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={closeMobileNav}
                        className={`inline-flex min-h-10 w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                          childActive
                            ? 'bg-white/20 text-white'
                            : 'text-white/65 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {childActive && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-poros-red" />}
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    )
  }

  if (isFocusEditor) {
    return (
      <div className="min-h-screen bg-page-bg text-text-primary">
        <main className="px-4 py-4 md:px-6">
          {children}
        </main>
      </div>
    )
  }

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
      <aside className="hidden bg-poros-navy text-white lg:sticky lg:top-0 lg:block lg:h-screen lg:border-r lg:border-white/10">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-5 py-5">
            <Link href="/cms" className="font-heading text-xl font-black">
              PorosMadura CMS
            </Link>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-white/55">
              Custom dashboard
            </p>
          </div>

          {renderNav('sidebar')}

          <div className="hidden border-t border-white/10 p-4 lg:block">
            <p className="truncate text-sm font-semibold">{user?.email || 'Tidak login'}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-white/50">{user?.role || 'viewer'}</p>
          </div>
        </div>
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu CMS"
            className="absolute inset-0 bg-black/50"
            onClick={closeMobileNav}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(86vw,320px)] flex-col bg-poros-navy text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5">
              <div className="min-w-0">
                <Link href="/cms" onClick={closeMobileNav} className="font-heading text-lg font-black">
                  PorosMadura CMS
                </Link>
                <p className="mt-1 truncate text-xs font-medium uppercase tracking-wide text-white/55">
                  {user?.email || 'Tidak login'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeMobileNav}
                aria-label="Tutup menu"
                className="rounded-md p-2 text-white/75 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {renderNav('drawer')}
            </div>
            <div className="border-t border-white/10 p-4">
              <p className="truncate text-sm font-semibold">{user?.email || 'Tidak login'}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-white/50">{user?.role || 'viewer'}</p>
            </div>
          </aside>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-border-light bg-white/95 backdrop-blur">
          <div className="flex min-h-14 flex-col justify-center gap-1 px-3 py-2 sm:px-4 lg:min-h-16 lg:px-8 lg:py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  aria-label="Buka menu CMS"
                  onClick={() => setMobileNavOpen(true)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border-light bg-white text-poros-navy lg:hidden"
                >
                  <Menu size={18} />
                </button>
                <nav className="flex min-w-0 items-center gap-1 overflow-hidden text-xs font-semibold text-text-secondary">
                  {crumbs.map((crumb, index) => (
                    <span key={crumb.href} className="inline-flex min-w-0 items-center gap-1">
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
              </div>

              <form action={cmsLogoutAction}>
                <button className="inline-flex h-9 items-center gap-2 rounded-md border border-border-light bg-white px-2 text-sm font-semibold text-text-secondary hover:border-poros-red hover:text-poros-red sm:px-3">
                  <LogOut size={16} /> <span className="hidden sm:inline">Keluar</span>
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="cms-content px-3 py-4 sm:px-4 lg:px-8 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
