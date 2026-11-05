'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Lock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

function submitShopierFastCheckoutForm(actionUrl: string, productId: string) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = actionUrl;
  form.style.display = 'none';

  const prodInput = document.createElement('input');
  prodInput.type = 'hidden';
  prodInput.name = 'product_id';
  prodInput.value = String(productId);
  form.appendChild(prodInput);

  const qtyInput = document.createElement('input');
  qtyInput.type = 'hidden';
  qtyInput.name = 'quantity';
  qtyInput.value = '1';
  form.appendChild(qtyInput);

  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutPage() {
  const {
    cart,
    cartSubtotal,
    shippingCost,
    removeFromCart,
    updateCartQuantity,
    giftMysteryNote,
    setGiftMysteryNote,
  } = useStore();

  const [discreetAccepted, setDiscreetAccepted] = useState(true);
  const [hygieneAccepted, setHygieneAccepted] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!hygieneAccepted) {
      setErrorMsg(
        'Lütfen Mesafeli Satış Sözleşmesi ve Hijyen Mühürü şartlarını onaylayın.'
      );
      return;
    }

    setIsSubmitting(true);
    const tempOrderCode = `VSP-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      const shopierRes = await fetch('/api/payment/shopier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: tempOrderCode,
          giftNote: giftMysteryNote.trim() || undefined,
          items: cart.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          })),
        }),
      });
      const shopierData = await shopierRes.json();

      if (!shopierRes.ok || !shopierData?.ok || !shopierData?.shopierProductId) {
        setIsSubmitting(false);
        setErrorMsg(
          shopierData?.error ||
            'Ödeme sayfası hazırlanırken bir hata oluştu. Lütfen tekrar deneyin.'
        );
        return;
      }

      if (shopierData.directCheckoutActionUrl && shopierData.shopierProductId) {
        submitShopierFastCheckoutForm(
          shopierData.directCheckoutActionUrl,
          shopierData.shopierProductId
        );
        return;
      }

      if (shopierData.paymentUrl) {
        window.location.href = shopierData.paymentUrl;
        return;
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg(
        'Ödeme sunucusuna bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.'
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold">
          Sipariş Özeti
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
          Seçtiğiniz ürünleri ve bedenleri kontrol ederek güvenli ödeme sayfasına geçin.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="p-12 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center space-y-4">
          <p className="font-serif-editorial text-2xl">Sepetiniz şu an boş</p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 rounded-full bg-[var(--accent-primary)] text-white text-xs font-semibold"
          >
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleProceedToPayment}
          className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 sm:p-8 shadow-xl space-y-6"
        >
          {/* Selected Products List */}
          <div className="space-y-4 divide-y divide-[var(--border-subtle)]">
            {cart.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex items-center justify-between gap-4 pt-4 first:pt-0"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <Link href={`/urun/${item.slug}`} className="shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-24 object-cover rounded-xl border border-[var(--border-subtle)]"
                    />
                  </Link>
                  <div className="space-y-1.5 min-w-0">
                    <Link
                      href={`/urun/${item.slug}`}
                      className="font-medium text-sm sm:text-base hover:text-[var(--accent-primary)] transition-colors block truncate"
                    >
                      {item.name}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <span className="px-2.5 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium">
                        Beden: {item.size}
                      </span>
                      <span>•</span>
                      <span>Birim Fiyat: {item.price.toLocaleString('tr-TR')} TL</span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <div className="inline-flex items-center border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-canvas)]">
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
                          aria-label="Adet Azalt"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-semibold">
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
                          aria-label="Adet Artır"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId, item.size)}
                        className="text-xs text-[var(--text-secondary)] hover:text-red-500 inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Kaldır</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm sm:text-base font-semibold">
                    {(item.price * item.quantity).toLocaleString('tr-TR')} TL
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Optional Gift Note */}
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5 text-[var(--accent-primary)]">
              <Sparkles className="w-3.5 h-3.5" />
              Paketin İçine Gizli Zarf Notu Ekle (İsteğe Bağlı)
            </label>
            <input
              type="text"
              value={giftMysteryNote}
              onChange={(e) => setGiftMysteryNote(e.target.value)}
              placeholder="Kutu içindeki mühürlü siyah zarfa yazılacak özel notunuz..."
              className="w-full p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>

          {/* Price Breakdown */}
          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Ara Toplam</span>
              <span>{cartSubtotal.toLocaleString('tr-TR')} TL</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Gizli Kargo Gönderimi</span>
              <span>
                {shippingCost === 0 ? 'ÜCRETSİZ' : `${shippingCost} TL`}
              </span>
            </div>
            <div className="flex justify-between text-base sm:text-lg font-bold pt-2.5 border-t border-[var(--border-subtle)] text-[var(--text-primary)]">
              <span>Ödenecek Toplam</span>
              <span>
                {(cartSubtotal + shippingCost).toLocaleString('tr-TR')} TL
              </span>
            </div>
          </div>

          {/* Agreements */}
          <div className="space-y-2.5 text-xs">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={discreetAccepted}
                onChange={(e) => setDiscreetAccepted(e.target.checked)}
                className="mt-0.5 accent-[var(--accent-primary)]"
              />
              <span className="text-[11px] sm:text-xs text-[var(--text-secondary)]">
                Siparişimin dışarıdan içeriği belli olmayacak şekilde{' '}
                <strong className="text-[var(--text-primary)]">
                  %100 Gizli Paketleme
                </strong>{' '}
                ile gönderilmesini istiyorum.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hygieneAccepted}
                onChange={(e) => setHygieneAccepted(e.target.checked)}
                className="mt-0.5 accent-[var(--accent-primary)]"
              />
              <span className="text-[11px] sm:text-xs text-[var(--text-secondary)]">
                Ön Bilgilendirme Formu&apos;nu, Mesafeli Satış Sözleşmesi&apos;ni ve iç giyim hijyen bandı koruma şartlarını okudum, onaylıyorum. *
              </span>
            </label>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:opacity-60 text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>
              {isSubmitting ? 'Ödeme Sayfası Hazırlanıyor...' : 'Ödeme Sayfasına Geç'}
            </span>
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--text-secondary)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>256-Bit SSL &amp; 3D Secure Güvenli Ödeme Altyapısı</span>
          </div>
        </form>
      )}
    </div>
  );
}
