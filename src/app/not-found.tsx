import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <span className="text-xs uppercase tracking-widest text-[var(--accent-primary)] font-semibold mb-2">
        404 — Sayfa Bulunamadı
      </span>
      <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold mb-4 text-[var(--text-primary)]">
        Aradığınız Sayfa Mevcut Değil
      </h1>
      <p className="text-sm text-[var(--text-secondary)] max-w-md mb-8">
        Ulaşmaya çalıştığınız sayfa taşınmış veya silinmiş olabilir. Vesper Body koleksiyonuna göz atmak için ana sayfaya dönebilirsiniz.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-semibold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}

