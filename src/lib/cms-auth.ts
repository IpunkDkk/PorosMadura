import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { authUsers, users } from '@/db/schema'
import { auth } from '@/auth/better-auth'

const HASH_ITERATIONS = 120000
const HASH_KEYLEN = 32
const HASH_DIGEST = 'sha256'

export type CmsRole = 'admin' | 'editor' | 'author' | 'viewer'

export type CmsSession = {
  id: number
  email: string
  role: CmsRole
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

function isCmsRole(value: string | null | undefined): value is CmsRole {
  if (!value) return false
  return ['admin', 'editor', 'author', 'viewer'].includes(value)
}

export function hashCmsPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST).toString('hex')
  return {
    salt,
    hash: `pbkdf2:${HASH_ITERATIONS}:${HASH_DIGEST}:${hash}`,
  }
}

function verifyCmsPassword(password: string, salt: string | null, storedHash: string | null) {
  if (!salt || !storedHash) return false

  const [, iterationsRaw, digest, hash] = storedHash.split(':')
  const iterations = Number(iterationsRaw)
  if (!storedHash.startsWith('pbkdf2:') || !Number.isFinite(iterations) || !digest || !hash) return false

  const candidate = pbkdf2Sync(password, salt, iterations, Buffer.from(hash, 'hex').length, digest).toString('hex')
  return safeEqual(candidate, hash)
}

function readSetCookieHeaders(response: Response) {
  const maybeHeaders = response.headers as Headers & { getSetCookie?: () => string[] }
  const cookies = maybeHeaders.getSetCookie?.()
  if (cookies?.length) return cookies

  const header = response.headers.get('set-cookie')
  return header ? [header] : []
}

function parseSetCookie(header: string) {
  const [nameValue, ...attributeParts] = header.split(';')
  const separatorIndex = nameValue.indexOf('=')
  if (separatorIndex === -1) return null

  const name = nameValue.slice(0, separatorIndex).trim()
  const rawValue = nameValue.slice(separatorIndex + 1).trim()
  const value = decodeURIComponent(rawValue)
  const options: Parameters<Awaited<ReturnType<typeof cookies>>['set']>[2] = {}

  for (const part of attributeParts) {
    const [rawKey, ...rawValue] = part.trim().split('=')
    const key = rawKey.toLowerCase()
    const attrValue = rawValue.join('=')

    if (key === 'httponly') options.httpOnly = true
    if (key === 'secure') options.secure = true
    if (key === 'path') options.path = attrValue
    if (key === 'max-age') options.maxAge = Number(attrValue)
    if (key === 'expires') options.expires = new Date(attrValue)
    if (key === 'samesite') {
      const sameSite = attrValue.toLowerCase()
      if (['lax', 'strict', 'none'].includes(sameSite)) {
        options.sameSite = sameSite as 'lax' | 'strict' | 'none'
      }
    }
  }

  return { name, value, options }
}

async function applySetCookieHeaders(response: Response) {
  const cookieStore = await cookies()
  for (const header of readSetCookieHeaders(response)) {
    const parsed = parseSetCookie(header)
    if (parsed) cookieStore.set(parsed.name, parsed.value, parsed.options)
  }
}

export async function syncCmsBetterAuthUser(input: { name: string; email: string; password: string }) {
  const email = input.email.toLowerCase()
  const existingAuthUser = await db.query.authUsers.findFirst({
    where: eq(authUsers.email, email),
  })

  if (existingAuthUser) {
    await db.delete(authUsers).where(eq(authUsers.id, existingAuthUser.id))
  }

  await auth.api.signUpEmail({
    body: {
      name: input.name,
      email,
      password: input.password,
    },
  })
}

export async function hasCmsAccess() {
  return Boolean(await getCmsSession())
}

export async function getCmsSession(): Promise<CmsSession | null> {
  const authSession = await auth.api.getSession({
    headers: await headers(),
  })

  if (authSession?.user?.email) {
    const cmsUser = await db.query.users.findFirst({
      where: eq(users.email, authSession.user.email.toLowerCase()),
    })

    if (cmsUser && cmsUser.isActive !== false && isCmsRole(cmsUser.role)) {
      return {
        id: cmsUser.id,
        email: cmsUser.email,
        role: cmsUser.role,
      }
    }
  }

  return null
}

export async function requireCmsAccess() {
  if (await hasCmsAccess()) return
  redirect('/cms/login')
}

export async function assertCmsAccess() {
  if (await getCmsSession()) return
  redirect('/cms/login')
}

export async function requireCmsRole(roles: CmsRole[]) {
  const session = await getCmsSession()
  if (!session) redirect('/cms/login')
  if (!roles.includes(session.role)) redirect('/cms')
  return session
}

export async function loginCmsUser(email: string, password: string) {
  const cmsUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (!cmsUser || cmsUser.isActive === false || !isCmsRole(cmsUser.role)) return false

  let response = await auth.api.signInEmail({
    body: {
      email,
      password,
      rememberMe: true,
    },
    headers: await headers(),
    asResponse: true,
  })

  if (!response.ok && verifyCmsPassword(password, cmsUser.salt || null, cmsUser.hash || null)) {
    try {
      await syncCmsBetterAuthUser({ name: cmsUser.name, email, password })
    } catch {
      /* Keep the login response authoritative if Better Auth cannot be synced. */
    }

    response = await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe: true,
      },
      headers: await headers(),
      asResponse: true,
    })
  }

  if (!response.ok) return false

  await applySetCookieHeaders(response)
  await db.update(users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, cmsUser.id))

  return true
}

export async function logoutCms() {
  const response = await auth.api.signOut({
    headers: await headers(),
    asResponse: true,
  })
  await applySetCookieHeaders(response)
}
