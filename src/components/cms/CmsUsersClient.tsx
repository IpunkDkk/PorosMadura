'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Save } from 'lucide-react'
import { saveUserAction } from '@/lib/cms-admin'
import { formatPortalDateTime } from '@/lib/date'
import { CmsTaxonomyModal } from '@/components/cms/CmsTaxonomyModal'

type User = {
  id: number
  name: string
  email: string
  role: string
  isActive?: boolean | null
  lastLoginAt?: Date | string | null
}

function UserForm({ user, onClose }: { user?: User; onClose: () => void }) {
  const router = useRouter()
  return (
    <form
      action={async (formData: FormData) => {
        await saveUserAction(formData)
        router.refresh()
        onClose()
      }}
      className="space-y-4"
    >
      {user?.id ? <input type="hidden" name="id" value={user.id} /> : null}

      <div>
        <label className="block text-sm font-semibold mb-1.5">
          Nama <span className="text-poros-red">*</span>
        </label>
        <input
          name="name"
          required
          defaultValue={user?.name || ''}
          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">
          Email <span className="text-poros-red">*</span>
        </label>
        <input
          name="email"
          type="email"
          required
          defaultValue={user?.email || ''}
          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Role</label>
        <select
          name="role"
          defaultValue={user?.role || 'author'}
          className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        >
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="author">Author</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">
          {user?.id ? 'Password Baru (kosongkan jika tidak diganti)' : 'Password *'}
        </label>
        <input
          name="password"
          type="password"
          required={!user?.id}
          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        />
      </div>

      <div className="flex items-center pb-1">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={user?.isActive !== false}
            className="h-4 w-4 accent-poros-red"
          />
          <span className="font-semibold">Aktif</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border-light pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border-light px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-gray-50"
        >
          Batal
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          <Save size={15} /> {user?.id ? 'Update User' : 'Buat User'}
        </button>
      </div>
    </form>
  )
}

export function CmsUsersClient({ users }: { users: User[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | undefined>()

  const openCreate = () => { setEditUser(undefined); setModalOpen(true) }
  const openEdit = (user: User) => { setEditUser(user); setModalOpen(true) }
  const closeModal = () => setModalOpen(false)

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-poros-red">Akses</p>
          <h1 className="font-heading text-3xl font-black text-poros-navy">Users</h1>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          <Plus size={16} /> User Baru
        </button>
      </div>

      <section className="overflow-hidden rounded-xl border border-border-light bg-white shadow-sm">
        <div className="overflow-x-auto">
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
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold uppercase text-poros-navy">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                        user.isActive === false
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {user.isActive === false ? 'Nonaktif' : 'Aktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">
                    {formatPortalDateTime(user.lastLoginAt) || '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(user)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-1.5 text-xs font-bold text-poros-red hover:bg-red-50 hover:border-poros-red transition-colors"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-secondary">
                    Belum ada user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <CmsTaxonomyModal
        open={modalOpen}
        onClose={closeModal}
        title={editUser ? 'Edit User' : 'User Baru'}
      >
        <UserForm user={editUser} onClose={closeModal} />
      </CmsTaxonomyModal>
    </>
  )
}
