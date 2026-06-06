# PorosMadura Phase 2 — CMS Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Editorial workflow (draft → review → publish), role-based access control, slug generation, auto-redirect on slug change

### Task 2.1: Editorial Workflow (Status Transitions)

**Files:**
- Modify: `src/collections/Posts.ts`

- [ ] **Step 1: Add status validation to Posts collection**

Add a `beforeChange` hook to validate status transitions:

```ts
// src/hooks/validateStatusTransition.ts
import type { FieldHook } from 'payload'

export const validateStatusTransition: FieldHook = ({ value, originalDoc, siblingData }) => {
  const currentStatus = originalDoc?.status
  const newStatus = siblingData?.status

  const allowedTransitions: Record<string, string[]> = {
    draft: ['review', 'archived'],
    review: ['draft', 'published', 'scheduled', 'archived'],
    scheduled: ['published', 'draft', 'archived'],
    published: ['archived', 'draft'],
    archived: ['draft'],
  }

  if (currentStatus && newStatus && currentStatus !== newStatus) {
    const allowed = allowedTransitions[currentStatus] || []
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Status transition "${currentStatus}" → "${newStatus}" is not allowed. ` +
        `Allowed transitions from "${currentStatus}": ${allowed.join(', ')}`
      )
    }
  }

  return value
}
```

- [ ] **Step 2: Apply hook to Posts collection status field**

In `src/collections/Posts.ts`, add the hook to the status field:

```ts
{
  name: 'status',
  type: 'select',
  required: true,
  defaultValue: 'draft',
  hooks: {
    beforeChange: [validateStatusTransition],
  },
  options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Review', value: 'review' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Published', value: 'published' },
    { label: 'Archived', value: 'archived' },
  ],
}
```

### Task 2.2: Role-Based Access Control

**Files:**
- Create: `src/hooks/accessControl.ts`
- Modify: `src/collections/Posts.ts` (add access control)

- [ ] **Step 1: Create role-based access helpers**

```ts
// src/hooks/accessControl.ts
import type { Access } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === 'admin'
}

export const isAdminOrEditor: Access = ({ req: { user } }) => {
  return user?.role === 'admin' || user?.role === 'editor'
}

export const isAdminOrEditorOrAuthor: Access = ({ req: { user } }) => {
  return user?.role === 'admin' || user?.role === 'editor' || user?.role === 'author'
}

export const canReadAny: Access = () => true

export const isLoggedIn: Access = ({ req: { user } }) => {
  return !!user
}
```

- [ ] **Step 2: Add access control to Posts collection**

In `src/collections/Posts.ts`, add access property:

```ts
import { isAdmin, isAdminOrEditor, isAdminOrEditorOrAuthor, canReadAny, isLoggedIn } from '@/hooks/accessControl'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    create: isAdminOrEditorOrAuthor,
    read: canReadAny, // Public reading via API; frontend filters by status
    update: isAdminOrEditorOrAuthor,
    delete: isAdminOrEditor,
  },
  // ... rest of collection
}
```

- [ ] **Step 3: Add access control to other collections**

Apply similarly to Categories, Tags, Authors, Media, Pages, Redirects:

```ts
export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: isAdminOrEditor,
    read: canReadAny,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  // ...
}
```

- [ ] **Step 4: Add admin-only access to Users and Settings**

```ts
// Users
access: {
  create: isAdmin,
  read: isAdmin,
  update: isAdmin,
  delete: isAdmin,
}

// Settings (global)
access: {
  read: isAdminOrEditor,
  update: isAdmin,
}
```

### Task 2.3: Slug Generation + Auto-Redirect

**Files:**
- Create: `src/hooks/generateSlug.ts`
- Create: `src/hooks/createRedirectOnSlugChange.ts`

- [ ] **Step 1: Create slug generator hook**

```ts
// src/hooks/generateSlug.ts
import type { FieldHook } from 'payload'

export const generateSlug: FieldHook = ({ value, siblingData, operation }) => {
  // Auto-generate from title if slug is empty during create
  if ((!value || value === '') && siblingData?.title && operation === 'create') {
    return siblingData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-')     // Spaces to dashes
      .replace(/-+/g, '-')      // Collapse multiple dashes
      .trim()
  }
  return value
}
```

- [ ] **Step 2: Create redirect hook**

```ts
// src/hooks/createRedirectOnSlugChange.ts
import type { CollectionAfterChangeHook } from 'payload'

export const createRedirectOnSlugChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  if (operation === 'update' && previousDoc?.slug && doc?.slug) {
    // Check if slug actually changed
    if (previousDoc.slug !== doc.slug) {
      const { slug: collectionSlug } = req.collection || { slug: 'unknown' }

      // Build old and new URLs
      let fromPath = ''
      let toPath = ''

      if (collectionSlug === 'posts') {
        const categorySlug = doc.category?.slug || doc.category
        fromPath = `/${previousDoc.categorySlug || ':category'}/${previousDoc.slug}`
        toPath = `/${doc.category?.slug || ':category'}/${doc.slug}`
      } else {
        fromPath = `/${collectionSlug === 'pages' ? '' : collectionSlug + '/'}${previousDoc.slug}`
        toPath = `/${collectionSlug === 'pages' ? '' : collectionSlug + '/'}${doc.slug}`
      }

      // Create redirect via Payload API
      try {
        await req.payload.create({
          collection: 'redirects',
          data: {
            from: fromPath,
            to: toPath,
            statusCode: '301',
            isActive: true,
          },
          req,
        })
      } catch (err) {
        console.error('Failed to create redirect:', err)
      }
    }
  }

  return doc
}
```

- [ ] **Step 3: Apply hooks to Posts collection**

In `src/collections/Posts.ts`:

```ts
import { generateSlug } from '@/hooks/generateSlug'
import { createRedirectOnSlugChange } from '@/hooks/createRedirectOnSlugChange'

export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    afterChange: [createRedirectOnSlugChange],
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [generateSlug],
      },
    },
    // ... other fields
  ],
}
```

- [ ] **Step 4: Verify workflow**

Run: `npm run dev`

Expected:
1. Create a post as Author → status shows "draft"
2. Submit to review → status changes to "review"
3. Login as Editor → can see post in review
4. Publish post → status changes to "published"
5. Edit slug → redirect 301 auto-created
6. Login as Author → cannot publish directly
