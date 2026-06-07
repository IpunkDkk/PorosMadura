import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/hooks/accessControl'

export const AdEvents: CollectionConfig = {
  slug: 'ad-events',
  admin: {
    group: 'Iklan',
    useAsTitle: 'id',
    defaultColumns: ['ad', 'eventType', 'placement', 'createdAt'],
    listSearchableFields: ['placement', 'eventType'],
  },
  access: {
    create: () => true,
    read: isAdmin,
    update: () => false,
    delete: () => false,
  },
  timestamps: true,
  fields: [
    {
      name: 'ad',
      type: 'relationship',
      relationTo: 'ads',
      label: 'Iklan',
    },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: [
        { label: 'Impression', value: 'impression' },
        { label: 'Click', value: 'click' },
      ],
      label: 'Tipe Event',
    },
    {
      name: 'placement',
      type: 'text',
      label: 'Placement',
    },
    {
      name: 'pageUrl',
      type: 'text',
      label: 'URL Halaman',
    },
    {
      name: 'userAgent',
      type: 'text',
      label: 'User Agent',
    },
    {
      name: 'ipHash',
      type: 'text',
      label: 'IP (hash)',
    },
  ],
}
