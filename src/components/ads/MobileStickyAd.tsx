'use client'

import { useEffect, useState } from 'react'
import AdSlot from './AdSlot'

export default function MobileStickyAd() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Tampilkan sticky ad setelah user scroll > 1000px
    // dan hanya di mobile
    const handler = () => {
      if (window.innerWidth < 768 && window.scrollY > 1000) {
        setShow(true)
      }
    }
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-lg">
      <button
        onClick={() => setShow(false)}
        className="absolute -top-6 right-2 bg-white border border-gray-200 rounded-t px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700"
        aria-label="Tutup iklan"
      >
        ✕ Tutup
      </button>
      <AdSlot placement="mobile_sticky_bottom" />
    </div>
  )
}
