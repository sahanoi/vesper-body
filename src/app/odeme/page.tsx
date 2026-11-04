'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Lock,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  UserCheck,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Order } from '@/types/commerce';

export default function CheckoutPage() {
  const {
    cart,
    cartSubtotal,
    shippingCost,
    currentUser,
    loginUser,
    createOrder,
    giftMysteryNote,
  } = useStore();

  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'member'>(
    currentUser ? 'member' : 'guest'
  );
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.savedAddress?.city || 'İstanbul');
  const [district, setDistrict] = useState(
    currentUser?.savedAddress?.district || ''
  );
  const [addressLine, setAddressLine] = useState(
    currentUser?.savedAddress?.addressLine || ''
  );
  const [mysteryNote, setMysteryNote] = useState(giftMysteryNote || '');

  const [paymentProvider, setPaymentProvider] = useState<
    'shopier' | 'iyzico' | 'paytr'
  >('shopier');
  const [installmentCount, setInstallmentCount] = useState<number>(1);
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('4543 •••• •••• 8812');
  const [discreetAccepted, setDiscreetAccepted] = useState(true);
  const [hygieneAccepted, setHygieneAccepted] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [shopierPaymentUrl, setShopierPaymentUrl] = useState<string | null>(
    null
  );
  const [shopierStatus, setShopierStatus] = useState<{
    configured: boolean;
    keyName: string;
    shopId: number | string | null;
  } | null>(null);

  useEffect(() => {
    fetch('/api/payment/shopier')
      .then((res) => res.json())
      .then((data) => {
        if (data?.configured) {
          setShopierStatus({
            configured: true,
            keyName: data.keyName || 'osman',
            shopId: data.shopId || 2896109,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleQuickDemoMemberLogin = () => {
    loginUser('zeynep.aydin@example.com', 'Zeynep Aydın');
    setCheckoutMode('member');
    setFullName('Zeynep Aydın');
    setEmail('zeynep.aydin@example.com');
    setPhone('0533 900 12 34');
    setCity('İstanbul');
    setDistrict('Beşiktaş');
    setAddressLine('Bebek Mah. Cevdetpaşa Cad. No: 42 D: 8');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !email.trim() || !phone.trim() || !addressLine.trim()) {
      setErrorMsg('Lütfen teslimat ve iletişim bilgilerini eksiksiz doldurun.');
      return;
    }

    if (!hygieneAccepted) {
      setErrorMsg(
        'Lütfen Mesafeli Satış Sözleşmesi ve Hijyen Mühürü şartlarını onaylayın.'
      );
      return;
    }

    setIsSubmitting(true);
    const itemsSummary = cart
      .map((i) => `${i.name} (${i.size} x${i.quantity})`)
      .join(', ');
    const firstImage = cart[0]?.imageUrl;

    const res = createOrder({
      customer: {
        isGuest: checkoutMode === 'guest' && !currentUser,
        userId: currentUser?.id,
        fullName,
        email,
        phone,
        city,
        district,
        addressLine,
        discreetPackagingConfirmed: discreetAccepted,
        giftMysteryNote: mysteryNote.trim() || undefined,
      },
      paymentProvider,
      installmentCount,
    });

    if (!res.ok || !res.order) {
      setIsSubmitting(false);
      setErrorMsg(res.error || 'Sipariş oluşturulurken bir hata oluştu.');
      return;
    }

    if (paymentProvider === 'shopier') {
      try {
        const shopierRes = await fetch('/api/payment/shopier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: res.order.orderNumber,
            totalAmount: res.order.totalAmount,
            customerName: fullName,
            itemsSummary,
            coverImageUrl: firstImage,
          }),
        });
        const shopierData = await shopierRes.json();
        if (shopierData?.paymentUrl) {
          setShopierPaymentUrl(shopierData.paymentUrl);
          window.open(shopierData.paymentUrl, '_blank', 'noopener,noreferrer');
        }
      } catch {
        // Fallback to direct order screen if offline
      }
    }

    setIsSubmitting(false);
    setCompletedOrder(res.order);
  };

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-14">
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-500">
              3D Secure Ödeme Onaylandı ({completedOrder.paymentProvider.toUpperCase()})
            </span>
            <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold">
              Gizli Siparişiniz Alındı
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Sipariş Numaranız:{' '}
              <strong className="text-[var(--text-primary)] font-mono text-base">
                {completedOrder.orderNumber}
              </strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Alıcı:</span>
              <span className="font-semibold">
                {completedOrder.customer.fullName}{' '}
                {completedOrder.customer.isGuest ? '(Üyeliksiz Alışveriş)' : '(Üye)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Teslimat Adresi:</span>
              <span className="font-medium">
                {completedOrder.customer.district} / {completedOrder.customer.city}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Paketleme Türü:</span>
              <span className="text-emerald-500 font-semibold">
                🔒 %100 Gizli Mat Siyah Kutu (Logosuz)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Ödenen Tutar:</span>
              <span className="font-bold">
                {completedOrder.totalAmount.toLocaleString('tr-TR')} TL (
                {completedOrder.installmentCount === 1
                  ? 'Tek Çekim'
                  : `${completedOrder.installmentCount} Taksit`}
                )
              </span>
            </div>
          </div>

          {shopierPaymentUrl && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
              <p className="font-semibold text-emerald-500">
                Shopier 3D Secure Ödeme Bağlantınız Hazır
              </p>
              <a
                href={shopierPaymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-2.5 rounded-full bg-emerald-600 text-white font-semibold"
              >
                Shopier Ödeme Sayfasını Aç →
              </a>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href={`/siparis-takip?kod=${completedOrder.orderNumber}`}
              className="px-6 py-3 rounded-full bg-[var(--accent-primary)] text-white text-xs font-semibold"
            >
              Sipariş Durumunu Takip Et
            </Link>
            <Link
              href="/admin"
              className="px-6 py-3 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold hover:border-[var(--accent-primary)]"
            >
              Yönetici Panelinde Siparişi Gör (/admin) →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold">
          Güvenli & Gizli Ödeme
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
          İster üye olmadan 30 saniyede, ister üye girişi yaparak siparişinizi tamamlayın.
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
          onSubmit={handleSubmitOrder}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Left 7 Cols: Guest vs Member Switch + Address + Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Guest vs Member Selector */}
            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider">
                  1. Alışveriş Tercihi
                </h2>
                {currentUser && (
                  <span className="text-xs text-emerald-500 font-medium">
                    ✓ {currentUser.fullName} olarak giriş yapıldı
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutMode('guest')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    checkoutMode === 'guest'
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs">
                    <UserPlus className="w-4 h-4 text-[var(--accent-primary)]" />
                    <span>Üyeliksiz Hızlı Devam Et</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    Şifre oluşturmadan, sadece teslimat adresinizle hemen sipariş verin.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={handleQuickDemoMemberLogin}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    checkoutMode === 'member'
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs">
                    <UserCheck className="w-4 h-4 text-[var(--accent-primary)]" />
                    <span>Üye Girişi ile Hızlı Doldur</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    Kayıtlı adres bilgilerinizi otomatik doldurun ve sipariş geçmişinizi saklayın.
                  </p>
                </button>
              </div>
            </div>

            {/* Step 2: Delivery Address & Discreet Packaging */}
            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider">
                2. Gizli Teslimat Bilgileri
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium mb-1">Ad Soyad *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Örn: Selin Kaya"
                    className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">
                    Telefon (Kargo SMS Takibi İçin) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-medium mb-1">
                    E-Posta (Fatura ve Sipariş Kodu İçin) *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@eposta.com"
                    className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">İl *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">İlçe *</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Örn: Kadıköy"
                    className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-medium mb-1">Açık Adres *</label>
                  <textarea
                    rows={2}
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="Mahalle, Sokak, Bina ve Daire No"
                    className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-1.5 font-medium mb-1 text-[var(--accent-primary)]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Gizli Sürpriz / Hediye Zarfı Notu (İsteğe Bağlı)
                  </label>
                  <input
                    type="text"
                    value={mysteryNote}
                    onChange={(e) => setMysteryNote(e.target.value)}
                    placeholder="Kutu içindeki mühürlü siyah zarfa yazılacak özel not..."
                    className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Gateway (Shopier / iyzico / PayTR) */}
            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider">
                    3. Ödeme Altyapısı (3D Secure)
                  </h2>
                  {shopierStatus?.configured && (
                    <p className="text-[11px] text-emerald-500 font-medium mt-0.5">
                      ✓ Shopier API Aktif (Anahtar: {shopierStatus.keyName} • Mağaza #{shopierStatus.shopId})
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentProvider('shopier')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                      paymentProvider === 'shopier'
                        ? 'bg-[#28C76F] text-white border-[#28C76F]'
                        : 'border-[var(--border-subtle)]'
                    }`}
                  >
                    Shopier 3D Secure
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentProvider('iyzico')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                      paymentProvider === 'iyzico'
                        ? 'bg-[#1E64FF] text-white border-[#1E64FF]'
                        : 'border-[var(--border-subtle)]'
                    }`}
                  >
                    iyzico
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentProvider('paytr')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                      paymentProvider === 'paytr'
                        ? 'bg-[#002B5C] text-white border-[#002B5C]'
                        : 'border-[var(--border-subtle)]'
                    }`}
                  >
                    PayTR
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium mb-1">Kart Üzerindeki İsim</label>
                  <input
                    type="text"
                    value={cardHolder || fullName}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="AD SOYAD"
                    className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Kart Numarası (Demo Hazır)</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] font-mono"
                  />
                </div>
              </div>

              {/* Installments */}
              <div className="space-y-2 text-xs">
                <span className="font-medium block">Taksit Seçenekleri:</span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { count: 1, label: 'Tek Çekim (Vade Farksız)' },
                    { count: 2, label: '2 Taksit (Peşin Fiyatına)' },
                    { count: 3, label: '3 Taksit (Peşin Fiyatına)' },
                  ].map((inst) => (
                    <button
                      key={inst.count}
                      type="button"
                      onClick={() => setInstallmentCount(inst.count)}
                      className={`p-2.5 rounded-xl border text-center cursor-pointer ${
                        installmentCount === inst.count
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 font-semibold'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
                      }`}
                    >
                      <span className="block">{inst.label}</span>
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        {Math.round(
                          (cartSubtotal + shippingCost) / inst.count
                        ).toLocaleString('tr-TR')}{' '}
                        TL / ay
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Order Summary & Legal Checkboxes */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] space-y-4 sticky top-28">
              <h2 className="font-serif-editorial text-2xl font-semibold">
                Sipariş Özeti
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex items-center justify-between gap-3 text-xs border-b border-[var(--border-subtle)] pb-3"
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
                          Beden: {item.size} × {item.quantity} adet
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold">
                      {(item.price * item.quantity).toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 text-xs pt-2">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Ara Toplam</span>
                  <span>{cartSubtotal.toLocaleString('tr-TR')} TL</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Gizli Kargo</span>
                  <span>
                    {shippingCost === 0 ? 'ÜCRETSİZ' : `${shippingCost} TL`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-[var(--border-subtle)]">
                  <span>Ödenecek Toplam</span>
                  <span>
                    {(cartSubtotal + shippingCost).toLocaleString('tr-TR')} TL
                  </span>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2.5 pt-2 text-xs">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discreetAccepted}
                    onChange={(e) => setDiscreetAccepted(e.target.checked)}
                    className="mt-0.5 accent-[var(--accent-primary)]"
                  />
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    Siparişimin dışarıdan içeriği belli olmayacak şekilde{' '}
                    <strong className="text-[var(--text-primary)]">
                      %100 Gizli Paketleme
                    </strong>{' '}
                    ile gönderilmesini istiyorum.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hygieneAccepted}
                    onChange={(e) => setHygieneAccepted(e.target.checked)}
                    className="mt-0.5 accent-[var(--accent-primary)]"
                  />
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    Ön Bilgilendirme Formu&apos;nu, Mesafeli Satış Sözleşmesi&apos;ni ve iç giyim hijyen bandı koruma şartlarını okudum, onaylıyorum. *
                  </span>
                </label>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Shopier Güvenli Ödeme Hazırlanıyor...'
                    : `${
                        paymentProvider === 'shopier'
                          ? 'Shopier'
                          : paymentProvider === 'iyzico'
                          ? 'iyzico'
                          : 'PayTR'
                      } ile ${(cartSubtotal + shippingCost).toLocaleString('tr-TR')} TL Öde`}
                </span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--text-secondary)]">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Kredi kartı ekstrenizde &ldquo;VELOURS TEKSTİL A.Ş.&rdquo; olarak görünür.</span>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

