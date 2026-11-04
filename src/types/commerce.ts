export type SpiceLevel = 'romantic' | 'seductive' | 'daring';

export type CategorySlug =
  | 'sutyen-takimlari'
  | 'bustiyer-korse'
  | 'jartiyer-setleri'
  | 'babydoll-gecelik'
  | 'bodysuit-tulum'
  | 'vucut-coraplari';

export interface ProductMedia {
  id: string;
  type: 'image' | 'video'; // video acts as high-res auto-looping GIF replacement
  url: string;
  posterUrl?: string;
  alt: string;
  caption?: string;
}

export interface SizeVariant {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
  sku: string;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: CategorySlug;
  categoryName: string;
  price: number;
  compareAtPrice?: number;
  currency: 'TRY';
  spiceLevel: SpiceLevel;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isAfterDarkExclusive?: boolean;
  description: string;
  fabricDetails: string[];
  modelMeasurements: string;
  hygieneSealRequired: boolean;
  media: ProductMedia[];
  variants: SizeVariant[];
  createdAt: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
  quantity: number;
  imageUrl: string;
  maxStock: number;
}

export type OrderStatus =
  | 'paid'
  | 'preparing'
  | 'shipped_discreet'
  | 'delivered'
  | 'cancelled';

export interface OrderCustomer {
  isGuest: boolean;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  addressLine: string;
  discreetPackagingConfirmed: boolean;
  giftMysteryNote?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  paymentProvider: 'shopier' | 'iyzico' | 'paytr';
  paymentTransactionId: string;
  installmentCount: number;
  status: OrderStatus;
  trackingCode?: string;
  createdAt: string;
}

export interface StoreUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  isAdmin?: boolean;
  createdAt?: string;
  savedAddress?: {
    city: string;
    district: string;
    addressLine: string;
  };
}

