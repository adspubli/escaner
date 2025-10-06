import { UPCApiResponse, Product } from '../types/product';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upc-lookup`;

export async function lookupBarcode(barcode: string): Promise<Product | null> {
  try {
    const response = await fetch(`${EDGE_FUNCTION_URL}?upc=${barcode}`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data: UPCApiResponse = await response.json();

    if (data.items && data.items.length > 0) {
      const item = data.items[0];

      // Calculate average price
      let averagePrice = 'N/A';
      if (item.offers && item.offers.length > 0) {
        const prices = item.offers.map(offer => offer.price).filter(p => p > 0);
        if (prices.length > 0) {
          const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
          averagePrice = `$${avg.toFixed(2)}`;
        }
      } else if (item.lowest_recorded_price && item.highest_recorded_price) {
        const avg = (item.lowest_recorded_price + item.highest_recorded_price) / 2;
        averagePrice = `$${avg.toFixed(2)}`;
      }

      return {
        id: `${barcode}-${Date.now()}`,
        name: item.title || 'Unknown Product',
        description: item.description || item.brand || item.model || 'No description available',
        averagePrice,
        category: item.category || 'Uncategorized',
        barcode: barcode,
      };
    }

    return null;
  } catch (error) {
    console.error('Error looking up barcode:', error);
    throw error;
  }
}
