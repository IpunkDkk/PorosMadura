'use client'

import { useEffect, useState } from 'react'
import { getMediaUrl } from '@/lib/media'

interface PopupAdData {
  id: number | string
  title: string
  imageDesktop: Record<string, unknown> | null
  targetUrl: string
}

export default function PopupCampaign() {
  const [ad, setAd] = useState<PopupAdData | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Cek local storage agar tidak muncul tiap refresh
    const dismissedAt = localStorage.getItem('popup_dismissed')
    if (dismissedAt) {
      const elapsed = Date.now() - Number(dismissedAt)
      if (elapsed < 86400000) { // 24 jam
        setDismissed(true)
        return
      }
    }

    fetch('/api/ads-data?placement=popup_campaign')
      .then((res) => res.json())
      .then((data) => {
        if (data.type === 'manual') {
          setAd({
            id: data.id,
            title: data.title,
            imageDesktop: data.imageDesktop,
            targetUrl: data.targetUrl,
          })
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!ad || dismissed) return
    // Muncul setelah 5 detik
    const timer = setTimeout(() => setVisible(true), 5000)
    return () => clearTimeout(timer)
  }, [ad, dismissed])

  const handleClose = () => {
    setVisible(false)
    setDismissed(true)
    localStorage.setItem('popup_dismissed', String(Date.now()))
  }

  if (!visible || !ad) return null

  const imageUrl = ad.imageDesktop
    ? getMediaUrl(ad.imageDesktop)
    : null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-gray-700 text-lg font-bold"
          aria-label="Tutup"
        >
          ✕
        </button>

        <a
          href={ad.targetUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={ad.title || 'Promo'}
              className="w-full h-auto rounded-lg"
            />
          ) : (
            <div className="bg-poros-navy text-white p-8 rounded-lg text-center">
              <h3 className="font-heading text-xl font-bold mb-2">{ad.title}</h3>
              <p className="text-sm opacity-80">Klik untuk detail</p>
            </div>
          )}
        </a>
      </div>
    </div>
  )
}
