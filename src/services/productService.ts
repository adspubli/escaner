import { lookupBarcode } from './upcApi';
import type { Product } from '../types/product';

export async function fetchProductData(upc: string): Promise<Product | null> {
  return lookupBarcode(upc);
}
