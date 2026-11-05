'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  PlusCircle,
  Layers,
  Trash2,
  Printer,
  CheckCircle2,
  Play,
  ExternalLink,
  Sparkles,
  Database,
  Pencil,
  Upload,
  X,
  Star,
  RotateCcw,
  Search,
  Lock,
  LogOut,
  Truck,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { CATEGORIES } from '@/data/initial-catalog';
import { LuxurySelect } from '@/components/LuxurySelect';
import {
  CategorySlug,
  Order,
  OrderStatus,
  Product,
  ProductMedia,
  SpiceLevel,
} from '@/types/commerce';

const ORDER_STATUS_LABELS: Record<
  OrderStatus,
  { label: string; badgeClass: string }
> = {
  paid: {
    label: 'Ödeme Alındı (Yeni)',
    badgeClass: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  },
  preparing: {
    label: 'Gizli Kutuda Hazırlanıyor',
    badgeClass: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  },
  shipped_discreet: {
    label: 'Gizli Kargoya Verildi',
    badgeClass: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
  },
  delivered: {
    label: 'Teslim Edildi',
    badgeClass: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  },
  cancelled: {
    label: 'İptal Edildi',
    badgeClass: 'bg-red-500/15 text-red-500 border-red-500/30',
  },
};

export default function AdminDashboardPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    updateVariantStock,
    resetToInitialProducts,
    orders,
    updateOrderStatus,
    settings,
    updateStoreSettings,
    isAdmin,
    loginAdmin,
    logoutUser,
  } = useStore();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<
    'inventory' | 'orders' | 'add-product' | 'settings'
  >('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [labelPreviewOrder, setLabelPreviewOrder] = useState<Order | null>(null);

  // Store & Shipping Settings State
  const [shippingCostInput, setShippingCostInput] = useState(
    settings?.standardShippingCost?.toString() ?? '89'
  );
  const [freeShippingThresholdInput, setFreeShippingThresholdInput] = useState(
    settings?.freeShippingThreshold?.toString() ?? '1500'
  );
  const [settingsSavedBanner, setSettingsSavedBanner] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setShippingCostInput(settings.standardShippingCost.toString());
      setFreeShippingThresholdInput(settings.freeShippingThreshold.toString());
    }
  }, [settings]);

  const handleSaveSettings = async (override?: {
    shippingCost: number;
    freeThreshold: number;
  }) => {
    setSettingsSaving(true);
    const newSettings = {
      standardShippingCost: override
        ? override.shippingCost
        : Math.max(0, Number(shippingCostInput) || 0),
      freeShippingThreshold: override
        ? override.freeThreshold
        : Math.max(0, Number(freeShippingThresholdInput) || 0),
    };
    if (override) {
      setShippingCostInput(override.shippingCost.toString());
      setFreeShippingThresholdInput(override.freeThreshold.toString());
    }
    await updateStoreSettings(newSettings);
    setSettingsSaving(false);
    setSettingsSavedBanner(true);
    setTimeout(() => setSettingsSavedBanner(false), 2000);
  };

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editSavedBanner, setEditSavedBanner] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [customMediaUrl, setCustomMediaUrl] = useState('');
  const [customMediaType, setCustomMediaType] = useState<'image' | 'video'>('image');

  // Add New Product Form State
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<CategorySlug>('bodysuit-tulum');
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>('seductive');
  const [price, setPrice] = useState('1790');
  const [compareAtPrice, setCompareAtPrice] = useState('2250');
  const [isAfterDarkExclusive, setIsAfterDarkExclusive] = useState(false);
  const [description, setDescription] = useState(
    'Fransız danteli ve yumuşak İtalyan tülü ile özel geceler için tasarlandı.'
  );
  const [fabricText, setFabricText] = useState(
    '%82 Fransız Danteli ve İtalyan Tülü, %18 Elastan\n%100 Saf Pamuklu İç Ağ Astarı\nKoruyucu Hijyen Bandı ve %100 Gizli Paketleme'
  );
  const [modelMeasurements, setModelMeasurements] = useState(
    'Model Boy: 176 cm | Göğüs: 85, Bel: 60, Kalça: 90 | Üzerindeki Beden: S'
  );
  const [newProductMedia, setNewProductMedia] = useState<ProductMedia[]>([
    {
      id: 'default-1',
      type: 'image',
      url: '/images/products/aura-bride-bodysuit/aura-bride-bodysuit-1.jpg',
      alt: 'Ürün Görseli 1',
      caption: 'Ön Görünüm',
    },
  ]);
  const [newMediaUrlInput, setNewMediaUrlInput] = useState('');
  const [newMediaTypeInput, setNewMediaTypeInput] = useState<'image' | 'video'>(
    'image'
  );
  const [stockBySize, setStockBySize] = useState({
    XS: 5,
    S: 12,
    M: 10,
    L: 5,
    XL: 2,
  });
  const [productAddedSuccess, setProductAddedSuccess] = useState(false);

  // KPI Metrics
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'paid' || o.status === 'preparing'
  ).length;

  const lowStockCount = products.reduce(
    (acc, p) => acc + p.variants.filter((v) => v.stock <= 3).length,
    0
  );

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Upload files from computer via /api/upload
  const handleFileUpload = async (
    files: FileList | null,
    targetSlug: string,
    onUploaded: (items: ProductMedia[]) => void
  ) => {
    if (!files || files.length === 0) return;
    setUploadingFiles(true);
    try {
      const formData = new FormData();
      formData.append('slug', targetSlug || 'vesper-urun');
      Array.from(files).forEach((f) => formData.append('files', f));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.media)) {
        onUploaded(data.media);
      }
    } catch (err) {
      console.error('Dosya yükleme hatası:', err);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const catObj = CATEGORIES.find((c) => c.slug === category);
    const skuPrefix = `VSP-${slug.slice(0, 3).toUpperCase()}`;

    addProduct({
      slug: `${slug}-${Date.now().toString().slice(-3)}`,
      name,
      subtitle: subtitle || 'Özel Tasarım Lüks İç Giyim Seti',
      category,
      categoryName: catObj?.name || 'Koleksiyon',
      price: Number(price) || 1690,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      currency: 'TRY',
      spiceLevel,
      isFeatured: true,
      isNewArrival: true,
      isAfterDarkExclusive,
      description,
      fabricDetails: fabricText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      modelMeasurements,
      hygieneSealRequired: true,
      media:
        newProductMedia.length > 0
          ? newProductMedia
          : [
              {
                id: `img-${Date.now()}`,
                type: 'image',
                url: '/images/products/aura-bride-bodysuit/aura-bride-bodysuit-1.jpg',
                alt: name,
              },
            ],
      variants: (['XS', 'S', 'M', 'L', 'XL'] as const).map((sz) => ({
        size: sz,
        sku: `${skuPrefix}-${sz}`,
        stock: stockBySize[sz],
      })),
    });

    setName('');
    setSubtitle('');
    setProductAddedSuccess(true);
    setTimeout(() => {
      setProductAddedSuccess(false);
      setActiveTab('inventory');
    }, 1500);
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const catObj = CATEGORIES.find((c) => c.slug === editingProduct.category);
    const finalized: Product = {
      ...editingProduct,
      categoryName: catObj?.name || editingProduct.categoryName,
    };

    updateProduct(finalized);
    setEditSavedBanner(true);
    setTimeout(() => {
      setEditSavedBanner(false);
      setEditingProduct(null);
    }, 900);
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await loginAdmin(adminEmail, adminPassword);
    if (!ok) {
      setAdminLoginError('Yönetici e-posta veya şifresi hatalı.');
    } else {
      setAdminLoginError('');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary)] block">
              VESPER BODY
            </span>
            <h1 className="font-serif-editorial text-3xl font-semibold">
              Yönetici Girişi
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Ürün yönetimi, fiyat güncelleme ve sipariş kontrol paneline erişmek için yönetici hesabınızla giriş yapın. Giriş yaptığınızda üst menüde yönetici kısayolu aktif olur.
            </p>
          </div>

          {adminLoginError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium text-center">
              {adminLoginError}
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">
                Yönetici E-Posta
              </label>
              <input
                type="text"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Yönetici Şifresi</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white font-semibold cursor-pointer transition-colors"
            >
              Yönetici Paneline Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent-primary)] mb-1">
            <Database className="w-3.5 h-3.5" />
            <span>VESPER BODY — TEK ÇATI YÖNETİCİ & VERİTABANI PANELİ (/api/store)</span>
          </div>
          <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold">
            Mağaza, Ürün & Sipariş Yönetimi
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Tüm ürünler (`src/data/database.json`) gerçek zamanlı olarak düzenlenebilir, yeni fotoğraf/video yüklenebilir ve stok/siparişler yönetilebilir.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  'Kataloğu yüklenen 17 orijinal ürün ve görsellerle sıfırlamak istiyor musunuz?'
                )
              ) {
                resetToInitialProducts();
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-xs font-semibold hover:border-[var(--accent-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Orijinal 17 Ürünü Yükle</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--accent-primary)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)]"
          >
            <span>Mağaza Vitrinini Gör</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={logoutUser}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-red-500 hover:text-red-500 text-xs font-semibold cursor-pointer transition-colors"
            title="Yönetici Oturumunu Kapat"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <span className="text-xs text-[var(--text-secondary)]">
            Aktif Koleksiyon Ürünü
          </span>
          <p className="text-2xl font-bold mt-1">{products.length} Ürün</p>
          <span className="text-[11px] text-emerald-500">
            Tamamı Düzenlenebilir (Fotoğraf + Video)
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <span className="text-xs text-[var(--text-secondary)]">Toplam Ciro</span>
          <p className="text-2xl font-bold mt-1">
            {totalRevenue.toLocaleString('tr-TR')} TL
          </p>
          <span className="text-[11px] text-emerald-500">
            iyzico & PayTR Onaylı Tahsilatlar
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <span className="text-xs text-[var(--text-secondary)]">
            Hazırlanacak Gizli Siparişler
          </span>
          <p className="text-2xl font-bold mt-1">{pendingOrdersCount} Adet</p>
          <span className="text-[11px] text-amber-500">
            Kargo çıkışı bekliyor
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <span className="text-xs text-[var(--text-secondary)]">
            Kritik Stok Uyarısı (≤ 3 Adet)
          </span>
          <p className="text-2xl font-bold mt-1 text-rose-500">
            {lowStockCount} Beden Varyantı
          </p>
          <span className="text-[11px] text-[var(--text-secondary)]">
            Tablodan tek tıkla artırabilirsiniz
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-[var(--accent-primary)] text-white shadow-md'
              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Ürün Listesi, Düzenleme & Stok Yönetimi ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('add-product')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'add-product'
              ? 'bg-[var(--accent-primary)] text-white shadow-md'
              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>2. Yeni Ürün & Çoklu Fotoğraf/Video Ekle</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[var(--accent-primary)] text-white shadow-md'
              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>3. Sipariş & Gizli Kargo Yönetimi ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[var(--accent-primary)] text-white shadow-md'
              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>4. Kargo & Mağaza Ayarları</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY, PRODUCT LIST & FULL EDITING */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Search & Category Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün adı, SKU kodu (Örn: VSP-COR) veya açıklama ile ara..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <LuxurySelect
                value={categoryFilter}
                onChange={(val) => setCategoryFilter(val)}
                className="min-w-[230px]"
                options={[
                  {
                    value: 'all',
                    label: `Tüm Kategoriler (${products.length})`,
                  },
                  ...CATEGORIES.map((c) => ({
                    value: c.slug,
                    label: c.name,
                    badge: c.badge,
                  })),
                ]}
              />

              <button
                type="button"
                onClick={() => setActiveTab('add-product')}
                className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Yeni Ürün Ekle</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)]">
                  <th className="p-4">Ürün & Medya Galerisi</th>
                  <th className="p-4">Fiyat / İndirim</th>
                  <th className="p-4 text-center">XS</th>
                  <th className="p-4 text-center">S</th>
                  <th className="p-4 text-center">M</th>
                  <th className="p-4 text-center">L</th>
                  <th className="p-4 text-center">XL</th>
                  <th className="p-4 text-right">Düzenle / Sil</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => {
                  const imgCount = prod.media.filter((m) => m.type === 'image').length;
                  const vidCount = prod.media.filter((m) => m.type === 'video').length;
                  return (
                    <tr
                      key={prod.id}
                      className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]/40"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3.5">
                          <div className="flex -space-x-2 shrink-0">
                            {prod.media
                              .filter((m) => m.type === 'image')
                              .slice(0, 3)
                              .map((m, idx) => (
                                <img
                                  key={m.id || idx}
                                  src={m.url}
                                  alt={prod.name}
                                  className="w-11 h-14 object-cover rounded-lg border-2 border-[var(--bg-elevated)] shadow-xs"
                                />
                              ))}
                          </div>
                          <div>
                            <Link
                              href={`/urun/${prod.slug}`}
                              className="font-semibold text-sm hover:text-[var(--accent-primary)] block"
                            >
                              {prod.name}
                            </Link>
                            <span className="block text-[11px] text-[var(--text-secondary)]">
                              {prod.categoryName} • SKU: <strong>{prod.variants[0]?.sku.split('-').slice(0, 2).join('-')}</strong>
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                                📷 {imgCount} Fotoğraf
                              </span>
                              {vidCount > 0 && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold">
                                  🎬 {vidCount} Video Loop
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-sm block">
                          {prod.price.toLocaleString('tr-TR')} TL
                        </span>
                        {prod.compareAtPrice && (
                          <span className="text-[11px] text-[var(--text-secondary)] line-through">
                            {prod.compareAtPrice.toLocaleString('tr-TR')} TL
                          </span>
                        )}
                      </td>

                      {(['XS', 'S', 'M', 'L', 'XL'] as const).map((sz) => {
                        const variant = prod.variants.find((v) => v.size === sz);
                        const count = variant?.stock || 0;
                        return (
                          <td key={sz} className="p-3 text-center">
                            <div className="inline-flex items-center gap-1 bg-[var(--bg-surface)] px-1.5 py-1 rounded-lg border border-[var(--border-subtle)]">
                              <button
                                type="button"
                                onClick={() =>
                                  updateVariantStock(prod.id, sz, count - 1)
                                }
                                className="px-1 font-bold hover:text-[var(--accent-primary)] cursor-pointer"
                              >
                                -
                              </button>
                              <span
                                className={`w-5 text-center font-bold ${
                                  count === 0
                                    ? 'text-red-500'
                                    : count <= 3
                                    ? 'text-amber-500'
                                    : 'text-emerald-500'
                                }`}
                              >
                                {count}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateVariantStock(prod.id, sz, count + 1)
                                }
                                className="px-1 font-bold hover:text-[var(--accent-primary)] cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>
                        );
                      })}

                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(prod)}
                            className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] font-semibold flex items-center gap-1 cursor-pointer"
                            title="Ürün Bilgilerini, Fiyatı ve Fotoğrafları Düzenle"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                            <span>Düzenle</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (
                                confirm(
                                  `"${prod.name}" ürününü silmek istediğinize emin misiniz?`
                                )
                              ) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                            title="Ürünü Koleksiyondan Kaldır"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ADD NEW PRODUCT (MULTI-IMAGE + VIDEO UPLOAD) */}
      {activeTab === 'add-product' && (
        <form
          onSubmit={handleCreateProduct}
          className="max-w-4xl p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] space-y-6 text-xs"
        >
          <div className="border-b border-[var(--border-subtle)] pb-4">
            <h2 className="font-serif-editorial text-2xl font-semibold">
              Koleksiyona Yeni Ürün Ekle
            </h2>
            <p className="text-[var(--text-secondary)] mt-0.5">
              Bilgisayarınızdan 3-4 fotoğraf ve video yükleyerek veya mevcut görsel yollarını kullanarak yeni ürün oluşturun.
            </p>
          </div>

          {productAddedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Yeni ürün veritabanına kaydedildi ve vitrinde yayına alındı!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Ürün Adı *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Bella Siyah Fransız Dantelli Büstiyer"
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Kısa Alt Başlık</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Örn: Balenli İtalyan Tülü 2 Parça Set"
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Kategori</label>
              <LuxurySelect
                value={category}
                onChange={(val) => setCategory(val as CategorySlug)}
                options={CATEGORIES.map((c) => ({
                  value: c.slug,
                  label: c.name,
                  badge: c.badge,
                }))}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">
                Naughty Touch / Cesaret Seviyesi
              </label>
              <LuxurySelect
                value={spiceLevel}
                onChange={(val) => setSpiceLevel(val as SpiceLevel)}
                options={[
                  { value: 'romantic', label: '🌸 Romantik & Zarif' },
                  { value: 'seductive', label: '🔥 Çekici & İddialı' },
                  { value: 'daring', label: '🖤 Cesur / After Dark (Naughty)' },
                ]}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Satış Fiyatı (TL) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">
                İndirim Öncesi Üstü Çizili Fiyat (TL)
              </label>
              <input
                type="number"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Ürün Açıklaması</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
              />
            </div>

            {/* Multi-Photo & Video Upload Section */}
            <div className="sm:col-span-2 p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold block text-sm">
                    Ürün Fotoğrafları & Video Loop Galerisi ({newProductMedia.length} Medya)
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    Bilgisayarınızdan birden fazla fotoğraf (`.jpg`, `.png`) veya video (`.mp4`) seçip yükleyebilirsiniz.
                  </span>
                </div>

                <label className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-semibold flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {uploadingFiles
                      ? 'Yükleniyor...'
                      : 'Bilgisayardan Fotoğraf/Video Seç'}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(e.target.files, name || 'yeni-urun', (uploaded) =>
                        setNewProductMedia((prev) => [...prev, ...uploaded])
                      )
                    }
                  />
                </label>
              </div>

              {/* Current Media Thumbnails */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {newProductMedia.map((med, idx) => (
                  <div
                    key={med.id || idx}
                    className="relative rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2 space-y-1.5"
                  >
                    <div className="aspect-[4/5] rounded-lg overflow-hidden bg-black/10 relative">
                      {med.type === 'video' ? (
                        <video
                          src={med.url}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          autoPlay
                          playsInline
                        />
                      ) : (
                        <img
                          src={med.url}
                          alt={med.alt}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-[var(--accent-primary)] text-white text-[10px] font-bold">
                          Kapak
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] truncate max-w-[100px]">
                        {med.type === 'video' ? '🎬 Video' : `📷 Fotoğraf #${idx + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setNewProductMedia((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="text-red-500 hover:underline text-[10px] cursor-pointer"
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Optional manual URL add */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <LuxurySelect
                  value={newMediaTypeInput}
                  onChange={(val) =>
                    setNewMediaTypeInput(val as 'image' | 'video')
                  }
                  className="min-w-[160px]"
                  options={[
                    { value: 'image', label: 'Fotoğraf URL' },
                    { value: 'video', label: 'Video (MP4) URL' },
                  ]}
                />
                <input
                  type="text"
                  value={newMediaUrlInput}
                  onChange={(e) => setNewMediaUrlInput(e.target.value)}
                  placeholder="/images/products/... veya https://..."
                  className="flex-1 p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newMediaUrlInput.trim()) return;
                    setNewProductMedia((prev) => [
                      ...prev,
                      {
                        id: `m-${Date.now()}`,
                        type: newMediaTypeInput,
                        url: newMediaUrlInput.trim(),
                        alt: name || 'Ürün Görseli',
                      },
                    ]);
                    setNewMediaUrlInput('');
                  }}
                  className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] font-semibold cursor-pointer"
                >
                  + Listeye Ekle
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-2">
                Beden Bazlı Başlangıç Stokları
              </label>
              <div className="grid grid-cols-5 gap-3">
                {(['XS', 'S', 'M', 'L', 'XL'] as const).map((sz) => (
                  <div
                    key={sz}
                    className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center"
                  >
                    <span className="font-bold block mb-1">{sz} Beden</span>
                    <input
                      type="number"
                      min={0}
                      value={stockBySize[sz]}
                      onChange={(e) =>
                        setStockBySize((prev) => ({
                          ...prev,
                          [sz]: Number(e.target.value),
                        }))
                      }
                      className="w-full p-1.5 text-center rounded border border-[var(--border-subtle)] bg-[var(--bg-canvas)] font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-7 py-3.5 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm cursor-pointer"
          >
            Ürünü Veritabanına Kaydet ve Vitrine Çıkar
          </button>
        </form>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map((order) => {
            const st = ORDER_STATUS_LABELS[order.status];
            return (
              <div
                key={order.id}
                className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold px-3 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${st.badgeClass}`}
                    >
                      {st.label}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {order.customer.isGuest ? 'Üyeliksiz Müşteri' : 'Kayıtlı Üye'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="px-2.5 py-1 rounded bg-[var(--bg-surface)] font-semibold uppercase">
                      {order.paymentProvider} • {order.installmentCount} Taksit
                    </span>
                    <span className="text-base font-bold">
                      {order.totalAmount.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                  <div className="lg:col-span-5 space-y-2.5">
                    <span className="font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                      Sipariş Edilen Ürünler
                    </span>
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--bg-surface)]"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-11 h-14 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-[var(--text-secondary)]">
                            Beden: <strong>{item.size}</strong> • Adet:{' '}
                            <strong>{item.quantity}</strong> •{' '}
                            {item.price.toLocaleString('tr-TR')} TL
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-4 space-y-1.5">
                    <span className="font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                      Teslimat & Gizli Kutu Bilgisi
                    </span>
                    <p className="font-semibold text-sm">{order.customer.fullName}</p>
                    <p className="text-[var(--text-secondary)]">
                      Tel: {order.customer.phone} • {order.customer.email}
                    </p>
                    <p className="text-[var(--text-primary)]">
                      {order.customer.addressLine} ({order.customer.district} /{' '}
                      {order.customer.city})
                    </p>
                    {order.customer.giftMysteryNote && (
                      <div className="mt-2 p-2.5 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)]">
                        <span className="font-semibold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Mühürlü Zarf Notu:
                        </span>
                        <p className="italic mt-0.5">
                          &ldquo;{order.customer.giftMysteryNote}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-3 flex flex-col justify-between gap-3">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                        Sipariş Durumunu Güncelle
                      </label>
                      <LuxurySelect
                        value={order.status}
                        onChange={(val) =>
                          updateOrderStatus(
                            order.id,
                            val as OrderStatus,
                            val === 'shipped_discreet' && !order.trackingCode
                              ? `YURTICI-${Math.floor(
                                  100000000 + Math.random() * 900000000
                                )}`
                              : order.trackingCode
                          )
                        }
                        options={[
                          { value: 'paid', label: 'Ödeme Alındı (Yeni)' },
                          {
                            value: 'preparing',
                            label: 'Gizli Kutuda Hazırlanıyor',
                          },
                          {
                            value: 'shipped_discreet',
                            label: 'Gizli Kargoya Verildi',
                          },
                          { value: 'delivered', label: 'Teslim Edildi' },
                          {
                            value: 'cancelled',
                            label: 'İptal Edildi (Stok İade)',
                          },
                        ]}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setLabelPreviewOrder(order)}
                      className="w-full py-2.5 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Gizli Kargo Fişi Yazdır</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: STORE & SHIPPING SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl space-y-6">
          <div className="p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] space-y-6">
            <div className="border-b border-[var(--border-subtle)] pb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
                Kargo & Fiyatlandırma Yönetimi
              </span>
              <h2 className="font-serif-editorial text-2xl font-semibold mt-1">
                Kargo Ücreti ve Ücretsiz Kargo Limiti
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                Bu ayarlar sepet hesaplamasında, sipariş oluşturmada ve Shopier ödeme tutarında anında geçerli olur.
                1 TL test ürününü kargo ücreti ödemeden denemek için tek tıkla &quot;1 TL Test Modu&quot;nu aktifleştirebilirsiniz.
              </p>
            </div>

            {settingsSavedBanner && (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Kargo ayarları veritabanına kaydedildi ve tüm sistemde güncellendi!</span>
              </div>
            )}

            {/* Quick Action Presets */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Hızlı Eylemler & Test Modları
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSaveSettings({ shippingCost: 0, freeThreshold: 0 })}
                  disabled={settingsSaving}
                  className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-400 text-xs">🧪 1 TL Test Modu</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                      Kargo = 0 TL
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    Kargo ücretini 0 TL yapar. Shopier üzerinde yalnızca ürünün fiyatı (1 TL) çekilir.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveSettings({ shippingCost: 89, freeThreshold: 1500 })}
                  disabled={settingsSaving}
                  className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--text-primary)] text-xs">🔄 Standart Canlı Ayarlar</span>
                    <span className="text-[10px] bg-[var(--bg-canvas)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full font-mono">
                      89 TL / 1500 TL
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    Kargo ücretini 89 TL, 1500 TL üzeri alışverişleri ücretsiz kargo yapar.
                  </p>
                </button>
              </div>
            </div>

            {/* Manual Form Controls */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSettings();
              }}
              className="space-y-4 pt-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1.5 text-xs">
                    Standart Kargo Ücreti (TL)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={shippingCostInput}
                      onChange={(e) => setShippingCostInput(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-hidden"
                      placeholder="89"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] font-medium">
                      TL
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)] mt-1 block">
                    Sepet limiti aşılmadığında alıcıdan tahsil edilecek tutar (0 = Her zaman ücretsiz).
                  </span>
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-xs">
                    Ücretsiz Kargo Sepet Limiti (TL)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={freeShippingThresholdInput}
                      onChange={(e) => setFreeShippingThresholdInput(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-hidden"
                      placeholder="1500"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] font-medium">
                      TL
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)] mt-1 block">
                    Bu tutar ve üzerindeki sepetlerde kargo otomatik 0 TL olur.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={settingsSaving}
                  className="px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-semibold text-xs hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 shadow-md flex items-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>{settingsSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL PRODUCT EDIT MODAL (FOR ALL 17 IMPORTED + MANUAL LISTINGS) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveEditProduct}
            className="max-w-4xl w-full max-h-[92vh] overflow-y-auto rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 sm:p-8 space-y-6 text-xs shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
                  ÜRÜN KAYDI DÜZENLEME (ID: {editingProduct.id})
                </span>
                <h2 className="font-serif-editorial text-2xl sm:text-3xl font-semibold">
                  {editingProduct.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-full hover:bg-[var(--bg-surface)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSavedBanner && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Değişiklikler veritabanına (`database.json`) kaydedildi!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Ürün Adı *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Alt Başlık</label>
                <input
                  type="text"
                  value={editingProduct.subtitle}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      subtitle: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Kategori</label>
                <LuxurySelect
                  value={editingProduct.category}
                  onChange={(val) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: val as CategorySlug,
                    })
                  }
                  options={CATEGORIES.map((c) => ({
                    value: c.slug,
                    label: c.name,
                    badge: c.badge,
                  }))}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Cesaret Seviyesi (Naughty Touch)
                </label>
                <LuxurySelect
                  value={editingProduct.spiceLevel}
                  onChange={(val) =>
                    setEditingProduct({
                      ...editingProduct,
                      spiceLevel: val as SpiceLevel,
                    })
                  }
                  options={[
                    { value: 'romantic', label: '🌸 Romantik & Zarif' },
                    { value: 'seductive', label: '🔥 Çekici & İddialı' },
                    {
                      value: 'daring',
                      label: '🖤 Cesur / After Dark (Naughty)',
                    },
                  ]}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Satış Fiyatı (TL)</label>
                <input
                  type="number"
                  required
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  İndirim Öncesi Fiyat (TL)
                </label>
                <input
                  type="number"
                  value={editingProduct.compareAtPrice || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      compareAtPrice: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Ürün Açıklaması</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                />
              </div>
            </div>

            {/* Media Gallery Manager inside Edit Modal */}
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-sm block">
                    Ürün Görsel & Video Galerisi ({editingProduct.media.length} Adet)
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    İstediğiniz fotoğrafı &ldquo;Kapak Yap&rdquo; ile vitrin ana görseli yapabilir, silebilir veya yeni fotoğraf/video yükleyebilirsiniz.
                  </span>
                </div>

                <label className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-semibold flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {uploadingFiles ? 'Yükleniyor...' : '+ Yeni Fotoğraf/Video Yükle'}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(
                        e.target.files,
                        editingProduct.slug,
                        (uploaded) =>
                          setEditingProduct({
                            ...editingProduct,
                            media: [...editingProduct.media, ...uploaded],
                          })
                      )
                    }
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {editingProduct.media.map((med, idx) => (
                  <div
                    key={med.id || idx}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2 space-y-2"
                  >
                    <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-black/10">
                      {med.type === 'video' ? (
                        <video
                          src={med.url}
                          poster={med.posterUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          autoPlay
                          playsInline
                        />
                      ) : (
                        <img
                          src={med.url}
                          alt={med.alt}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-[var(--accent-primary)] text-white text-[10px] font-bold">
                          Ana Kapak
                        </span>
                      )}
                      {med.type === 'video' && (
                        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] flex items-center gap-1">
                          <Play className="w-2.5 h-2.5 fill-white" /> Video
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[10px]">
                      {idx !== 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            const list = [...editingProduct.media];
                            const [picked] = list.splice(idx, 1);
                            list.unshift(picked);
                            setEditingProduct({ ...editingProduct, media: list });
                          }}
                          className="font-semibold text-[var(--accent-primary)] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Star className="w-3 h-3" /> Kapak Yap
                        </button>
                      ) : (
                        <span className="text-emerald-500 font-semibold">
                          ✓ 1. Sıra
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setEditingProduct({
                            ...editingProduct,
                            media: editingProduct.media.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-red-500 hover:underline cursor-pointer"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add by URL */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <LuxurySelect
                  value={customMediaType}
                  onChange={(val) =>
                    setCustomMediaType(val as 'image' | 'video')
                  }
                  className="min-w-[175px]"
                  options={[
                    { value: 'image', label: 'Fotoğraf Yolu/URL' },
                    { value: 'video', label: 'Video Yolu/URL' },
                  ]}
                />
                <input
                  type="text"
                  value={customMediaUrl}
                  onChange={(e) => setCustomMediaUrl(e.target.value)}
                  placeholder="/images/products/... veya https://..."
                  className="flex-1 p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!customMediaUrl.trim()) return;
                    setEditingProduct({
                      ...editingProduct,
                      media: [
                        ...editingProduct.media,
                        {
                          id: `med-${Date.now()}`,
                          type: customMediaType,
                          url: customMediaUrl.trim(),
                          alt: editingProduct.name,
                        },
                      ],
                    });
                    setCustomMediaUrl('');
                  }}
                  className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] font-semibold cursor-pointer"
                >
                  + Galeriye Ekle
                </button>
              </div>
            </div>

            {/* Variants & Stock inside Edit Modal */}
            <div>
              <label className="block font-semibold mb-2">
                Beden Stokları & SKU Kodları
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {editingProduct.variants.map((v, idx) => (
                  <div
                    key={v.size}
                    className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{v.size} Beden</span>
                    </div>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => {
                        const updated = [...editingProduct.variants];
                        updated[idx] = { ...v, sku: e.target.value };
                        setEditingProduct({
                          ...editingProduct,
                          variants: updated,
                        });
                      }}
                      className="w-full p-1.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-canvas)] font-mono text-[10px]"
                    />
                    <input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) => {
                        const updated = [...editingProduct.variants];
                        updated[idx] = {
                          ...v,
                          stock: Math.max(0, Number(e.target.value)),
                        };
                        setEditingProduct({
                          ...editingProduct,
                          variants: updated,
                        });
                      }}
                      className="w-full p-1.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-canvas)] font-bold text-center"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-5 py-2.5 rounded-full border border-[var(--border-subtle)] font-semibold cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-7 py-2.5 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white font-semibold cursor-pointer"
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discreet Shipping Label Modal Preview */}
      {labelPreviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
          <div className="max-w-md w-full rounded-2xl bg-white text-black p-6 space-y-4 shadow-2xl">
            <div className="border-b-2 border-black pb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase">
                  GİZLİ PAKETLEME KARGO BARKODU
                </p>
                <h3 className="text-base font-bold">
                  GÖNDERİCİ: VSP LOJİSTİK TEKSTİL DEPO
                </h3>
              </div>
              <span className="px-2 py-1 bg-black text-white text-xs font-mono font-bold">
                #{labelPreviewOrder.orderNumber}
              </span>
            </div>

            <div className="text-xs space-y-1.5">
              <p>
                <strong>ALICI:</strong> {labelPreviewOrder.customer.fullName}
              </p>
              <p>
                <strong>TELEFON:</strong> {labelPreviewOrder.customer.phone}
              </p>
              <p>
                <strong>ADRES:</strong> {labelPreviewOrder.customer.addressLine}{' '}
                — {labelPreviewOrder.customer.district} /{' '}
                {labelPreviewOrder.customer.city}
              </p>
              <p className="pt-2 text-[11px] text-gray-600 border-t">
                * Gizlilik İlkesi Gereği Paket Üzerinde Ürün İçeriği veya Mağaza Adı Yer Almaz.
              </p>
            </div>

            <div className="py-3 bg-gray-100 text-center font-mono text-sm tracking-[0.3em] border">
              ||| |||| || ||||| |||| |||
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-black text-white text-xs font-semibold cursor-pointer"
              >
                Yazdır
              </button>
              <button
                type="button"
                onClick={() => setLabelPreviewOrder(null)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
