export const PORTAL_TIME_ZONE = 'Asia/Jakarta'

function parseDateValue(value: unknown): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatPortalDate(
  value: unknown,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
): string {
  const date = parseDateValue(value)
  if (!date) return ''

  return date.toLocaleDateString('id-ID', {
    timeZone: PORTAL_TIME_ZONE,
    ...options,
  })
}

export function formatPortalLongDate(value: unknown): string {
  return formatPortalDate(value, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatPortalShortDate(value: unknown): string {
  return formatPortalDate(value, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatPortalDateTime(value: unknown): string {
  const date = parseDateValue(value)
  if (!date) return ''

  return date.toLocaleString('id-ID', {
    timeZone: PORTAL_TIME_ZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function formatPortalTime(value: unknown): string {
  const date = parseDateValue(value)
  if (!date) return ''

  return date.toLocaleTimeString('id-ID', {
    timeZone: PORTAL_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(value: unknown): string {
  const date = parseDateValue(value)
  if (!date) return ''

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'Baru saja'
  if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`
  if (diffHours < 24) return `${diffHours} jam yang lalu`
  if (diffDays < 7) return `${diffDays} hari yang lalu`
  return formatPortalShortDate(date)
}

export function formatDatetimeLocalValue(value: unknown): string {
  const date = parseDateValue(value)
  if (!date) return ''

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: PORTAL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const partValue = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || ''

  return `${partValue('year')}-${partValue('month')}-${partValue('day')}T${partValue('hour')}:${partValue('minute')}`
}
