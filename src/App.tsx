import { useState } from 'react';
import { BarcodeScanner } from './components/BarcodeScanner';
import { ProductList } from './components/ProductList';
import { lookupBarcode } from './services/upcApi';
import { exportToCSV } from './utils/csvExport';
import { Product } from './types/product';
import { Download, Barcode, Loader2 } from 'lucide-react';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleScan = async (barcode: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const product = await lookupBarcode(barcode);

      if (product) {
        setProducts((prev) => [product, ...prev]);
        setMessage({ type: 'success', text: `Producto agregado: ${product.name}` });
      } else {
        setMessage({ type: 'error', text: 'No se encontró información del producto' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al buscar el producto. Intenta nuevamente.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleRemoveProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleExportCSV = () => {
    exportToCSV(products);
  };

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los productos?')) {
      setProducts([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Barcode size={56} className="text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Escáner de Códigos de Barras</h1>
          </div>
          <p className="text-gray-600 text-xl">
            Escanea productos y exporta la información a CSV
          </p>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="fixed top-6 right-6 bg-white rounded-lg shadow-lg p-5 flex items-center gap-3 z-50">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="font-bold text-gray-700 text-lg">Buscando producto...</span>
          </div>
        )}

        {/* Message Alert */}
        {message && (
          <div
            className={`fixed top-6 left-1/2 transform -translate-x-1/2 rounded-lg shadow-lg p-5 z-50 max-w-lg w-full mx-4 border-2 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-300 text-green-800'
                : 'bg-red-50 border-red-300 text-red-800'
            }`}
          >
            <p className="font-bold text-lg">{message.text}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Scanner Section */}
          <BarcodeScanner onScan={handleScan} />

          {/* Products Section */}
          <div>
            <ProductList products={products} onRemove={handleRemoveProduct} />

            {/* Action Buttons */}
            {products.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleExportCSV}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xl font-bold transition-colors shadow-lg"
                >
                  <Download size={28} />
                  Exportar a CSV
                </button>
                <button
                  onClick={handleClearAll}
                  className="sm:w-auto px-8 py-5 bg-gray-500 hover:bg-gray-600 text-white rounded-xl text-xl font-bold transition-colors shadow-lg"
                >
                  Limpiar Todo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-base text-gray-500">
          <p>Los datos de productos se obtienen de UPC Item Database</p>
        </div>
      </div>
    </div>
  );
}

export default App;
