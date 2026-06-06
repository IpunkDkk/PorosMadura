import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, canReadAny } from '@/hooks/accessControl'
import { generateSlug } from '@/hooks/generateSlug'
import { createRedirectOnSlugChange } from '@/hooks/createRedirectOnSlugChange'
import { invalidateCategoryCache } from '@/hooks/invalidateCache'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
  },
  access: {
    create: isAdminOrEditor,
    read: canReadAny,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [createRedirectOnSlugChange, invalidateCategoryCache],
  },
  fields: [
    {
      name: 'name',
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
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
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
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
