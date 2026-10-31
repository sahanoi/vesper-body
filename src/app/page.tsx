'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Flame,
  ShieldCheck,
  Sparkles,
  Play,
  SlidersHorizontal,
  ArrowRight,
  Gift,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { CATEGORIES } from '@/data/initial-catalog';
import { ProductCard } from '@/components/ProductCard';
import { SpiceLevel } from '@/types/commerce';

function StorefrontContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('kategori') || 'all';

  const { products, isAfterDark, toggleAfterDark } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSpice, setSelectedSpice] = useState<SpiceLevel | 'all'>('all');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('all');

  // Sync URL query param if clicked from navbar
  React.useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }
    if (selectedSpice !== 'all' && p.spiceLevel !== selectedSpice) {
      return false;
    }
    if (selectedSizeFilter !== 'all') {
      const variant = p.variants.find((v) => v.size === selectedSizeFilter);
      if (!variant || variant.stock <= 0) return false;
    }
    return true;
  });

  // Sort After Dark exclusives to top when After Dark mode is active
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (isAfterDark) {
      if (a.isAfterDarkExclusive && !b.isAfterDarkExclusive) return -1;
      if (!a.isAfterDarkExclusive && b.isAfterDarkExclusive) return 1;
    }
    return 0;
  });

  return (
    <div className="space-y-14">
      {/* Hero Section (Editorial Split with Auto-Looping Video like EddeForLove) */}
      <section className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Editorial Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>
                {isAfterDark
                  ? 'After Dark Koleksiyonu • Cesur & Baştan Çıkarıcı'
                  : '2026 Sonbahar / Kış Boudoir Koleksiyonu'}
              </span>
            </div>

            <h1 className="font-serif-editorial text-4xl sm:text-6xl font-semibold leading-[1.08] tracking-tight">
              {isAfterDark ? (
                <>
                  Geceye Ait Kusursuz Dokunuş:{' '}
                  <span className="italic text-[var(--accent-primary)]">
                    After Dark
                  </span>
                </>
              ) : (
                <>
                  Teninizle Bütünleşen Fransız Zarafeti ve{' '}
                  <span className="italic text-[var(--accent-primary)]">
                    Cesur Çizgiler
                  </span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed">
              İnce İtalyan tülü, el işçiliği dantel detaylar ve kum saati formu veren balenli korseler. Üyeliksiz 30 saniyede hızlı sipariş ve dışarıdan içeriği asla belli olmayan{' '}
              <strong className="text-[var(--text-primary)]">
                %100 Gizli Paketleme
              </strong>{' '}
              ayrıcalığıyla.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <a
                href="#vitrin"
                className="px-7 py-3.5 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold flex items-center gap-2 shadow-lg transition-all"
              >
                <span>Koleksiyonu Keşfet</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                href="/siparis-takip"
                className="px-6 py-3.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--accent-primary)] text-sm font-medium flex items-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Gizli Kargo & Sipariş Takibi</span>
              </Link>
            </div>

            {/* Key Value Props */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-[var(--border-subtle)] text-xs">
              <div>
                <span className="font-semibold block text-[var(--text-primary)]">
                  🔒 %100 Gizli Kargo
                </span>
                <span className="text-[var(--text-secondary)]">
                  Logosu ve içeriği gizli kutu
                </span>
              </div>
              <div>
                <span className="font-semibold block text-[var(--text-primary)]">
                  🎬 Hareketli Görseller
                </span>
                <span className="text-[var(--text-secondary)]">
                  Gerçek kumaş ve doku videoları
                </span>
              </div>
              <div>
                <span className="font-semibold block text-[var(--text-primary)]">
                  ⚡ Üyeliksiz Alışveriş
                </span>
                <span className="text-[var(--text-secondary)]">
                  iyzico / PayTR ile 30 sn&apos;de ödeme
                </span>
              </div>
            </div>
          </div>

          {/* Right Featured Video / Loop Showcase */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm lg:max-w-none aspect-[4/5] rounded-3xl overflow-hidden border border-[var(--border-subtle)] shadow-2xl group">
              <video
                src="/videos/products/vesper-corset-opera-gloves-set/vesper-corset-loop.mp4"
                poster="/images/products/vesper-corset-opera-gloves-set/vesper-corset-opera-gloves-set-1.jpg"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#f5d97e] mb-1">
                  <Play className="w-3 h-3 fill-[#f5d97e]" />
                  <span>CANLI DOKU ÖNİZLEMESİ (HD LOOP)</span>
                </div>
                <h2 className="font-serif-editorial text-2xl font-semibold">
                  Vesper Çelik Balenli Korse Seti
                </h2>
                <p className="text-xs text-white/80 mt-0.5">
                  Ön kopçalı transparan korse ve dantel opera eldivenleri
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold">2.650 TL</span>
                  <Link
                    href="/urun/vesper-celik-balenli-transparan-korse-eldiven-takimi"
                    className="px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-[#f5d97e] transition-colors"
                  >
                    Ürünü İncele →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story-Style Quick Category Selector */}
      <section id="vitrin" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--accent-primary)] font-semibold">
              Kategoriler & Stil Filtresi
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl font-semibold mt-1">
              Aradığınız Atmosferi Seçin
            </h2>
          </div>

          {/* Naughty Touch: Spice Level Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Cesaret Derecesi:
            </span>
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'romantic', label: '🌸 Romantik' },
              { id: 'seductive', label: '🔥 Çekici' },
              { id: 'daring', label: '🖤 Cesur / Naughty' },
            ].map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => setSelectedSpice(sp.id as SpiceLevel | 'all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  selectedSpice === sp.id
                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:border-[var(--accent-primary)]'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills + Size Availability Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[var(--text-primary)] text-[var(--bg-canvas)]'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Tüm Ürünler ({products.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.slug
                    ? 'bg-[var(--text-primary)] text-[var(--bg-canvas)]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{cat.name}</span>
                {cat.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--accent-primary)] text-white">
                    {cat.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Size Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--text-secondary)] mr-1">
              Stoktaki Beden:
            </span>
            {['all', 'XS', 'S', 'M', 'L', 'XL'].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSizeFilter(sz)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                  selectedSizeFilter === sz
                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)]'
                }`}
              >
                {sz === 'all' ? 'Tümü' : sz}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
            <p className="font-serif-editorial text-2xl">
              Bu filtreye uygun ürün bulunamadı
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSpice('all');
                setSelectedSizeFilter('all');
              }}
              className="px-5 py-2 rounded-full bg-[var(--accent-primary)] text-white text-xs font-medium cursor-pointer"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Discreet Packaging & Drop a Hint Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Mahremiyet Garantisi</span>
            </div>
            <h3 className="font-serif-editorial text-3xl font-semibold">
              Kargo Paketiniz Sadece Sizin Sırrınızdır
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Siparişleriniz mat siyah, darbe korumalı ve dışarıdan içeriği kesinlikle görünmeyen özel kutularda hazırlanır. Kargo barkodu üzerinde yalnızca lojistik şirket unvanı yer alır; kurye dahil hiç kimse paketin iç giyim ürünü olduğunu bilemez.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] space-y-3">
            <div className="flex items-center gap-2 text-[var(--accent-primary)] font-semibold text-sm">
              <Gift className="w-4 h-4" />
              <span>Naughty Touch: &ldquo;Partnerine İpucu Bırak&rdquo; Özelliği</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Beğendiğiniz ürünün sayfasında bedeninizi seçip <strong>&ldquo;Partnerine İpucu Bırak&rdquo;</strong> butonuna tıklayarak tek tıkla WhatsApp üzerinden seçtiğiniz bedenin linkini sürpriz bir mesajla paylaşabilirsiniz.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Yükleniyor...</div>}>
      <StorefrontContent />
    </Suspense>
  );
}

