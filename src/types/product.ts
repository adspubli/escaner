export interface Product {
  id: string;
  name: string;
  description: string;
  averagePrice: string;
  category: string;
  barcode: string;
}

export interface UPCApiResponse {
  code: string;
  total: number;
  offset: number;
  items: Array<{
    ean: string;
    title: string;
    description?: string;
    upc?: string;
    brand?: string;
    model?: string;
    color?: string;
    size?: string;
    dimension?: string;
    weight?: string;
    category?: string;
    currency?: string;
    lowest_recorded_price?: number;
    highest_recorded_price?: number;
    images?: string[];
    offers?: Array<{
      merchant: string;
      domain: string;
      title: string;
      currency: string;
      list_price: string;
      price: number;
      shipping: string;
      condition: string;
      availability: string;
      link: string;
      updated_t: number;
    }>;
  }>;
}
