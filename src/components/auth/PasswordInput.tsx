'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  name?: string
  placeholder?: string
  required?: boolean
  className?: string
}

export default function PasswordInput({
  name = 'password',
  placeholder = '••••••••',
  required = true,
  className = '',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = showPassword ? 'text' : 'password'

  return (
    <div className={`relative ${className}`}>
      <input
        type={inputType}
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete="current-password"
        className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poros-red focus:border-transparent outline-none"
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
        tabIndex={-1}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  )
}
