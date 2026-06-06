import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, canReadAny } from '@/hooks/accessControl'
import { invalidateTagCache } from '@/hooks/invalidateCache'
import { generateSlug } from '@/hooks/generateSlug'

export const Tags: CollectionConfig = {
  slug: 'tags',
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
    afterChange: [invalidateTagCache],
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
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
