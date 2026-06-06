import type { CollectionConfig } from 'payload'
import { validateStatusTransition } from '@/hooks/validateStatusTransition'
import { isAdmin, isAdminOrEditor, isAdminOrEditorOrAuthor, canReadAny } from '@/hooks/accessControl'
import { generateSlug } from '@/hooks/generateSlug'
import { createRedirectOnSlugChange } from '@/hooks/createRedirectOnSlugChange'
import { syncPostToSearch, removePostFromSearch } from '@/hooks/syncPostToSearch'
import { invalidatePostCache } from '@/hooks/invalidateCache'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'status', 'category', 'author', 'publishedAt'],
  },
  access: {
    create: isAdminOrEditorOrAuthor,
    read: canReadAny,
    update: isAdminOrEditorOrAuthor,
    delete: isAdminOrEditor,
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  hooks: {
    afterChange: [createRedirectOnSlugChange, syncPostToSearch, invalidatePostCache],
    afterDelete: [removePostFromSearch],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [generateSlug],
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      hasMany: false,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Review', value: 'review' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      hooks: {
        beforeChange: [validateStatusTransition],
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
    },
    {
      name: 'scheduledAt',
      type: 'date',
    },
    {
      name: 'seoTitle',
      type: 'text',
    },
    {
      name: 'seoDescription',
      type: 'textarea',
    },
    {
      name: 'canonicalUrl',
      type: 'text',
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'isBreakingNews',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'allowIndex',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'sourceName',
      type: 'text',
    },
    {
      name: 'sourceUrl',
      type: 'text',
    },
    {
      name: 'readingTime',
      type: 'number',
      admin: { readOnly: true },
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
  ],
}
