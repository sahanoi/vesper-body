'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Play,
  Share2,
  Ruler,
  Check,
  ChevronLeft,
  Flame,
  Info,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const { products, addToCart } = useStore();

  const product = products.find((p) => p.slug === params.slug);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL'>(
    product?.variants.find((v) => v.stock > 0)?.size || 'S'
  );
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [hintCopied, setHintCopied] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif-editorial text-3xl">Ürün Bulunamadı</h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Aradığınız ürün koleksiyondan kaldırılmış veya taşınmış olabilir.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-full bg-[var(--accent-primary)] text-white text-xs font-medium"
        >
          Koleksiyona Dön
        </Link>
      </div>
    );
  }

  const activeMedia = product.media[activeMediaIndex] || product.media[0];
  const currentVariant = product.variants.find((v) => v.size === selectedSize);
  const isAvailable = (currentVariant?.stock || 0) > 0;

  const handleAdd = () => {
    const res = addToCart(product, selectedSize, 1);
    setFeedbackMsg(res.message);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleDropAHint = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const message = `Bu gece için küçük bir ipucu... VELOURS koleksiyonundan "${product.name}" çok hoşuma gitti (Bedenim: ${selectedSize}) 🖤 İncelemek istersen: ${url}`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(message);
      setHintCopied(true);
      setTimeout(() => setHintCopied(false), 3000);
    }
  };

  const whatsappHintUrl = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = encodeURIComponent(
      `Küçük bir ipucu bırakıyorum 🖤 "${product.name}" (Bedenim: ${selectedSize}): ${url}`
    );
    return `https://wa.me/?text=${text}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <Link
          href="/"
          className="inline-flex items-center gap-1 hover:text-[var(--accent-primary)]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Koleksiyona Dön</span>
        </Link>
        <span>SKU: {currentVariant?.sku}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Rich Image + Video/GIF Loop Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            {activeMedia?.type === 'video' ? (
              <video
                key={activeMedia.url}
                src={activeMedia.url}
                poster={activeMedia.posterUrl}
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={activeMedia?.url}
                alt={activeMedia?.alt || product.name}
                className="w-full h-full object-cover"
              />
            )}

            {/* Media Type Pill */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-xs font-medium flex items-center gap-1.5">
              {activeMedia?.type === 'video' ? (
                <>
                  <Play className="w-3 h-3 fill-[#f5d97e] text-[#f5d97e]" />
                  <span>Hareketli Doku Görünümü (HD Loop)</span>
                </>
              ) : (
                <span>Stüdyo Çekimi ({activeMediaIndex + 1}/{product.media.length})</span>
              )}
            </div>

            {activeMedia?.caption && (
              <div className="absolute bottom-4 inset-x-4 px-4 py-2 rounded-xl bg-black/65 backdrop-blur-xs text-white text-xs">
                {activeMedia.caption}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {product.media.map((med, idx) => (
              <button
                key={med.id}
                type="button"
                onClick={() => setActiveMediaIndex(idx)}
                className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                  activeMediaIndex === idx
                    ? 'border-[var(--accent-primary)] scale-105'
                    : 'border-[var(--border-subtle)] opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={med.type === 'video' ? med.posterUrl || product.media[0].url : med.url}
                  alt={med.alt}
                  className="w-full h-full object-cover"
                />
                {med.type === 'video' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="p-1.5 rounded-full bg-[var(--accent-primary)] text-white">
                      <Play className="w-3 h-3 fill-white" />
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Details, Size Selector, Naughty Touch & Add to Cart (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2 border-b border-[var(--border-subtle)] pb-5">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-[var(--accent-primary)] font-semibold">
                {product.categoryName}
              </span>
              <span>•</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-medium">
                {product.spiceLevel === 'daring'
                  ? '🖤 Cesur / After Dark'
                  : product.spiceLevel === 'seductive'
                  ? '🔥 Çekici & İddialı'
                  : '🌸 Romantik & Zarif'}
              </span>
            </div>

            <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {product.subtitle}
            </p>

            <div className="pt-2 flex items-baseline gap-3">
              <span className="text-2xl font-bold">
                {product.price.toLocaleString('tr-TR')} TL
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-[var(--text-secondary)] line-through">
                  {product.compareAtPrice.toLocaleString('tr-TR')} TL
                </span>
              )}
              <span className="text-[11px] text-emerald-500 font-medium">
                KDV Dahil • 3 Taksit İmkanı
              </span>
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">
                Beden Seçimi: <strong className="text-[var(--accent-primary)]">{selectedSize}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowSizeGuide(!showSizeGuide)}
                className="inline-flex items-center gap-1 underline text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Beden Tablosu</span>
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {product.variants.map((variant) => {
                const out = variant.stock <= 0;
                const active = selectedSize === variant.size;
                return (
                  <button
                    key={variant.size}
                    type="button"
                    disabled={out}
                    onClick={() => setSelectedSize(variant.size)}
                    className={`py-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer ${
                      out
                        ? 'opacity-35 line-through cursor-not-allowed bg-[var(--bg-surface)] border-[var(--border-subtle)]'
                        : active
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-md'
                        : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:border-[var(--accent-primary)]'
                    }`}
                  >
                    <span>{variant.size}</span>
                    <span className="text-[10px] opacity-80 font-normal mt-0.5">
                      {out ? 'Tükendi' : `${variant.stock} adet`}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-[var(--text-secondary)] italic">
              {product.modelMeasurements}
            </p>

            {/* Collapsible Size Guide */}
            {showSizeGuide && (
              <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs space-y-2">
                <div className="font-semibold flex justify-between">
                  <span>VELOURS Uluslararası Beden Rehberi (cm)</span>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(false)}
                    className="underline"
                  >
                    Kapat
                  </button>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      <th className="py-1">Beden</th>
                      <th className="py-1">Göğüs</th>
                      <th className="py-1">Bel</th>
                      <th className="py-1">Kalça</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="py-1 font-medium">XS (34)</td><td>80-84</td><td>60-64</td><td>86-90</td></tr>
                    <tr><td className="py-1 font-medium">S (36)</td><td>84-88</td><td>64-68</td><td>90-94</td></tr>
                    <tr><td className="py-1 font-medium">M (38)</td><td>88-92</td><td>68-72</td><td>94-98</td></tr>
                    <tr><td className="py-1 font-medium">L (40)</td><td>92-96</td><td>72-76</td><td>98-102</td></tr>
                    <tr><td className="py-1 font-medium">XL (42)</td><td>96-102</td><td>76-82</td><td>102-108</td></tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Primary CTA: Add to Cart */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={!isAvailable}
              onClick={handleAdd}
              className="w-full py-4 px-6 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:bg-gray-400 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {isAvailable
                  ? `Gizli Sepete Ekle — ${product.price.toLocaleString('tr-TR')} TL`
                  : 'Seçilen Beden Stokta Yok'}
              </span>
            </button>

            {feedbackMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-medium text-center">
                {feedbackMsg}
              </div>
            )}

            {/* Naughty Touch: "Drop a Hint" (Partnerine İpucu Bırak) */}
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold flex items-center gap-1.5 text-[var(--accent-primary)]">
                  <Sparkles className="w-4 h-4" />
                  Naughty Touch: Partnerine İpucu Bırak
                </span>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  Seçili Beden: {selectedSize}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Bu tasarımı hediye olarak almak istediğiniz kişiye seçtiğiniz bedenle birlikte zarif bir sürpriz mesaj gönderin:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDropAHint}
                  className="flex-1 py-2 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--accent-primary)] text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {hintCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>İpucu Mesajı Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Mesajı & Linki Kopyala</span>
                    </>
                  )}
                </button>
                <a
                  href={whatsappHintUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-4 rounded-xl bg-[#25D366] text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <span>WhatsApp ile Gönder</span>
                </a>
              </div>
            </div>
          </div>

          {/* Description & Fabric Details */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)] text-xs leading-relaxed">
            <div>
              <h3 className="font-semibold text-sm mb-1.5">Tasarım Hikayesi</h3>
              <p className="text-[var(--text-secondary)]">{product.description}</p>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-1.5">Doku ve Kumaş Özellikleri</h3>
              <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
                {product.fabricDetails.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </div>

            {/* Discreet Shipping & Hygiene Guarantee Box */}
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-[var(--text-primary)]">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>%100 Gizli Paketleme & Hijyen Mühürü Garantisi</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                • Kargo poşeti üzerinde marka logosu veya ürün açıklaması bulunmaz.
                <br />• Ürünlerimiz ilk kez sizin tarafınızdan açılacak koruyucu <strong>Hijyen Bandı</strong> ile mühürlü gönderilir. Hijyen bandı açılmamış ürünlerde 14 gün koşulsuz değişim/iade hakkınız mevcuttur.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

