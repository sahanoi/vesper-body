import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Truck, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] mt-20">
      {/* Trust Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">%100 Gizli Paketleme</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Kargo poşeti ve faturada mağaza logosu veya &ldquo;iç giyim&rdquo; ibaresi yer almaz.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">iyzico & PayTR Güvencesi</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              256-Bit SSL ve 3D Secure ile kredi kartı, banka kartı ve taksitli ödeme.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">24 Saatte Hızlı Gönderim</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Saat 16:00&apos;a kadar verilen siparişler aynı gün gizli kutusunda kargolanır.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">Hijyen Mühürlü Özel Kutu</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Her ürün ilk kez sizin tarafınızdan açılan koruyucu hijyen bandı ile gelir.
            </p>
          </div>
        </div>
      </div>

      {/* Links & Legal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/brand/vesper-body-logo.jpg"
              alt="VESPER BODY"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-serif-editorial text-2xl font-semibold tracking-wider uppercase block">
              VESPER BODY
            </span>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Fransız danteli, İtalyan tülü ve saf saten dokularıyla tasarlanan lüks iç giyim ve boudoir koleksiyonu.
          </p>
        </div>

        <div className="space-y-2">
          <h5 className="font-semibold uppercase tracking-wider text-[11px]">
            Koleksiyonlar
          </h5>
          <ul className="space-y-1.5 text-[var(--text-secondary)]">
            <li><Link href="/?kategori=bodysuit-tulum#vitrin" className="hover:underline">Bodysuit & Tulum</Link></li>
            <li><Link href="/?kategori=jartiyer-setleri#vitrin" className="hover:underline">Jartiyer Takımları</Link></li>
            <li><Link href="/?kategori=bustiyer-korse#vitrin" className="hover:underline">Büstiyer & Korse</Link></li>
            <li><Link href="/?kategori=babydoll-gecelik#vitrin" className="hover:underline">Babydoll & Sabahlık</Link></li>
            <li><Link href="/?kategori=sutyen-takimlari#vitrin" className="hover:underline">Sütyen & Fantezi Setler</Link></li>
          </ul>
        </div>

        <div className="space-y-2">
          <h5 className="font-semibold uppercase tracking-wider text-[11px]">
            Müşteri Hizmetleri & Yasal
          </h5>
          <ul className="space-y-1.5 text-[var(--text-secondary)]">
            <li><Link href="/siparis-takip" className="hover:underline">Üyeliksiz Sipariş Sorgulama</Link></li>
            <li><Link href="/hesabim" className="hover:underline">Üye Girişi & Sipariş Geçmişi</Link></li>
            <li><span>Gizli Paketleme Politikası</span></li>
            <li><span>Mesafeli Satış Sözleşmesi & Hijyen İade Koşulları</span></li>
            <li><span>KVKK ve Gizlilik Aydınlatma Metni</span></li>
          </ul>
        </div>

        <div className="space-y-2">
          <h5 className="font-semibold uppercase tracking-wider text-[11px]">
            VIP Ayrıcalıklar & Kampanyalar
          </h5>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Üyeliksiz hızlı sipariş ayrıcalığı ile <strong>2. ürüne anında %10</strong>, eldiven ve çorap gibi <strong>tamamlayıcı ürünlere %30 indirim</strong> fırsatından yararlanın.
          </p>
          <p className="text-[11px] text-[var(--accent-primary)] font-semibold pt-1">
            ✦ 1.500 TL Üzeri Siparişlerde Ücretsiz Gizli Kargo
          </p>
        </div>
      </div>
    </footer>
  );
}
