import { Product } from '../types/product';
import { Trash2, Package } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onRemove: (id: string) => void;
}

export function ProductList({ products, onRemove }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <Package size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay productos escaneados</h3>
        <p className="text-gray-500">Escanea un código de barras para comenzar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600">
        <h3 className="text-xl font-bold text-white">
          Productos Escaneados ({products.length})
        </h3>
      </div>

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {products.map((product) => (
          <div
            key={product.id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="font-medium">
                    Precio: <span className="text-green-600">{product.averagePrice}</span>
                  </span>
                  <span>Categoría: {product.category}</span>
                  <span className="font-mono">UPC: {product.barcode}</span>
                </div>
              </div>

              <button
                onClick={() => onRemove(product.id)}
                className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar producto"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
