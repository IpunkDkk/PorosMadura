import { LockKeyhole } from 'lucide-react'
import { cmsLoginAction } from '@/lib/cms-admin'
import { CmsModalNotice } from '@/components/cms/CmsModalNotice'

export default async function CmsLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
      <form action={cmsLoginAction} className="w-full rounded-lg border border-border-light bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-poros-red text-white">
            <LockKeyhole size={20} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-black text-poros-navy">Masuk CMS</h1>
            <p className="text-sm text-text-secondary">Gunakan akun admin Better Auth.</p>
          </div>
        </div>

        {error && (
          <CmsModalNotice
            open
            title="Login tidak valid"
            description="Email atau password tidak cocok, atau akun tidak aktif untuk akses CMS."
          />
        )}

        <label className="mb-2 block text-sm font-semibold" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="mb-4 w-full rounded-md border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        />

        <label className="mb-2 block text-sm font-semibold" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="mb-5 w-full rounded-md border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        />

        <button className="w-full rounded-md bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
          Masuk
        </button>
      </form>
    </div>
  )
}
