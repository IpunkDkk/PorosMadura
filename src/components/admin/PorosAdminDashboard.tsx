export default function PorosAdminDashboard() {
  return (
    <section className="poros-dashboard-hero">
      <div>
        <p className="poros-dashboard-hero__eyebrow">PorosMadura CMS</p>
        <h1>Ruang kerja redaksi</h1>
        <p>
          Prioritaskan publikasi cepat, kurasi ketat, dan konsistensi metadata untuk setiap
          konten.
        </p>
      </div>
      <div className="poros-dashboard-hero__actions" aria-label="Aksi cepat">
        <a href="/admin/collections/posts/create">Tulis Berita</a>
        <a href="/admin/collections/media">Media Library</a>
      </div>
    </section>
  )
}
