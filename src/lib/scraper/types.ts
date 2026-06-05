/**
 * Domain types for the Cena Radar data model.
 * Money is stored in haléře (1/100 CZK) to avoid float drift.
 */

export type Currency = "CZK";

export type Money = {
  amount: number;
  currency: Currency;
  formatted: string;
  perUnit?: string;
};

export type Category = {
  slug: string;
  name: string;
  subcategory?: { slug: string; name: string };
};

export type ShopRef = {
  slug: string;
  name: string;
  logoUrl?: string;
};

export type Offer = {
  shop: ShopRef;
  price: Money;
  /**
   * Per-unit price (e.g. "5,75 Kč / 1 ks") normalized to haléře.
   * When defined, this is the real apples-to-apples comparison value.
   */
  perUnitPrice?: Money;
  /** Pack size hint from the source, e.g. "1-ks", "216-ks". */
  packKey?: string;
  /** Free-text caveat from the merchant, e.g. "akce při koupi 2 balení". */
  note?: string;
  validUntil: string;
  leafletId?: number;
  leafletName?: string;
  leafletUrl?: string;
};

export type ProductSummary = {
  slug: string;
  name: string;
  category: Category;
  cheapestPrice: Money;
  sourceUrl: string;
  shopCount: number;
  updatedAt: string;
  imageUrl?: string;
  /** Source image dimensions in pixels, used for masonry aspect ratios. */
  imageWidth?: number;
  /** Source image dimensions in pixels, used for masonry aspect ratios. */
  imageHeight?: number;
};

export type ProductDetail = ProductSummary & {
  offers: Offer[];
  description?: string;
  imageUrl?: string;
};

export type ProductsIndex = {
  products: ProductSummary[];
  categories: { slug: string; name: string; count: number }[];
  shopCount: number;
  generatedAt: string;
};

export type SearchResult = {
  product: ProductSummary;
  score: number;
};
