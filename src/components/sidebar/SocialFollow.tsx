import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

export function SocialFollow() {
  return (
    <div className="bg-gradient-to-br from-poros-navy to-[#1c3e6b] text-white p-8 rounded-2xl shadow-md text-center relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-poros-red opacity-20 rounded-full -ml-10 -mb-10" />

      <h3 className="font-heading text-2xl font-black mb-3 relative z-10">
        Ikuti Kami
      </h3>
      <p className="text-sm text-gray-200 mb-8 relative z-10 font-medium">
        Jangan lewatkan update berita terkini, akurat, dan terpercaya dari
        PorosMadura.
      </p>
      <div className="flex justify-center gap-3 relative z-10">
        <a
          href="https://facebook.com/porosmadura"
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-poros-red hover:scale-110 transition-all"
          aria-label="Facebook"
        >
          <Facebook size={20} />
        </a>
        <a
          href="https://twitter.com/porosmadura"
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-poros-red hover:scale-110 transition-all"
          aria-label="Twitter"
        >
          <Twitter size={20} />
        </a>
        <a
          href="https://instagram.com/porosmadura"
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-poros-red hover:scale-110 transition-all"
          aria-label="Instagram"
        >
          <Instagram size={20} />
        </a>
        <a
          href="https://youtube.com/@porosmadura"
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-poros-red hover:scale-110 transition-all"
          aria-label="Youtube"
        >
          <Youtube size={20} />
        </a>
      </div>
    </div>
  )
}
