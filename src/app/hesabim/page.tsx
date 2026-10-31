'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  LogOut,
  Package,
  Lock,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Phone,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

type AuthView = 'login' | 'register' | 'forgot';

export default function AccountPage() {
  const {
    currentUser,
    authenticateUser,
    registerUser,
    resetUserPassword,
    logoutUser,
    orders,
  } = useStore();

  const [authView, setAuthView] = useState<AuthView>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  // Feedback Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const switchView = (nextView: AuthView) => {
    setErrorMsg('');
    setSuccessMsg('');
    setAuthView(nextView);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Lütfen e-posta adresinizi ve şifrenizi girin.');
      return;
    }

    const res = authenticateUser(loginEmail, loginPassword);
    if (!res.ok) {
      setErrorMsg(res.error || 'Giriş yapılamadı.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (regPassword.length < 6) {
      setErrorMsg('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    const res = await registerUser({
      fullName: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
    });
    setLoading(false);

    if (!res.ok) {
      setErrorMsg(res.error || 'Kayıt işlemi sırasında bir hata oluştu.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (forgotNewPassword.length < 6) {
      setErrorMsg('Yeni şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    const res = await resetUserPassword(forgotEmail, forgotNewPassword);
    setLoading(false);

    if (!res.ok) {
      setErrorMsg(res.error || 'Şifre sıfırlama işlemi başarısız.');
      return;
    }

    setSuccessMsg(
      'Şifreniz başarıyla güncellendi! Şimdi yeni şifrenizle giriş yapabilirsiniz.'
    );
    setLoginEmail(forgotEmail);
    setLoginPassword('');
    setTimeout(() => {
      setAuthView('login');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {!currentUser ? (
        <div className="max-w-md mx-auto p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] flex items-center justify-center mx-auto">
              {authView === 'login' && <User className="w-6 h-6" />}
              {authView === 'register' && <UserPlus className="w-6 h-6" />}
              {authView === 'forgot' && <KeyRound className="w-6 h-6" />}
            </div>

            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--accent-primary)] block">
              VESPER BODY
            </span>

            <h1 className="font-serif-editorial text-3xl font-semibold">
              {authView === 'login' && 'Üye Girişi'}
              {authView === 'register' && 'Yeni Hesap Oluştur'}
              {authView === 'forgot' && 'Şifremi Unuttum'}
            </h1>

            <p className="text-xs text-[var(--text-secondary)]">
              {authView === 'login' &&
                'Sipariş geçmişinizi görüntülemek ve hızlı ödeme ayrıcalıklarından yararlanmak için giriş yapın.'}
              {authView === 'register' &&
                'VESPER BODY ayrıcalıklar dünyasına katılmak için bilgilerinizi doldurun.'}
              {authView === 'forgot' &&
                'Kayıtlı e-posta adresinizi girerek yeni şifrenizi hemen belirleyin.'}
            </p>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* VIEW 1: LOGIN (E-Mail + Password) */}
          {authView === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1.5">
                  E-Posta Adresi
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ornek@eposta.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1.5">Şifre</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                    aria-label="Şifreyi Göster/Gizle"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white font-semibold cursor-pointer transition-colors shadow-md"
              >
                Giriş Yap
              </button>

              {/* Below Login Button: Forgot Password & Register Links */}
              <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3 text-center">
                <div>
                  <button
                    type="button"
                    onClick={() => switchView('forgot')}
                    className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent-primary)] underline underline-offset-4 cursor-pointer transition-colors"
                  >
                    Şifremi Unuttum
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center gap-1.5">
                  <span className="text-[var(--text-secondary)]">
                    Hesabın yok mu?
                  </span>
                  <button
                    type="button"
                    onClick={() => switchView('register')}
                    className="font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
                  >
                    Kayıt Ol →
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* VIEW 2: REGISTER (Hesabın yok mu? Kayıt Ol) */}
          {authView === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1.5">Ad Soyad *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1.5">
                  Telefon Numarası *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1.5">
                  E-Posta Adresi *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ornek@eposta.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1.5">
                  Şifre Belirleyin (En az 6 karakter) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white font-semibold cursor-pointer transition-colors shadow-md"
              >
                {loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol ve Giriş Yap'}
              </button>

              <div className="pt-3 border-t border-[var(--border-subtle)] text-center">
                <span className="text-[var(--text-secondary)]">
                  Zaten hesabın var mı?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
                >
                  Giriş Yap
                </button>
              </div>
            </form>
          )}

          {/* VIEW 3: FORGOT PASSWORD (Şifremi Unuttum) */}
          {authView === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1.5">
                  Kayıtlı E-Posta Adresiniz
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="ornek@eposta.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1.5">
                  Yeni Şifreniz (En az 6 karakter)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Yeni şifrenizi girin"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white font-semibold cursor-pointer transition-colors shadow-md"
              >
                {loading ? 'Güncelleniyor...' : 'Şifremi Sıfırla ve Güncelle'}
              </button>

              <div className="pt-3 border-t border-[var(--border-subtle)] text-center">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Giriş Ekranına Dön</span>
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[var(--text-secondary)]">
                Hoş Geldiniz,
              </span>
              <h1 className="font-serif-editorial text-3xl font-semibold">
                {currentUser.fullName}
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                {currentUser.email} • {currentUser.phone}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {currentUser.isAdmin && (
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-full bg-[var(--accent-primary)] text-white text-xs font-semibold"
                >
                  Yönetici Paneline Git →
                </Link>
              )}
              <button
                type="button"
                onClick={logoutUser}
                className="px-4 py-2 rounded-full border border-[var(--border-subtle)] text-xs font-semibold flex items-center gap-1.5 hover:border-red-500 hover:text-red-500 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif-editorial text-2xl font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-[var(--accent-primary)]" />
              <span>Son Siparişler</span>
            </h2>

            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex flex-wrap items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-sm">
                      #{ord.orderNumber}
                    </span>
                    <p className="text-[var(--text-secondary)] mt-0.5">
                      {ord.items.map((i) => `${i.name} (${i.size})`).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold">
                      {ord.totalAmount.toLocaleString('tr-TR')} TL
                    </span>
                    <Link
                      href={`/siparis-takip?kod=${ord.orderNumber}`}
                      className="px-4 py-2 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-semibold hover:border-[var(--accent-primary)]"
                    >
                      Detay & Kargo Takibi →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
