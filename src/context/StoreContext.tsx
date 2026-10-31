'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CartItem,
  Order,
  OrderCustomer,
  OrderStatus,
  Product,
  StoreUser,
} from '@/types/commerce';
import { INITIAL_ORDERS, INITIAL_PRODUCTS } from '@/data/initial-catalog';

interface StoreContextType {
  // Theme (Boudoir / After Dark Mode)
  isAfterDark: boolean;
  toggleAfterDark: () => void;

  // Products & Inventory (Server DB + CMS + Stock)
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (updatedProduct: Product) => void;
  deleteProduct: (id: string) => void;
  updateVariantStock: (
    productId: string,
    size: 'XS' | 'S' | 'M' | 'L' | 'XL',
    newStock: number
  ) => void;
  resetToInitialProducts: () => void;

  // Cart & Slide-over Drawer
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  giftMysteryNote: string;
  setGiftMysteryNote: (note: string) => void;
  addToCart: (
    product: Product,
    size: 'XS' | 'S' | 'M' | 'L' | 'XL',
    quantity?: number
  ) => { ok: boolean; message: string };
  removeFromCart: (productId: string, size: 'XS' | 'S' | 'M' | 'L' | 'XL') => void;
  updateCartQuantity: (
    productId: string,
    size: 'XS' | 'S' | 'M' | 'L' | 'XL',
    quantity: number
  ) => void;
  cartSubtotal: number;
  shippingCost: number;
  freeShippingThreshold: number;

  // Auth (Member, Guest, or Admin)
  currentUser: StoreUser | null;
  users: StoreUser[];
  isAdmin: boolean;
  loginUser: (email: string, fullName?: string) => void;
  authenticateUser: (
    email: string,
    password: string
  ) => { ok: boolean; error?: string };
  registerUser: (params: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  resetUserPassword: (
    email: string,
    newPassword: string
  ) => Promise<{ ok: boolean; error?: string }>;
  loginAdmin: (email: string, password: string) => boolean;
  logoutUser: () => void;

  // Orders & Checkout
  orders: Order[];
  createOrder: (params: {
    customer: OrderCustomer;
    paymentProvider: 'iyzico' | 'paytr';
    installmentCount: number;
  }) => { ok: boolean; order?: Order; error?: string };
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    trackingCode?: string
  ) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'vesper_products_v3',
  CART: 'vesper_cart_v3',
  ORDERS: 'vesper_orders_v3',
  USER: 'vesper_user_v3',
  THEME: 'vesper_after_dark_v3',
};

export const FREE_SHIPPING_THRESHOLD = 1500;
export const STANDARD_SHIPPING_COST = 89;

async function syncServerStore(payload: Record<string, unknown>) {
  try {
    await fetch('/api/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Failed to sync with /api/store:', err);
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isAfterDark, setIsAfterDark] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [giftMysteryNote, setGiftMysteryNote] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [users, setUsers] = useState<StoreUser[]>([]);
  const [currentUser, setCurrentUser] = useState<StoreUser | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);

  // Hydrate from Server Database (/api/store) + localStorage for cart/theme/user
  useEffect(() => {
    let mounted = true;

    async function initStore() {
      try {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        if (savedTheme !== null) {
          const dark = JSON.parse(savedTheme);
          setIsAfterDark(dark);
          document.documentElement.setAttribute(
            'data-theme',
            dark ? 'after-dark' : 'daylight'
          );
        }

        const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }

        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }

        // Fetch authoritative products & orders from server database.json
        const res = await fetch('/api/store', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            if (Array.isArray(data.products) && data.products.length > 0) {
              setProducts(data.products);
              localStorage.setItem(
                STORAGE_KEYS.PRODUCTS,
                JSON.stringify(data.products)
              );
            }
            if (Array.isArray(data.orders)) {
              setOrders(data.orders);
              localStorage.setItem(
                STORAGE_KEYS.ORDERS,
                JSON.stringify(data.orders)
              );
            }
            if (Array.isArray(data.users)) {
              setUsers(data.users);
            }
          }
        }
      } catch (err) {
        console.error('Store initialization error:', err);
      } finally {
        if (mounted) setHydrated(true);
      }
    }

    initStore();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser, hydrated]);

  const toggleAfterDark = () => {
    setIsAfterDark((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(next));
      document.documentElement.setAttribute(
        'data-theme',
        next ? 'after-dark' : 'daylight'
      );
      return next;
    });
  };

  const addProduct = (newProd: Omit<Product, 'id' | 'createdAt'>): Product => {
    const created: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => {
      const next = [created, ...prev];
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(next));
      syncServerStore({ action: 'add_product', product: created });
      return next;
    });
    return created;
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) => {
      const next = prev.map((p) =>
        p.id === updatedProduct.id ? updatedProduct : p
      );
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(next));
      syncServerStore({ action: 'update_product', product: updatedProduct });
      return next;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(next));
      syncServerStore({ action: 'delete_product', productId: id });
      return next;
    });
  };

  const resetToInitialProducts = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.setItem(
      STORAGE_KEYS.PRODUCTS,
      JSON.stringify(INITIAL_PRODUCTS)
    );
    syncServerStore({ action: 'reset_catalog' });
  };

  const updateVariantStock = (
    productId: string,
    size: 'XS' | 'S' | 'M' | 'L' | 'XL',
    newStock: number
  ) => {
    const safeStock = Math.max(0, Math.floor(newStock));
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id !== productId) return p;
        const updated = {
          ...p,
          variants: p.variants.map((v) =>
            v.size === size ? { ...v, stock: safeStock } : v
          ),
        };
        syncServerStore({ action: 'update_product', product: updated });
        return updated;
      });
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(next));
      return next;
    });
  };

  const addToCart = (
    product: Product,
    size: 'XS' | 'S' | 'M' | 'L' | 'XL',
    quantity = 1
  ): { ok: boolean; message: string } => {
    const variant = product.variants.find((v) => v.size === size);
    if (!variant || variant.stock <= 0) {
      return { ok: false, message: 'Seçilen beden stokta tükenmiştir.' };
    }

    const existing = cart.find(
      (item) => item.productId === product.id && item.size === size
    );
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty + quantity > variant.stock) {
      return {
        ok: false,
        message: `Bu bedende stokta yalnızca ${variant.stock} adet bulunmaktadır.`,
      };
    }

    const primaryImage =
      product.media.find((m) => m.type === 'image')?.url ||
      product.media[0]?.posterUrl ||
      product.media[0]?.url ||
      '';

    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.productId === product.id && item.size === size
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + quantity,
          maxStock: variant.stock,
        };
        return updated;
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          size,
          quantity,
          imageUrl: primaryImage,
          maxStock: variant.stock,
        },
      ];
    });

    setIsCartOpen(true);
    return { ok: true, message: 'Ürün gizli sepetinize eklendi.' };
  };

  const removeFromCart = (
    productId: string,
    size: 'XS' | 'S' | 'M' | 'L' | 'XL'
  ) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.size === size))
    );
  };

  const updateCartQuantity = (
    productId: string,
    size: 'XS' | 'S' | 'M' | 'L' | 'XL',
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.size === size) {
          return {
            ...item,
            quantity: Math.min(quantity, item.maxStock),
          };
        }
        return item;
      })
    );
  };

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost =
    cartSubtotal === 0 || cartSubtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : STANDARD_SHIPPING_COST;

  const loginUser = (email: string, fullName = 'Zeynep Aydın') => {
    const isAdminEmail =
      email.trim().toLowerCase() === 'admin@vesperbody.com' ||
      email.trim().toLowerCase() === 'admin@velours.com';
    setCurrentUser({
      id: `usr-${Date.now()}`,
      email: email.trim(),
      fullName: isAdminEmail ? 'VESPER Mağaza Yöneticisi' : fullName,
      phone: '0533 900 12 34',
      isAdmin: isAdminEmail,
      savedAddress: {
        city: 'İstanbul',
        district: 'Beşiktaş',
        addressLine: 'Bebek Mah. Cevdetpaşa Cad. No: 42 D: 8',
      },
    });
  };

  const authenticateUser = (
    email: string,
    password: string
  ): { ok: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (
      (cleanEmail === 'admin@vesperbody.com' || cleanEmail === 'admin') &&
      (password === 'vesper2026' || password === 'admin123')
    ) {
      setCurrentUser({
        id: 'usr-admin-1',
        email: 'admin@vesperbody.com',
        fullName: 'VESPER Mağaza Yöneticisi',
        phone: '0532 100 00 00',
        isAdmin: true,
      });
      return { ok: true };
    }

    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return {
        ok: false,
        error:
          'Bu e-posta adresine ait hesap bulunamadı. Lütfen önce "Kayıt Ol" ile hesap oluşturun.',
      };
    }

    if (found.password && found.password !== password) {
      return {
        ok: false,
        error: 'Girdiğiniz şifre hatalı. Şifrenizi unuttuysanız sıfırlayabilirsiniz.',
      };
    }

    setCurrentUser(found);
    return { ok: true };
  };

  const registerUser = async ({
    fullName,
    email,
    phone,
    password,
  }: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return {
        ok: false,
        error: 'Bu e-posta adresi ile kayıtlı bir hesap zaten mevcut.',
      };
    }

    const newUser: StoreUser = {
      id: `usr-${Date.now()}`,
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: phone.trim() || '0532 000 00 00',
      password,
      isAdmin: cleanEmail === 'admin@vesperbody.com',
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register_user', user: newUser }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        return { ok: false, error: data.error || 'Kayıt işlemi başarısız.' };
      }
      if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers((prev) => [newUser, ...prev]);
      }
    } catch {
      setUsers((prev) => [newUser, ...prev]);
    }

    setCurrentUser(newUser);
    return { ok: true };
  };

  const resetUserPassword = async (
    email: string,
    newPassword: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          email: cleanEmail,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        return {
          ok: false,
          error:
            data.error ||
            'Bu e-posta adresine kayıtlı bir kullanıcı bulunamadı.',
        };
      }
      if (Array.isArray(data.users)) {
        setUsers(data.users);
      }
      return { ok: true };
    } catch {
      return { ok: false, error: 'Sunucu bağlantı hatası.' };
    }
  };

  const loginAdmin = (email: string, password: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    if (
      (cleanEmail === 'admin@vesperbody.com' || cleanEmail === 'admin') &&
      (password === 'vesper2026' || password === 'admin123')
    ) {
      setCurrentUser({
        id: 'usr-admin-1',
        email: 'admin@vesperbody.com',
        fullName: 'VESPER Mağaza Yöneticisi',
        phone: '0532 100 00 00',
        isAdmin: true,
      });
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const createOrder = ({
    customer,
    paymentProvider,
    installmentCount,
  }: {
    customer: OrderCustomer;
    paymentProvider: 'iyzico' | 'paytr';
    installmentCount: number;
  }): { ok: boolean; order?: Order; error?: string } => {
    if (cart.length === 0) {
      return { ok: false, error: 'Sepetiniz boş.' };
    }

    for (const item of cart) {
      const prod = products.find((p) => p.id === item.productId);
      const variant = prod?.variants.find((v) => v.size === item.size);
      if (!prod || !variant || variant.stock < item.quantity) {
        return {
          ok: false,
          error: `${item.name} (${item.size} Beden) için yeterli stok kalmadı.`,
        };
      }
    }

    const updatedProducts = products.map((prod) => {
      const cartItemsForProd = cart.filter((c) => c.productId === prod.id);
      if (cartItemsForProd.length === 0) return prod;
      return {
        ...prod,
        variants: prod.variants.map((v) => {
          const match = cartItemsForProd.find((c) => c.size === v.size);
          if (!match) return v;
          return { ...v, stock: Math.max(0, v.stock - match.quantity) };
        }),
      };
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `VSP-${Math.floor(10000 + Math.random() * 90000)}`,
      customer: {
        ...customer,
        giftMysteryNote:
          customer.giftMysteryNote || giftMysteryNote || undefined,
      },
      items: [...cart],
      subtotal: cartSubtotal,
      shippingCost,
      totalAmount: cartSubtotal + shippingCost,
      paymentProvider,
      paymentTransactionId: `${paymentProvider.toUpperCase()}-${Math.floor(
        10000000 + Math.random() * 90000000
      )}`,
      installmentCount,
      status: 'paid',
      createdAt: new Date().toISOString(),
    };

    setProducts(updatedProducts);
    setOrders((prev) => {
      const nextOrders = [newOrder, ...prev];
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(nextOrders));
      return nextOrders;
    });
    localStorage.setItem(
      STORAGE_KEYS.PRODUCTS,
      JSON.stringify(updatedProducts)
    );

    syncServerStore({
      action: 'create_order',
      order: newOrder,
      products: updatedProducts,
    });

    setCart([]);
    setGiftMysteryNote('');
    setIsCartOpen(false);

    return { ok: true, order: newOrder };
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    trackingCode?: string
  ) => {
    const existingOrder = orders.find((o) => o.id === orderId);
    if (!existingOrder) return;

    const wasCancelled = existingOrder.status === 'cancelled';
    const willBeCancelled = status === 'cancelled';

    // Automatic stock restoration on order cancellation (or re-deduction if un-cancelled)
    if (!wasCancelled && willBeCancelled) {
      setProducts((prevProducts) => {
        const restored = prevProducts.map((prod) => {
          const orderItemsForProd = existingOrder.items.filter(
            (i) => i.productId === prod.id
          );
          if (orderItemsForProd.length === 0) return prod;
          return {
            ...prod,
            variants: prod.variants.map((v) => {
              const match = orderItemsForProd.find((i) => i.size === v.size);
              if (!match) return v;
              return { ...v, stock: v.stock + match.quantity };
            }),
          };
        });
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(restored));
        syncServerStore({ action: 'sync_products', products: restored });
        return restored;
      });
    } else if (wasCancelled && !willBeCancelled) {
      setProducts((prevProducts) => {
        const deducted = prevProducts.map((prod) => {
          const orderItemsForProd = existingOrder.items.filter(
            (i) => i.productId === prod.id
          );
          if (orderItemsForProd.length === 0) return prod;
          return {
            ...prod,
            variants: prod.variants.map((v) => {
              const match = orderItemsForProd.find((i) => i.size === v.size);
              if (!match) return v;
              return { ...v, stock: Math.max(0, v.stock - match.quantity) };
            }),
          };
        });
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(deducted));
        syncServerStore({ action: 'sync_products', products: deducted });
        return deducted;
      });
    }

    setOrders((prev) => {
      const next = prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              trackingCode:
                trackingCode !== undefined ? trackingCode : o.trackingCode,
            }
          : o
      );
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(next));
      syncServerStore({ action: 'update_orders', orders: next });
      return next;
    });
  };

  const isAdmin = Boolean(currentUser?.isAdmin);

  return (
    <StoreContext.Provider
      value={{
        isAfterDark,
        toggleAfterDark,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        updateVariantStock,
        resetToInitialProducts,
        cart,
        isCartOpen,
        setIsCartOpen,
        giftMysteryNote,
        setGiftMysteryNote,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        cartSubtotal,
        shippingCost,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        currentUser,
        users,
        isAdmin,
        loginUser,
        authenticateUser,
        registerUser,
        resetUserPassword,
        loginAdmin,
        logoutUser,
        orders,
        createOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
