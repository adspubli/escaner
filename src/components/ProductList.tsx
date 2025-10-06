import { Product } from '../types/product';
import { Trash2, Package } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onRemove: (id: string) => void;
}

export function ProductList({ products, onRemove }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <Package size={64} className="mx-auto text-gray-400 mb-6" />
        <h3 className="text-2xl font-bold text-gray-700 mb-3">No hay productos escaneados</h3>
        <p className="text-gray-500 text-lg">Escanea un código de barras para comenzar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-blue-500 to-blue-600">
        <h3 className="text-2xl font-bold text-white">
          Productos Escaneados ({products.length})
        </h3>
      </div>

      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {products.map((product) => (
          <div
            key={product.id}
            className="p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-3">
                <h4 className="text-xl font-bold text-gray-900">{product.name}</h4>

                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-700 mb-1">PRECIO</p>
                  <p className="text-4xl font-bold text-green-600">{product.averagePrice}</p>
                </div>

                <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-700 mb-1">CÓDIGO UPC</p>
                  <p className="text-3xl font-mono font-bold text-blue-600">{product.barcode}</p>
                </div>

                <div className="pt-2">
                  <p className="text-base text-gray-600 mb-2">{product.description}</p>
                  <p className="text-base text-gray-500">
                    <span className="font-semibold">Categoría:</span> {product.category}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onRemove(product.id)}
                className="flex-shrink-0 p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar producto"
              >
                <Trash2 size={24} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
