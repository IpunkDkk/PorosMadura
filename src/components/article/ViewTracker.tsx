'use client'

import { useEffect } from 'react'

type ViewTrackerProps = {
  postId: number | string
}

const VIEW_TTL_MS = 30 * 60 * 1000

export function ViewTracker({ postId }: ViewTrackerProps) {
  useEffect(() => {
    const key = `porosmadura:viewed:${postId}`
    const now = Date.now()
    const lastViewed = Number(window.localStorage.getItem(key) || '0')

    if (Number.isFinite(lastViewed) && now - lastViewed < VIEW_TTL_MS) return

    window.localStorage.setItem(key, String(now))

    fetch(`/api/posts/${postId}/view`, {
      method: 'POST',
      keepalive: true,
    }).catch(() => {
      window.localStorage.removeItem(key)
    })
  }, [postId])

  return null
}
