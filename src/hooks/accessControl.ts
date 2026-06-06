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
