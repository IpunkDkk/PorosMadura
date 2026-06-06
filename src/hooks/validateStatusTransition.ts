import type { FieldHook } from 'payload'

export const validateStatusTransition: FieldHook = ({ value, originalDoc, siblingData }) => {
  const currentStatus = originalDoc?.status as string | undefined
  const newStatus = siblingData?.status as string | undefined

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
