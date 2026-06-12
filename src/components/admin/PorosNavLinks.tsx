import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export default function PorosNavLinks() {
  return (
    <div className="poros-nav-link px-4 py-2">
      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm font-medium text-poros-red hover:text-red-700 transition-colors"
      >
        <ExternalLink size={16} />
        Lihat Website
      </Link>
    </div>
  )
}
