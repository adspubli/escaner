import type { Product } from '../types/product';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-slate-200 mb-8">
      <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Detalles del Producto</h2>
      <div className="grid md:grid-cols-2 gap-4 text-sm sm:text-base">
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Nombre</p>
          <p className="font-semibold text-slate-800 break-words">{product.name}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Código</p>
          <p className="font-mono text-slate-700">{product.barcode}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Descripción</p>
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
            {product.description || 'Sin descripción'}
          </p>
        </div>
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Categoría</p>
          <p className="text-slate-700">{product.category}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Precio Promedio</p>
          <p className="text-slate-700 font-semibold">{product.averagePrice}</p>
        </div>
      </div>
    </div>
  );
}
