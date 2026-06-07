import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, isAdminOrEditorOrAuthor, canReadAny } from '@/hooks/accessControl'
import { invalidateAdCache } from '@/hooks/invalidateCache'

export const Ads: CollectionConfig = {
  slug: 'ads',
  admin: {
    group: 'Iklan',
    useAsTitle: 'title',
    defaultColumns: ['title', 'advertiserName', 'placement', 'startDate', 'endDate', 'status', 'impressionsCount', 'clicksCount'],
  },
  access: {
    create: isAdminOrEditor,
    read: canReadAny,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [invalidateAdCache],
    afterDelete: [invalidateAdCache],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Nama Iklan',
    },
    {
      name: 'advertiserName',
      type: 'text',
      label: 'Nama Pengiklan',
    },
    {
      name: 'advertiserContact',
      type: 'text',
      label: 'Kontak Pengiklan',
    },
    {
      name: 'imageDesktop',
      type: 'upload',
      relationTo: 'media',
      label: 'Banner Desktop',
    },
    {
      name: 'imageMobile',
      type: 'upload',
      relationTo: 'media',
      label: 'Banner Mobile',
    },
    {
      name: 'targetUrl',
      type: 'text',
      required: true,
      label: 'Link Tujuan',
    },
    {
      name: 'placement',
      type: 'relationship',
      relationTo: 'ad-slots',
      required: true,
      label: 'Posisi (Placement)',
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      label: 'Tanggal Mulai',
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
      label: 'Tanggal Selesai',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Aktif', value: 'active' },
        { label: 'Nonaktif', value: 'inactive' },
      ],
      label: 'Status',
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 0,
      label: 'Prioritas (semakin besar semakin tinggi)',
    },
    {
      name: 'impressionsCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
      label: 'Jumlah Tayangan',
    },
    {
      name: 'clicksCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
      label: 'Jumlah Klik',
    },
  ],
}
