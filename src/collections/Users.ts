import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/hooks/accessControl'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    loginWithUsername: false,
    useAPIKey: false,
    tokenExpiration: 86400, // 24 hours
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 minutes
    cookies: {
      sameSite: 'Lax',
    },
  },
  admin: {
    useAsTitle: 'name',
    group: 'Admin',
  },
  access: {
    create: isAdmin,
    read: ({ req: { user } }) => {
      // Admin can read all, users can read themselves
      if (user?.role === 'admin') return true
      if (user) return { id: { equals: user.id } }
      return false
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user) return { id: { equals: user.id } }
      return false
    },
    delete: isAdmin,
    admin: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'author',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Author', value: 'author' },
        { label: 'Viewer', value: 'viewer' },
      ],
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: { readOnly: true },
    },
  ],
}
