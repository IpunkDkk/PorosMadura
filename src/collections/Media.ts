import type { CollectionConfig } from 'payload'
import { canReadAny } from '@/hooks/accessControl'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, fit: 'cover' },
      { name: 'card', width: 768, height: 432, fit: 'cover' },
      { name: 'hero', width: 1280, height: 720, fit: 'cover' },
      { name: 'og', width: 1200, height: 630, fit: 'cover' },
    ],
    staticDir: 'public/media',
    disableLocalStorage: false,
  },
  access: {
    read: canReadAny,
    create: canReadAny,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Text (wajib untuk aksesibilitas)',
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'credit',
      type: 'text',
    },
    {
      name: 'folder',
      type: 'text',
      defaultValue: '/',
    },
  ],
}
