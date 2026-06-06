# PorosMadura Phase 1 — Payload Collections (Task 1.6–1.14)

> Part of Phase 1 Foundation plan. All collections live in `src/collections/`.

---

### Task 1.6: Users Collection

**File:** `src/collections/Users.ts`

- [ ] **Step 1: Create Users collection**

```ts
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: false, // Auth handled by Better Auth
  admin: {
    useAsTitle: 'name',
    group: 'Admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
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
```

### Task 1.7: Authors Collection

**File:** `src/collections/Authors.ts`

- [ ] **Step 1: Create Authors collection**

```ts
import type { CollectionConfig } from 'payload'

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
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
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        { name: 'facebook', type: 'text' },
        { name: 'twitter', type: 'text' },
        { name: 'instagram', type: 'text' },
      ],
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
```

### Task 1.8: Categories Collection

**File:** `src/collections/Categories.ts`

- [ ] **Step 1: Create Categories collection**

```ts
import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
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
```

### Task 1.9: Tags Collection

**File:** `src/collections/Tags.ts`

- [ ] **Step 1: Create Tags collection**

```ts
import type { CollectionConfig } from 'payload'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
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
```

### Task 1.10: Media Collection

**File:** `src/collections/Media.ts`

- [ ] **Step 1: Create Media collection**

```ts
import type { CollectionConfig } from 'payload'

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
    staticDir: '../public/media',
    disableLocalStorage: false,
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
```

### Task 1.11: Posts Collection

**File:** `src/collections/Posts.ts`

- [ ] **Step 1: Create Posts collection**

```ts
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'status', 'category', 'author', 'publishedAt'],
  },
  versions: {
    drafts: {
      autosave: true,
    },
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
```

### Task 1.12: Pages Collection

**File:** `src/collections/Pages.ts`

- [ ] **Step 1: Create Pages collection**

```ts
import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
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
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
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
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
  ],
}
```

### Task 1.13: Redirects Collection

**File:** `src/collections/Redirects.ts`

- [ ] **Step 1: Create Redirects collection**

```ts
import type { CollectionConfig } from 'payload'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: {
    group: 'Admin',
  },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
    },
    {
      name: 'to',
      type: 'text',
      required: true,
    },
    {
      name: 'statusCode',
      type: 'select',
      required: true,
      defaultValue: '301',
      options: [
        { label: '301 (Permanent)', value: '301' },
        { label: '302 (Temporary)', value: '302' },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
```

### Task 1.14: Settings Global

**File:** `src/collections/Settings.ts`

- [ ] **Step 1: Create Settings global**

```ts
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
```

### Task 1.15: Verify Collections

- [ ] **Step 1: Start dev server and verify collections exist in Payload admin**

Run: `npm run dev`

- [ ] **Step 2: Check admin panel at http://localhost:3000/admin**

Expected: All 9 collections appear in the admin sidebar under groups "Content" and "Admin"
- Content: Posts, Authors, Categories, Tags, Media, Pages
- Admin: Users, Redirects, Settings (Global)

- [ ] **Step 3: Verify TypeScript types are auto-generated**

Run: Check `src/payload-types.ts` exists and contains type definitions for all collections

Expected: File generated with all collection types
