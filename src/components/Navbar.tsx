'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Moon,
  Sun,
  ShieldCheck,
  User,
  SlidersHorizontal,
  Menu,
  X,
  PackageSearch,
  Sparkles,
  Truck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { CATEGORIES } from '@/data/initial-catalog';

const ANNOUNCEMENT_ITEMS = [
  {
    icon: 'shield',
    highlight: '%100 GİZLİ PAKETLEME:',
    text: 'Kargo paketi ve faturada marka veya ürün içeriği asla yazmaz.',
  },
  {
    icon: 'zap',
    highlight: 'ÜYELİKSİZ ALIŞVERİŞ FIRSATI:',
    text: 'Hesap oluşturmadan 30 saniyede hızlı ve güvenli sipariş verin.',
  },
  {
    icon: 'sparkles',
    highlight: 'ÖZEL KOMBİN KAMPANYASI:',
    text: "2. Ürüne Anında %10 İndirim • Tamamlayıcı Ürünlerde %30 İndirim!",
  },
  {
    icon: 'truck',
    highlight: 'ÜCRETSİZ GİZLİ KARGO:',
    text: '1.500 TL ve üzeri tüm siparişlerde aynı gün ücretsiz kargo.',
  },
];

export function Navbar() {
  const {
    isAfterDark,
    toggleAfterDark,
    cart,
    setIsCartOpen,
    currentUser,
    isAdmin,
  } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Prevent background scrolling when full-screen mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/95 backdrop-blur-md transition-colors duration-300">
        {/* Top Scrolling Marquee Announcement Bar */}
        <div className="bg-[var(--accent-primary)] text-white text-xs py-2 overflow-hidden relative border-b border-white/10">
          <div className="vesper-marquee-track items-center">
            {[0, 1].map((dupIndex) => (
              <div
                key={dupIndex}
                className="flex items-center shrink-0"
                aria-hidden={dupIndex === 1}
              >
                {ANNOUNCEMENT_ITEMS.map((item, idx) => (
                  <div
                    key={`${dupIndex}-${idx}`}
                    className="flex items-center gap-2 px-7 whitespace-nowrap"
                  >
                    {item.icon === 'shield' && (
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#f5d97e]" />
                    )}
                    {item.icon === 'zap' && (
                      <Zap className="w-3.5 h-3.5 shrink-0 text-[#f5d97e]" />
                    )}
                    {item.icon === 'sparkles' && (
                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#f5d97e]" />
                    )}
                    {item.icon === 'truck' && (
                      <Truck className="w-3.5 h-3.5 shrink-0 text-[#f5d97e]" />
                    )}
                    <span className="font-bold tracking-wide text-[#f5d97e]">
                      {item.highlight}
                    </span>
                    <span className="font-medium opacity-95">{item.text}</span>
                    <span className="ml-5 text-[#f5d97e]/60">✦</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Main Navigation Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Left: Mobile Menu Trigger + Brand Logo + Desktop Category Links */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
              aria-label="Tam Ekran Menüyü Aç"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="group flex items-center gap-3">
              <img
                src="/images/brand/vesper-body-logo.jpg"
                alt="VESPER BODY Logo"
                className="w-10 h-10 rounded-full object-cover border border-[var(--border-subtle)] shadow-sm"
              />
              <div className="flex flex-col">
                <span className="font-serif-editorial text-2xl sm:text-3xl font-semibold tracking-wider uppercase">
                  VESPER BODY
                </span>
                <span className="text-[10px] tracking-[0.28em] uppercase text-[var(--text-secondary)] -mt-1">
                  Lingerie & Boudoir
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-5 ml-6 text-sm">
              <Link
                href="/?kategori=all#vitrin"
                className="hover:text-[var(--accent-primary)] transition-colors font-medium"
              >
                Tüm Koleksiyon
              </Link>
              {CATEGORIES.slice(0, 4).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/?kategori=${cat.slug}#vitrin`}
                  className="hover:text-[var(--accent-primary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
                >
                  <span>{cat.name}</span>
                  {cat.badge === 'After Dark' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold">
                      🔥
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Moon/Sun Icon Button, Conditional Admin Button (ONLY if Admin logged in), Account, Cart */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Icon-Only Moon & Sun Theme Switch */}
            <button
              type="button"
              onClick={toggleAfterDark}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                isAfterDark
                  ? 'bg-[#2a121b] border-[#d4af37]/60 text-[#f5d97e] shadow-[0_0_15px_rgba(184,29,67,0.35)]'
                  : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]'
              }`}
              title={
                isAfterDark
                  ? 'Gündüz Moduna Geç'
                  : 'Gece (After Dark) Moduna Geç'
              }
              aria-label="Tema Değiştir"
            >
              {isAfterDark ? (
                <Sun className="w-4 h-4 text-[#f5d97e]" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--accent-primary)]" />
              )}
            </button>

            {/* Admin Panel Button — Strictly hidden unless logged in as Admin */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-all"
                title="Yönetici & Ürün Paneli"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Yönetici Paneli</span>
              </Link>
            )}

            {/* Member / Guest Account Link */}
            <Link
              href="/hesabim"
              className="p-2.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] transition-colors flex items-center gap-1.5 text-xs"
              title="Üye Girişi veya Siparişlerim"
            >
              <User className="w-4 h-4" />
              {currentUser && !currentUser.isAdmin && (
                <span className="hidden xl:inline font-medium pr-1">
                  {currentUser.fullName.split(' ')[0]}
                </span>
              )}
            </Link>

            {/* Slide-over Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-xs font-medium transition-colors cursor-pointer"
              aria-label="Sepeti Aç"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Sepet</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white font-semibold">
                {totalItems}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 w-screen h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200">
          {/* Top Bar inside Full-Screen Menu */}
          <div>
            <div className="px-5 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3"
              >
                <img
                  src="/images/brand/vesper-body-logo.jpg"
                  alt="VESPER BODY"
                  className="w-10 h-10 rounded-full object-cover border border-[var(--border-subtle)]"
                />
                <div>
                  <span className="font-serif-editorial text-2xl font-semibold tracking-wider uppercase block">
                    VESPER BODY
                  </span>
                  <span className="text-[10px] tracking-[0.25em] uppercase text-[var(--text-secondary)] block -mt-1">
                    Koleksiyon & Menü
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={toggleAfterDark}
                  className="w-10 h-10 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-center cursor-pointer"
                  aria-label="Tema Değiştir"
                >
                  {isAfterDark ? (
                    <Sun className="w-4 h-4 text-[#f5d97e]" />
                  ) : (
                    <Moon className="w-4 h-4 text-[var(--accent-primary)]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center cursor-pointer"
                  aria-label="Menüyü Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Full-Page Category Selection List */}
            <div className="px-6 py-6 space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)] mb-3">
                Koleksiyon Kategorileri
              </p>

              <Link
                href="/?kategori=all#vitrin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--accent-primary)] transition-all group"
              >
                <div>
                  <span className="font-serif-editorial text-2xl font-semibold block">
                    Tüm Koleksiyonu Gör
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    17 Özel Tasarım Boudoir & İç Giyim Parçası
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--accent-primary)] group-hover:translate-x-1 transition-transform" />
              </Link>

              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/?kategori=${cat.slug}#vitrin`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/70 hover:bg-[var(--bg-elevated)] hover:border-[var(--accent-primary)] transition-all group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif-editorial text-xl font-semibold">
                        {cat.name}
                      </span>
                      {cat.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-primary)] text-white font-semibold">
                          {cat.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] block mt-0.5">
                      {cat.shortDesc}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Quick Actions inside Full-Screen Mobile Menu */}
          <div className="px-6 py-6 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Link
                href="/siparis-takip"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] font-semibold flex items-center justify-center gap-2 hover:border-[var(--accent-primary)]"
              >
                <PackageSearch className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Sipariş Sorgula</span>
              </Link>

              <Link
                href="/hesabim"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] font-semibold flex items-center justify-center gap-2 hover:border-[var(--accent-primary)]"
              >
                <User className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>
                  {currentUser ? 'Hesabım' : 'Üye Girişi / Kayıt'}
                </span>
              </Link>
            </div>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full p-3.5 rounded-2xl bg-[var(--accent-primary)] text-white text-xs font-semibold flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Yönetici & Ürün Paneline Git</span>
              </Link>
            )}

            <div className="pt-1 text-center text-[11px] text-[var(--text-secondary)]">
              🔒 %100 Gizli Paketleme • 2. Ürüne %10, Tamamlayıcı Ürünlere %30 İndirim
            </div>
          </div>
        </div>
      )}
    </>
  );
}
