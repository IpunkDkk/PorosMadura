import type { FieldHook } from 'payload'

export const generateSlug: FieldHook = ({ value, siblingData, operation }) => {
  if ((!value || value === '') && siblingData?.title && operation === 'create') {
    return (siblingData.title as string)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
  return value
}
