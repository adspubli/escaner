import { useState } from 'react';
import { Download, PackageOpen, BarChart3 } from 'lucide-react';
import { ProductScanner } from './components/ProductScanner';
import { ProductTable } from './components/ProductTable';
import { ProductDetails } from './components/ProductDetails';
import { exportToCSV } from './utils/csvExport';
import { fetchProductData } from './services/productService';
import type { Product } from './types/product';

function App() {
  const [scannedProducts, setScannedProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = async (upc: string) => {
    setIsLoading(true);
    try {
      const product = await fetchProductData(upc);

      if (!product) {
        alert(`Producto con código ${upc} no encontrado. Verifica el código.`);
        setCurrentProduct(null);
        return;
      }

      setCurrentProduct(product);

      const existingIndex = scannedProducts.findIndex(p => p.barcode === product.barcode);
      if (existingIndex === -1) {
        setScannedProducts([...scannedProducts, product]);
      } else {
        alert(`El producto "${product.name}" ya está en el lote.`);
      }
    } catch (error) {
      alert('Error al buscar el producto. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveProduct = (index: number) => {
    setScannedProducts(scannedProducts.filter((_, i) => i !== index));
  };

  const handleExport = () => {
    if (scannedProducts.length === 0) return;
    exportToCSV(scannedProducts);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-3">
            <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600 mr-2" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">
              Analizador de Lotes
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-600">Búsqueda rápida por UPC/EAN</p>
        </header>

        <ProductScanner
          onScan={handleScan}
          isLoading={isLoading}
        />

        {currentProduct && (
          <ProductDetails product={currentProduct} />
        )}

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center">
              <PackageOpen className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mr-2" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800">
                Productos
                <span className="text-orange-600 ml-1">({scannedProducts.length})</span>
              </h2>
            </div>
            <button
              onClick={handleExport}
              disabled={scannedProducts.length === 0}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg w-full sm:w-auto justify-center active:scale-95"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Generar Excel</span>
            </button>
          </div>

          <ProductTable
            products={scannedProducts}
            onRemove={handleRemoveProduct}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
