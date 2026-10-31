'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Flame, Play, ShoppingBag, Check } from 'lucide-react';
import { Product } from '@/types/commerce';
import { useStore } from '@/context/StoreContext';

const SPICE_BADGES = {
  romantic: { label: '🌸 Romantik', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  seductive: { label: '🔥 Çekici', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  daring: { label: '🖤 Cesur / Naughty', color: 'bg-[#b81d43]/20 text-[#ff6b8b] border-[#b81d43]/40' },
};

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL'>(
    product.variants.find((v) => v.stock > 0)?.size || 'S'
  );
  const [addedFeedback, setAddedFeedback] = useState(false);

  const primaryImage =
    product.media.find((m) => m.type === 'image')?.url ||
    product.media[0]?.posterUrl ||
    product.media[0]?.url;

  const secondaryImage =
    product.media.filter((m) => m.type === 'image')[1]?.url || primaryImage;

  const videoMedia = product.media.find((m) => m.type === 'video');

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
        )
      : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const res = addToCart(product, selectedSize, 1);
    if (res.ok) {
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 1500);
    }
  };

  const spice = SPICE_BADGES[product.spiceLevel];

  return (
    <article
      className="group relative flex flex-col rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-elevated)] transition-all duration-300 hover:shadow-xl hover:border-[var(--accent-primary)]/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual / Media Container (4:5 Portrait Aspect Ratio like EddeForLove) */}
      <Link
        href={`/urun/${product.slug}`}
        className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--bg-surface)] block"
      >
        {isHovered && videoMedia ? (
          <video
            src={videoMedia.url}
            poster={videoMedia.posterUrl || primaryImage}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover scale-105 transition-transform duration-700"
          />
        ) : (
          <img
            src={isHovered ? secondaryImage : primaryImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Top Left Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discountPercent && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--accent-primary)] text-white shadow-sm">
              %{discountPercent} İndirim
            </span>
          )}
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md border ${spice.color}`}
          >
            {spice.label}
          </span>
        </div>

        {/* Top Right Video / GIF Loop Indicator */}
        {videoMedia && (
          <div
            className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium flex items-center gap-1"
            title="Üzerine gelindiğinde hareketli video (GIF Loop) oynatılır"
          >
            <Play className="w-2.5 h-2.5 fill-white" />
            <span>Hareketli</span>
          </div>
        )}

        {/* Low Stock Alert */}
        {totalStock > 0 && totalStock <= 5 && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/75 text-amber-300 text-[10px] font-medium flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
            Son {totalStock} Ürün
          </div>
        )}
      </Link>

      {/* Product Info & Quick Size Add */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] mb-1">
            <span>{product.categoryName}</span>
            {product.isAfterDarkExclusive && (
              <span className="text-[var(--accent-primary)] font-semibold">
                ✦ After Dark
              </span>
            )}
          </div>
          <Link
            href={`/urun/${product.slug}`}
            className="font-serif-editorial text-xl font-semibold hover:text-[var(--accent-primary)] transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5">
            {product.subtitle}
          </p>
        </div>

        {/* Quick Size Selector & Price */}
        <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-secondary)]">Hızlı Beden:</span>
            <div className="flex items-center gap-1">
              {product.variants.map((v) => {
                const out = v.stock <= 0;
                const active = selectedSize === v.size;
                return (
                  <button
                    key={v.size}
                    type="button"
                    disabled={out}
                    onClick={() => setSelectedSize(v.size)}
                    className={`w-6 h-6 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                      out
                        ? 'opacity-30 line-through cursor-not-allowed bg-[var(--bg-surface)]'
                        : active
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div>
              {product.compareAtPrice && (
                <span className="text-xs text-[var(--text-secondary)] line-through mr-1.5">
                  {product.compareAtPrice.toLocaleString('tr-TR')} TL
                </span>
              )}
              <span className="text-base font-bold text-[var(--text-primary)]">
                {product.price.toLocaleString('tr-TR')} TL
              </span>
            </div>

            <button
              type="button"
              disabled={totalStock <= 0}
              onClick={handleQuickAdd}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                addedFeedback
                  ? 'bg-emerald-600 text-white'
                  : totalStock <= 0
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white'
              }`}
            >
              {addedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Eklendi</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Sepete Ekle</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

