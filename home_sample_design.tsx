import React, { useState } from 'react';
import { Menu, Search, X, Clock, User, Facebook, Twitter, Instagram, Youtube, ChevronRight, TrendingUp } from 'lucide-react';

// --- MOCK DATA ---
const breakingNews = "Pemkab Pamekasan Luncurkan Program Beasiswa Santri 2026, Pendaftaran Dibuka Bulan Depan!";

const heroNews = [
  {
    id: 1,
    title: "Jembatan Suramadu Akan Ditambah Jalur Khusus Logistik untuk Dorong Ekonomi Madura",
    category: "Daerah",
    author: "Ahmad Fauzi",
    publishedAt: "2 Jam yang lalu",
    imageUrl: "https://images.unsplash.com/photo-1583307812586-2a74c2df9e51?auto=format&fit=crop&q=80&w=1280",
  },
  {
    id: 2,
    title: "Menjelang Pilkada, Suhu Politik di Bangkalan Mulai Memanas",
    category: "Politik",
    author: "Budi Santoso",
    publishedAt: "3 Jam yang lalu",
    imageUrl: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "Harga Garam Anjlok, Petani Garam Sampang Menjerit Minta Solusi",
    category: "Ekonomi",
    author: "Siti Aminah",
    publishedAt: "5 Jam yang lalu",
    imageUrl: "https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&q=80&w=800",
  }
];

const latestNews = [
  {
    id: 4,
    title: "Madura United Targetkan Poin Penuh di Kandang Lawan Usai Latihan Intensif",
    excerpt: "Pelatih Madura United optimis skuadnya bisa mencuri poin penuh pada laga tandang akhir pekan ini setelah mengevaluasi strategi formasi.",
    category: "Olahraga",
    author: "Hendra Gunawan",
    publishedAt: "6 Jam yang lalu",
    imageUrl: "https://images.unsplash.com/photo-1518605368461-1e12d1ce2580?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 5,
    title: "Festival Karapan Sapi Digelar Megah Tahun Ini, Wisatawan Asing Mulai Berdatangan",
    excerpt: "Tradisi tahunan Karapan Sapi kembali digelar dengan jumlah peserta yang membludak dari seluruh penjuru pulau.",
    category: "Budaya",
    author: "Zainal Abidin",
    publishedAt: "8 Jam yang lalu",
    imageUrl: "https://images.unsplash.com/photo-1523485724103-623e167907f9?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 6,
    title: "Inovasi Pemuda Pamekasan Ciptakan Aplikasi Pemasaran Batik Tembus Pasar Eropa",
    excerpt: "Sebuah startup lokal berhasil membawa karya pengrajin batik Madura untuk dipasarkan secara internasional melalui platform digital.",
    category: "Teknologi",
    author: "Rina Kumala",
    publishedAt: "10 Jam yang lalu",
    imageUrl: "https://images.unsplash.com/photo-1531297172867-4d6537f05241?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 7,
    title: "Cuaca Ekstrem Melanda Perairan Utara, Nelayan Diminta Tunda Melaut",
    excerpt: "BMKG mengeluarkan peringatan dini terkait gelombang tinggi yang berpotensi membahayakan kapal-kapal kecil di perairan utara.",
    category: "Daerah",
    author: "Fajar Siddiq",
    publishedAt: "12 Jam yang lalu",
    imageUrl: "https://images.unsplash.com/photo-1505672678657-cc70370f5e60?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 8,
    title: "Rekomendasi Kuliner Bebek Sinjay yang Melegenda, Wajib Mampir Kalau ke Bangkalan!",
    excerpt: "Membahas tuntas rahasia sambal pencit dan kelezatan Bebek Sinjay yang selalu membuat pengunjung rela antre panjang.",
    category: "Lifestyle",
    author: "Ayu Lestari",
    publishedAt: "14 Jam yang lalu",
    imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=600",
  }
];

const popularNews = [
  { id: 9, title: "KPU Sumenep Pastikan Logistik Pemilu Aman Terkendali Hingga Pelosok Pulau", category: "Politik" },
  { id: 10, title: "Viral! Video Pelajar Pamekasan Temukan Fosil Berusia Ratusan Tahun", category: "Viral" },
  { id: 11, title: "Investor Asing Mulai Lirik Potensi Pariwisata Gili Iyang yang Memiliki Oksigen Terbaik", category: "Ekonomi" },
  { id: 12, title: "Mengenal Sejarah Kesenian Saronen yang Sempat Hampir Punah", category: "Budaya" },
  { id: 13, title: "Jadwal Lengkap Kapal Feri Penyeberangan Kalianget - Talango Minggu Ini", category: "Info Publik" },
];

const categories = ["Nasional", "Madura", "Politik", "Ekonomi", "Olahraga", "Teknologi", "Lifestyle", "Budaya", "Viral"];

// --- COMPONENTS ---

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#111827]">
      {/* Inject Fonts */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:ital,wght@0,400;0,700;0,900;1,400&display=swap');
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-serif { font-family: 'Merriweather', serif; }
      `}} />

      {/* HEADER SECTION */}
      <header className="w-full bg-[#0C2A51] text-white">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Top Bar (Navy) */}
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex flex-col">
              <a href="#" className="flex items-center gap-1 group">
                <span className="bg-[#C61E21] text-white font-serif font-bold text-2xl w-8 h-8 flex items-center justify-center rounded">P</span>
                <h1 className="font-serif font-black text-2xl tracking-tight">
                  Poros<span className="font-normal text-white/90">Madura</span>
                </h1>
              </a>
              <span className="text-[10px] text-white/70 tracking-widest mt-0.5 uppercase hidden md:block font-medium">Berita Tepat, Fakta Kuat</span>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-6">
              <span className="text-sm text-white/80 font-medium">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <div className="h-4 w-px bg-white/20"></div>
              <button className="hover:text-[#C61E21] transition-colors"><Search size={20} /></button>
              <button className="bg-[#C61E21] hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Login / Daftar
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="lg:hidden flex items-center gap-4">
              <button className="hover:text-[#C61E21]"><Search size={22} /></button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
                {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Category Bar (White - IDN Times style) */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center py-3 overflow-x-auto hide-scrollbar gap-6">
            <a href="#" className="text-sm font-bold text-[#C61E21] whitespace-nowrap">HOME</a>
            <a href="#" className="text-sm font-bold text-[#0C2A51] whitespace-nowrap flex items-center gap-1">
              <TrendingUp size={16} className="text-[#C61E21]" /> TRENDING
            </a>
            {categories.map((cat, idx) => (
              <a key={idx} href="#" className="text-sm font-semibold text-gray-600 hover:text-[#C61E21] transition-colors whitespace-nowrap">
                {cat.toUpperCase()}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[120px] bg-white z-50 overflow-y-auto border-t border-gray-100 p-4 shadow-xl">
          <nav className="flex flex-col gap-4">
             <button className="bg-[#0C2A51] text-white py-3 rounded-xl font-bold w-full mb-2">Login / Daftar</button>
            {categories.map((cat, idx) => (
              <a key={idx} href="#" className="py-2 border-b border-gray-100 text-base font-bold text-gray-800 hover:text-[#C61E21]">
                {cat}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* BREAKING NEWS TICKER */}
      <div className="bg-[#C61E21] text-white text-sm py-2">
        <div className="container mx-auto px-4 lg:px-8 flex items-center">
          <span className="font-bold uppercase tracking-wider mr-4 whitespace-nowrap bg-white text-[#C61E21] px-2 py-0.5 rounded text-xs animate-pulse">Breaking News</span>
          <p className="truncate hover:underline cursor-pointer font-medium">{breakingNews}</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        
        {/* HERO SECTION (IDN Times Grid Style) */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Main Hero (Left - Span 2) */}
            <div className="lg:col-span-2 relative group cursor-pointer overflow-hidden rounded-2xl bg-black">
              <div className="aspect-[4/3] lg:aspect-[16/9] relative">
                <img 
                  src={heroNews[0].imageUrl} 
                  alt={heroNews[0].title} 
                  className="object-cover w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-700 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 text-white z-10">
                <span className="bg-[#C61E21] text-white text-xs font-bold uppercase px-3 py-1 rounded mb-3 inline-block">
                  {heroNews[0].category}
                </span>
                <h2 className="font-serif text-2xl md:text-4xl font-bold leading-tight mb-3 drop-shadow-md">
                  {heroNews[0].title}
                </h2>
                <div className="flex items-center text-gray-200 text-xs md:text-sm gap-4 font-medium">
                  <span className="flex items-center gap-1.5"><User size={14} /> {heroNews[0].author}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} /> {heroNews[0].publishedAt}</span>
                </div>
              </div>
            </div>

            {/* Sub Hero (Right - Stacked 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {heroNews.slice(1).map((news) => (
                <div key={news.id} className="relative group cursor-pointer overflow-hidden rounded-2xl bg-black h-full sm:aspect-[4/3] lg:aspect-auto">
                  <div className="absolute inset-0 h-full w-full">
                    <img 
                      src={news.imageUrl} 
                      alt={news.title} 
                      className="object-cover w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-700 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full p-5 text-white z-10">
                    <span className="bg-[#0C2A51] text-white text-[10px] font-bold uppercase px-2 py-1 rounded mb-2 inline-block">
                      {news.category}
                    </span>
                    <h2 className="font-serif text-lg md:text-xl font-bold leading-snug drop-shadow-md line-clamp-3">
                      {news.title}
                    </h2>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN (Latest News List - IDN Times Feed Style) - 8 cols */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6 border-b-2 border-gray-200 pb-3">
              <h3 className="font-serif text-2xl font-black text-[#0C2A51]">
                Berita <span className="text-[#C61E21]">Terbaru</span>
              </h3>
            </div>

            <div className="flex flex-col gap-6">
              {latestNews.map((news) => (
                <article key={news.id} className="group flex flex-col sm:flex-row gap-5 items-start cursor-pointer border-b border-gray-100 pb-6 last:border-0">
                  {/* Image */}
                  <div className="w-full sm:w-2/5 aspect-[16/9] sm:aspect-[4/3] rounded-xl overflow-hidden relative shrink-0">
                    <img 
                      src={news.imageUrl} 
                      alt={news.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  {/* Content */}
                  <div className="w-full sm:w-3/5 flex flex-col justify-center h-full pt-1 sm:pt-0">
                    <span className="text-[#C61E21] text-xs font-black uppercase tracking-wider mb-2 block">
                      {news.category}
                    </span>
                    <h4 className="font-serif text-xl font-bold leading-snug mb-2 group-hover:text-[#C61E21] transition-colors text-gray-900 line-clamp-2 sm:line-clamp-3">
                      {news.title}
                    </h4>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 hidden md:block leading-relaxed">
                      {news.excerpt}
                    </p>
                    <div className="flex items-center text-xs text-gray-400 font-medium mt-auto">
                      <span>{news.author}</span>
                      <span className="mx-2">•</span>
                      <span>{news.publishedAt}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            
            {/* Load More Button */}
            <div className="mt-8 text-center">
              <button className="bg-white border-2 border-[#0C2A51] text-[#0C2A51] font-bold px-8 py-3 rounded-full hover:bg-[#0C2A51] hover:text-white transition-colors">
                Muat Lebih Banyak
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN (Sidebar) - 4 cols */}
          <aside className="lg:col-span-4 space-y-10">
            
            {/* WIDGET: TERPOPULER (Big Numbers IDN Times Style) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
               <div className="flex items-center gap-2 border-b-2 border-gray-100 pb-3 mb-5">
                  <TrendingUp className="text-[#C61E21]" size={24} />
                  <h3 className="font-serif text-xl font-black text-[#0C2A51]">Terpopuler</h3>
                </div>
                <div className="space-y-6">
                  {popularNews.map((news, index) => (
                    <div key={news.id} className="flex gap-4 group cursor-pointer items-start">
                      <div className="text-5xl font-black text-gray-200 group-hover:text-[#C61E21] transition-colors leading-none tracking-tighter w-10 text-right shrink-0">
                        {index + 1}
                      </div>
                      <div className="pt-1">
                        <span className="text-[10px] font-bold text-[#0C2A51] uppercase tracking-wider mb-1 block">
                          {news.category}
                        </span>
                        <h4 className="font-serif font-bold text-gray-800 leading-snug group-hover:text-[#C61E21] transition-colors line-clamp-3">
                          {news.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
            </div>

            {/* WIDGET: BERLANGGANAN / INFO */}
            <div className="bg-gradient-to-br from-[#0C2A51] to-[#1c3e6b] text-white p-8 rounded-2xl shadow-md text-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#C61E21] opacity-20 rounded-full -ml-10 -mb-10"></div>
              
              <h3 className="font-serif text-2xl font-black mb-3 relative z-10">Ikuti Kami</h3>
              <p className="text-sm text-gray-200 mb-8 relative z-10 font-medium">Jangan lewatkan update berita terkini, akurat, dan terpercaya dari PorosMadura.</p>
              <div className="flex justify-center gap-3 relative z-10">
                <a href="#" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C61E21] hover:scale-110 transition-all"><Facebook size={20} /></a>
                <a href="#" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C61E21] hover:scale-110 transition-all"><Twitter size={20} /></a>
                <a href="#" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C61E21] hover:scale-110 transition-all"><Instagram size={20} /></a>
                <a href="#" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C61E21] hover:scale-110 transition-all"><Youtube size={20} /></a>
              </div>
            </div>

          </aside>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8 mt-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Column 1: Brand */}
            <div className="md:col-span-1">
              <a href="#" className="flex items-center gap-1 mb-4">
                <span className="bg-[#C61E21] text-white font-serif font-bold text-3xl w-10 h-10 flex items-center justify-center rounded-lg">P</span>
                <span className="font-serif font-black text-3xl tracking-tight text-[#0C2A51]">Poros<span className="text-[#C61E21]">Madura</span></span>
              </a>
              <p className="text-sm text-gray-500 mb-4 font-serif italic font-medium">"Berita Tepat, Fakta Kuat"</p>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                Platform berita digital terpercaya yang menyajikan informasi secara cepat, akurat, dan kredibel untuk masyarakat Madura dan Nusantara.
              </p>
            </div>

            {/* Column 2: Kategori */}
            <div>
              <h4 className="font-black text-[#0C2A51] text-lg mb-5 font-serif">Kategori Utama</h4>
              <ul className="space-y-3 text-sm text-gray-600 font-semibold">
                {categories.slice(0, 5).map((cat, idx) => (
                  <li key={idx}><a href="#" className="hover:text-[#C61E21] transition-colors">{cat}</a></li>
                ))}
              </ul>
            </div>

            {/* Column 3: Perusahaan */}
            <div>
              <h4 className="font-black text-[#0C2A51] text-lg mb-5 font-serif">Perusahaan</h4>
              <ul className="space-y-3 text-sm text-gray-600 font-semibold">
                <li><a href="#" className="hover:text-[#C61E21] transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-[#C61E21] transition-colors">Susunan Redaksi</a></li>
                <li><a href="#" className="hover:text-[#C61E21] transition-colors">Pedoman Media Siber</a></li>
                <li><a href="#" className="hover:text-[#C61E21] transition-colors">Disclaimer</a></li>
                <li><a href="#" className="hover:text-[#C61E21] transition-colors">Kebijakan Privasi</a></li>
              </ul>
            </div>

            {/* Column 4: Kontak */}
            <div>
              <h4 className="font-black text-[#0C2A51] text-lg mb-5 font-serif">Hubungi Kami</h4>
              <ul className="space-y-3 text-sm text-gray-600 font-medium">
                <li><span className="font-bold">Email:</span> redaksi@porosmadura.com</li>
                <li><span className="font-bold">Telepon:</span> (0324) 123456</li>
                <li className="mt-6 pt-6 border-t border-gray-200">
                  <a href="#" className="inline-flex items-center justify-center bg-[#0C2A51] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#C61E21] transition-colors w-full">
                    Pasang Iklan / Advertise
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Footer */}
          <div className="pt-8 border-t border-gray-200 text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 font-medium">&copy; {new Date().getFullYear()} PorosMadura. Hak Cipta Dilindungi.</p>
            <div className="flex gap-6 text-sm font-bold text-gray-400">
              <a href="#" className="hover:text-[#0C2A51]">Syarat & Ketentuan</a>
              <a href="#" className="hover:text-[#0C2A51]">Kebijakan Privasi</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}