/* tslint:disable */
/* eslint-disable */
/**
 * Payload types for PorosMadura
 */

export interface Post {
  id: number
  title: string
  slug: string
  excerpt?: string | null
  content?: unknown
  featuredImage?: unknown
  category?: number | Category | null
  tags?: (number | Tag)[] | null
  author?: number | Author | null
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived'
  publishedAt?: string | null
  scheduledAt?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  canonicalUrl?: string | null
  ogImage?: unknown
  isFeatured?: boolean | null
  isBreakingNews?: boolean | null
  allowIndex?: boolean | null
  sourceName?: string | null
  sourceUrl?: string | null
  readingTime?: number | null
  views?: number | null
  updatedAt?: string | null
  createdAt?: string | null
  [key: string]: unknown
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string | null
  parent?: number | Category | null
  seoTitle?: string | null
  seoDescription?: string | null
  order?: number | null | undefined
  isActive?: boolean | null
  [key: string]: unknown
}

export interface Tag {
  id: number
  name: string
  slug: string
  description?: string | null
  isActive?: boolean | null
  [key: string]: unknown
}

export interface Author {
  id: number
  name: string
  slug: string
  bio?: string | null
  avatar?: unknown
  email?: string | null
  socialLinks?: {
    facebook?: string | null
    twitter?: string | null
    instagram?: string | null
  }
  user?: number | null
  isActive?: boolean | null
  [key: string]: unknown
}

export interface User {
  id: number
  name: string
  role: 'admin' | 'editor' | 'author' | 'viewer'
  avatar?: unknown
  isActive?: boolean | null
  lastLoginAt?: string | null
  email: string
  [key: string]: unknown
}
