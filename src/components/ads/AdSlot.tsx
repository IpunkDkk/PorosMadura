'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
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

const PLACEMENT_DIMENSIONS: Record<string, { w?: number; h: number }> = {
  header_banner: { h: 90 },
  home_skyscraper_left: { w: 160, h: 600 },
  home_skyscraper_right: { w: 160, h: 600 },
  home_top_banner: { h: 250 },
  home_before_latest: { h: 90 },
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
  home_horizontal_ad: { h: 90 },
}

export default function AdSlot({ placement, className = '' }: AdSlotProps) {
  const [adState, setAdState] = useState<{
    placement: string
    ad: AdResult | null
    loading: boolean
    error: boolean
  }>({
    placement,
    ad: null,
    loading: true,
    error: false,
  })
  const impressionSent = useRef(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch(`/api/ads-data?placement=${encodeURIComponent(placement)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load ad')
        return res.json()
      })
      .then((data: AdResult) => {
        setAdState({
          placement,
          ad: data,
          loading: false,
          error: false,
        })
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setAdState({
            placement,
            ad: null,
            loading: false,
            error: true,
          })
        }
      })

    return () => controller.abort()
  }, [placement])

  const loading = adState.placement !== placement || adState.loading
  const error = adState.placement === placement && adState.error
  const ad = adState.placement === placement ? adState.ad : null

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
    const dims = PLACEMENT_DIMENSIONS[placement]
    const height = dims?.h || 90
    const width = dims?.w || '100%'
    return (
      <div
        className={`bg-gray-100 animate-pulse rounded-lg ${className}`}
        style={{ height, width: typeof width === 'number' ? width : width }}
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

  const desktopImageUrl = ad.imageDesktop
    ? getMediaUrl(ad.imageDesktop as Record<string, unknown>)
    : ''
  const mobileImageUrl = getMediaUrl(
    (ad.imageMobile || ad.imageDesktop) as Record<string, unknown>,
  )

  return (
    <div ref={imgRef} className={`ad-manual ${className}`}>
      <a
        href={ad.targetUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {ad.imageMobile && ad.imageDesktop ? (
          <>
            <Image
              src={desktopImageUrl}
              alt={ad.title || 'Iklan'}
              width={970}
              height={250}
              sizes="(min-width: 768px) 100vw, 0vw"
              className="hidden h-auto w-full md:block"
            />
            <Image
              src={mobileImageUrl}
              alt={ad.title || 'Iklan'}
              width={640}
              height={320}
              sizes="(min-width: 768px) 0vw, 100vw"
              className="h-auto w-full md:hidden"
            />
          </>
        ) : (
          <Image
            src={mobileImageUrl}
            alt={ad.title || 'Iklan'}
            width={970}
            height={250}
            sizes="100vw"
            className="h-auto w-full"
          />
        )}
      </a>
    </div>
  )
}
