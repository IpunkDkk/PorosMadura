'use client'

import { useEffect } from 'react'

/**
 * Menambahkan toggle (ikon mata) ke semua input password
 * di halaman admin Payload, termasuk create-first-user.
 */
export default function PasswordToggleEnhancer() {
  useEffect(() => {
    function addToggles() {
      document.querySelectorAll<HTMLInputElement>('input[type="password"]').forEach((input) => {
        // Skip kalo udah ada toggle
        const wrapper = input.parentElement
        if (wrapper?.querySelector('[data-pw-toggle]')) return

        // Bungkus input + toggle
        const container = document.createElement('div')
        container.className = 'relative'
        input.parentNode?.insertBefore(container, input)
        container.appendChild(input)

        // Tambahin class biar styling cocok
        input.classList.add('pr-10')

        // Tombol toggle
        const btn = document.createElement('button')
        btn.setAttribute('data-pw-toggle', '')
        btn.type = 'button'
        btn.className =
          'absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors'
        btn.setAttribute('aria-label', 'Tampilkan password')
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pw-eye-icon">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        `
        container.appendChild(btn)

        let visible = false
        btn.addEventListener('click', () => {
          visible = !visible
          input.type = visible ? 'text' : 'password'
          btn.setAttribute('aria-label', visible ? 'Sembunyikan password' : 'Tampilkan password')
          btn.innerHTML = visible
            ? `
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pw-eye-icon">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                <line x1="2" x2="22" y1="2" y2="22"/>
              </svg>
            `
            : `
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pw-eye-icon">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            `
        })
      })
    }

    // Tunggu render
    const id = setInterval(() => {
      const pwFields = document.querySelectorAll<HTMLInputElement>('input[type="password"]')
      const alreadyDone = document.querySelector('[data-pw-toggle]')
      if (pwFields.length > 0 && !alreadyDone) {
        addToggles()
      }
    }, 500)

    return () => clearInterval(id)
  }, [])

  return null
}
