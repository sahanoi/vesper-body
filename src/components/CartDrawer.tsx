'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    shippingCost,
    freeShippingThreshold,
    giftMysteryNote,
    setGiftMysteryNote,
  } = useStore();

  if (!isCartOpen) return null;

  const remainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - cartSubtotal
  );
  const progressPercent = Math.min(
    100,
    Math.round((cartSubtotal / freeShippingThreshold) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Content */}
      <aside className="relative z-10 w-full max-w-md bg-[var(--bg-elevated)] text-[var(--text-primary)] h-full flex flex-col shadow-2xl border-l border-[var(--border-subtle)]">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <h2 className="font-serif-editorial text-2xl font-semibold">
              Gizli Sepetiniz
            </h2>
            <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Dışarıdan içeriği belli olmayan özel mühürlü kutu
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
            aria-label="Sepeti Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="px-5 py-3 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
          {remainingForFreeShipping > 0 ? (
            <p className="text-xs mb-1.5">
              Ücretsiz Gizli Kargo için{' '}
              <span className="font-semibold text-[var(--accent-primary)]">
                {remainingForFreeShipping.toLocaleString('tr-TR')} TL
              </span>{' '}
              daha ekleyin.
            </p>
          ) : (
            <p className="text-xs mb-1.5 font-medium text-emerald-500">
              ✨ Tebrikler! Siparişiniz Ücretsiz Gizli Kargo kapsamındadır.
            </p>
          )}
          <div className="w-full h-1.5 bg-[var(--border-subtle)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent-primary)] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="font-serif-editorial text-2xl text-[var(--text-secondary)]">
                Sepetinizde henüz ürün yok
              </p>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
                Koleksiyonumuzdaki Fransız dantelli takımları, korseleri ve saten gecelikleri keşfedin.
              </p>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent-primary)] text-white text-xs font-medium"
              >
                Koleksiyonu Keşfet
              </button>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-3.5 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/urun/${item.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-sm font-medium hover:text-[var(--accent-primary)] line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.size)}
                          className="text-[var(--text-secondary)] hover:text-red-500 p-1 cursor-pointer"
                          aria-label="Ürünü Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                        Beden: <strong>{item.size}</strong>
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
                              item.productId,
                              item.size,
                              item.quantity - 1
                            )
                          }
                          className="p-1.5 hover:bg-[var(--bg-surface)] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
                              item.productId,
                              item.size,
                              item.quantity + 1
                            )
                          }
                          className="p-1.5 hover:bg-[var(--bg-surface)] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">
                        {(item.price * item.quantity).toLocaleString('tr-TR')} TL
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Naughty Touch: Mystery / Boudoir Note inside Discreet Box */}
              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent-primary)]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Paketin İçine Gizli Zarf Notu Ekle (Ücretsiz)
                </label>
                <textarea
                  rows={2}
                  value={giftMysteryNote}
                  onChange={(e) => setGiftMysteryNote(e.target.value)}
                  placeholder="Örn: Bu gece için küçük bir sır... (Sadece mühürlü siyah zarfın içinde yer alır)"
                  className="w-full text-xs p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer & Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Ara Toplam</span>
                <span>{cartSubtotal.toLocaleString('tr-TR')} TL</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Gizli Kargo Gönderimi</span>
                <span>
                  {shippingCost === 0
                    ? 'ÜCRETSİZ'
                    : `${shippingCost.toLocaleString('tr-TR')} TL`}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-[var(--border-subtle)] text-[var(--text-primary)]">
                <span>Toplam</span>
                <span>
                  {(cartSubtotal + shippingCost).toLocaleString('tr-TR')} TL
                </span>
              </div>
            </div>

            <Link
              href="/odeme"
              onClick={() => setIsCartOpen(false)}
              className="w-full py-3.5 px-5 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Ödeme Sayfasına Geç</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-[11px] text-center text-[var(--text-secondary)]">
              256-Bit SSL &amp; 3D Secure Güvencesiyle • %100 Gizli Paketleme
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

