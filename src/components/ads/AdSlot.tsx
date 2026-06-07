'use client'

import { useEffect, useRef, useState } from 'react'
import { getMediaUrl } from '@/lib/media'

interface AdResult {
  type: 'manual' | 'fallback' | 'empty'
  id?: string | number
  title?: string
  imageDesktop?: { url?: string } | null
  imageMobile?: { url?: string } | null
  targetUrl?: string
  provider?: string
  code?: string
  placement?: string
}

interface AdSlotProps {
  placement: string
  className?: string
}

const PLACEMENT_DIMENSIONS: Record<string, { h: number }> = {
  home_top_banner: { h: 250 },
  home_middle_banner: { h: 90 },
  home_sidebar_top: { h: 250 },
  home_sidebar_bottom: { h: 600 },
  article_top: { h: 90 },
  article_middle: { h: 90 },
  article_bottom: { h: 90 },
  article_sidebar: { h: 250 },
  category_top: { h: 250 },
  category_sidebar: { h: 250 },
  mobile_sticky_bottom: { h: 50 },
  mobile_article_middle: { h: 100 },
  popup_campaign: { h: 400 },
}

export default function AdSlot({ placement, className = '' }: AdSlotProps) {
  const [ad, setAd] = useState<AdResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const impressionSent = useRef(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)

    fetch(`/api/ads-data?placement=${encodeURIComponent(placement)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load ad')
        return res.json()
      })
      .then((data: AdResult) => {
        setAd(data)
        setLoading(false)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(true)
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [placement])

  useEffect(() => {
    if (ad?.type !== 'manual' || impressionSent.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impressionSent.current) {
            impressionSent.current = true
            fetch(`/api/ads-data/${ad.id}/impression`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ placement, pageUrl: window.location.href }),
            }).catch(() => {})
          }
        })
      },
      { threshold: 0.5 },
    )

    const el = imgRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [ad, placement])

  if (loading) {
    const height = PLACEMENT_DIMENSIONS[placement]?.h || 90
    return (
      <div
        className={`bg-gray-100 animate-pulse rounded-lg ${className}`}
        style={{ height, width: '100%' }}
        role="status"
        aria-label="Memuat iklan"
      />
    )
  }

  if (error || !ad) return null

  if (ad.type === 'empty') return null

  if (ad.type === 'fallback') {
    return (
      <div
        className={`ad-fallback ${className}`}
        dangerouslySetInnerHTML={{ __html: ad.code || '' }}
      />
    )
  }

  return (
    <div ref={imgRef} className={`ad-manual ${className}`}>
      <a
        href={ad.targetUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <picture>
          {ad.imageDesktop && (
            <source
              media="(min-width: 768px)"
              srcSet={getMediaUrl(ad.imageDesktop as Record<string, unknown>)}
            />
          )}
          <img
            src={getMediaUrl(
              (ad.imageMobile || ad.imageDesktop) as Record<string, unknown>,
            )}
            alt={ad.title || 'Iklan'}
            className="w-full h-auto"
            loading="lazy"
          />
        </picture>
      </a>
    </div>
  )
}
