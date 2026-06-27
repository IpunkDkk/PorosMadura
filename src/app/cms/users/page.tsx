import { Save } from 'lucide-react'
import { getCmsUsers, saveUserAction } from '@/lib/cms-admin'

export const dynamic = 'force-dynamic'

function UserForm({ user }: { user?: any }) {
  return (
    <form action={saveUserAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {user?.id ? <input type="hidden" name="id" value={user.id} /> : null}
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Nama</span>
        <input name="name" required defaultValue={user?.name || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Email</span>
        <input name="email" type="email" required defaultValue={user?.email || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Role</span>
        <select name="role" defaultValue={user?.role || 'author'} className="w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm">
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="author">Author</option>
          <option value="viewer">Viewer</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">{user?.id ? 'Password baru' : 'Password'}</span>
        <input name="password" type="password" required={!user?.id} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
      </label>
      <label className="flex items-center gap-2 text-sm md:col-span-2">
        <input name="isActive" type="checkbox" defaultChecked={user?.isActive !== false} />
        Aktif
      </label>
      <div className="md:col-span-2">
        <button className="inline-flex items-center gap-2 rounded-md bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
          <Save size={16} /> {user?.id ? 'Update User' : 'Buat User'}
        </button>
      </div>
    </form>
  )
}

export default async function CmsUsersPage() {
  const users = await getCmsUsers()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-poros-red">Akses</p>
        <h1 className="font-heading text-3xl font-black text-poros-navy">Users</h1>
      </div>

      <section className="rounded-lg border border-border-light bg-white p-5">
        <h2 className="mb-4 font-heading text-lg font-bold">User Baru</h2>
        <UserForm />
      </section>

      <section className="overflow-hidden rounded-lg border border-border-light bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-text-secondary">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Login Terakhir</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {users.map((user) => (
              <tr key={user.id} className="align-top">
                <td className="px-4 py-3 font-semibold text-gray-900">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">{user.isActive === false ? 'Nonaktif' : 'Aktif'}</td>
                <td className="px-4 py-3">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('id-ID') : '-'}</td>
                <td className="px-4 py-3 text-right">
                  <details>
                    <summary className="cursor-pointer text-sm font-bold text-poros-red">Edit</summary>
                    <div className="mt-4 rounded-md border border-border-light bg-gray-50 p-4 text-left">
                      <UserForm user={user} />
                    </div>
                  </details>
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">Belum ada user.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
