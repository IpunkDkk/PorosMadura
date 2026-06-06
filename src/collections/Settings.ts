import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: {
    group: 'Admin',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'PorosMadura',
    },
    {
      name: 'siteDescription',
      type: 'textarea',
    },
    {
      name: 'tagline',
      type: 'text',
      defaultValue: 'Berita Tepat, Fakta Kuat',
    },
    {
      name: 'siteUrl',
      type: 'text',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'logoDark',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'defaultOgImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        { name: 'facebook', type: 'text' },
        { name: 'twitter', type: 'text' },
        { name: 'instagram', type: 'text' },
        { name: 'youtube', type: 'text' },
      ],
    },
    {
      name: 'defaultSeoTitle',
      type: 'text',
      defaultValue: 'PorosMadura',
    },
    {
      name: 'defaultSeoDescription',
      type: 'textarea',
      defaultValue: 'Berita Tepat, Fakta Kuat',
    },
    {
      name: 'googleAnalyticsId',
      type: 'text',
    },
    {
      name: 'rssTitle',
      type: 'text',
      defaultValue: 'PorosMadura',
    },
    {
      name: 'rssDescription',
      type: 'textarea',
      defaultValue: 'Berita Tepat, Fakta Kuat',
    },
    {
      name: 'newsPublicationName',
      type: 'text',
      defaultValue: 'PorosMadura',
    },
  ],
}
