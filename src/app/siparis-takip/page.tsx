'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PackageSearch, ShieldCheck, CheckCircle2, Truck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('kod') || 'VLR-84920';

  const { orders } = useStore();
  const [queryCode, setQueryCode] = useState(initialCode);

  const matchedOrder = orders.find(
    (o) => o.orderNumber.toLowerCase() === queryCode.trim().toLowerCase()
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-primary)]">
          <PackageSearch className="w-4 h-4" />
          <span>ÜYELİKSİZ & ÜYE SİPARİŞ SORGULAMA</span>
        </span>
        <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold">
          Gizli Kargo & Sipariş Takibi
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Sipariş numaranızı girerek paketinizin durumunu anlık olarak görüntüleyin (Örn:{' '}
          <button
            type="button"
            onClick={() => setQueryCode('VLR-84920')}
            className="underline font-mono font-semibold cursor-pointer"
          >
            VLR-84920
          </button>{' '}
          veya{' '}
          <button
            type="button"
            onClick={() => setQueryCode('VLR-84915')}
            className="underline font-mono font-semibold cursor-pointer"
          >
            VLR-84915
          </button>
          ).
        </p>
      </div>

      <div className="flex gap-2 max-w-md mx-auto">
        <input
          type="text"
          value={queryCode}
          onChange={(e) => setQueryCode(e.target.value)}
          placeholder="Sipariş No (Örn: VLR-84920)"
          className="flex-1 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-sm font-mono"
        />
      </div>

      {matchedOrder ? (
        <div className="p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <span className="text-xs text-[var(--text-secondary)]">
                Sipariş Kodu
              </span>
              <h2 className="text-xl font-mono font-bold">
                #{matchedOrder.orderNumber}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-xs text-[var(--text-secondary)] block">
                Güncel Durum
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-500">
                <CheckCircle2 className="w-4 h-4" />
                {matchedOrder.status === 'paid' && 'Ödeme Alındı'}
                {matchedOrder.status === 'preparing' &&
                  'Gizli Kutuda Hazırlanıyor'}
                {matchedOrder.status === 'shipped_discreet' &&
                  'Gizli Kargoya Verildi'}
                {matchedOrder.status === 'delivered' && 'Teslim Edildi'}
              </span>
            </div>
          </div>

          {matchedOrder.trackingCode && (
            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Kargo Takip Kodu:</span>
              </div>
              <strong className="font-mono">{matchedOrder.trackingCode}</strong>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <h3 className="font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Sipariş İçeriği
            </h3>
            {matchedOrder.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-14 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-[var(--text-secondary)]">
                      Beden: {item.size} × {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-bold">
                  {(item.price * item.quantity).toLocaleString('tr-TR')} TL
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center gap-2.5 text-emerald-500">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              Bu sipariş %100 Gizli Paketleme protokolüyle mühürlü ve logosuz kutuda hazırlanmaktadır.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center text-xs text-[var(--text-secondary)]">
          Bu koda ait sipariş bulunamadı. Lütfen sipariş numaranızı kontrol edin.
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Yükleniyor...</div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}

