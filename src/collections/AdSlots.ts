import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, canReadAny } from '@/hooks/accessControl'

export const AdSlots: CollectionConfig = {
  slug: 'ad-slots',
  admin: {
    group: 'Iklan',
    useAsTitle: 'label',
    defaultColumns: ['placement', 'label', 'isActive', 'isFallbackActive'],
  },
  access: {
    create: isAdmin,
    read: canReadAny,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'placement',
      type: 'text',
      required: true,
      unique: true,
      label: 'Kode Placement',
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      label: 'Nama Slot',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Deskripsi Lokasi',
    },
    {
      name: 'fallbackType',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'Tidak Ada', value: 'none' },
        { label: 'Google AdSense', value: 'adsense' },
      ],
      label: 'Jenis Fallback',
    },
    {
      name: 'fallbackCode',
      type: 'textarea',
      label: 'Kode AdSense / Ad Network',
    },
    {
      name: 'isFallbackActive',
      type: 'checkbox',
      defaultValue: false,
      label: 'Fallback Aktif',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Slot Aktif',
    },
  ],
}
