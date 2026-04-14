export interface Page {
  id: string;
  content: string;
  chapterTitle: string;
  pageNumber: number;
  createdAt: string;
}

export interface Chapter {
  title: string;
  pages: Page[];
}

export interface Book {
  title: string;
  chapters: Chapter[];
  totalPages: number;
}

export interface ProcessTextRequest {
  rawText: string;
}

export interface ProcessTextResponse {
  status: string;
  placement: PlacementResult;
  page: Page;
}

export interface PlacementResult {
  action: 'append' | 'insert' | 'new_chapter';
  chapterTitle: string;
  pageContent: string;
  previousPageIndex?: number;
}

// ─── E-Commerce Types ───────────────────────────────────────

export interface CartItem {
  productId: number;
  name: string;
  article: string;
  price: number;
  quantity: number;
  tax: number;
}

export interface SaleTransaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  taxTotal: number;
  discount?: number;
  couponCode?: string;
  total: number;
  paymentMethod: string;
  timestamp: string;
  customerName?: string;
  customerPhone?: string;
  channel: 'pos' | 'online';
  status: 'completed' | 'pending' | 'processing' | 'shipped' | 'delivered';
}

// ─── Party & Deal Types ──────────────────────────────────────

export interface DealEntry {
  id: string;
  date: string; // ISO string
  description: string;
  dealAmount: number;
  paidAmount: number;
  type: 'deal' | 'payment';
}

export interface Party {
  id: string;
  name: string;
  owner: string;
  entries: DealEntry[];
  createdAt: string;
}

