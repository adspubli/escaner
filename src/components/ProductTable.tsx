import type { Product } from '../types/product';
import { Trash2 } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onRemove: (index: number) => void;
}

export function ProductTable({ products, onRemove }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center text-slate-500 py-8 text-sm">Aún no hay productos escaneados.</div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-2 sm:mx-0">
      <table className="min-w-full text-sm sm:text-base border-separate border-spacing-y-2">
        <thead>
          <tr className="text-left text-slate-600">
            <th className="px-3 py-2 font-semibold">#</th>
            <th className="px-3 py-2 font-semibold">Código</th>
            <th className="px-3 py-2 font-semibold">Nombre</th>
            <th className="px-3 py-2 font-semibold">Categoría</th>
            <th className="px-3 py-2 font-semibold">Precio</th>
            <th className="px-3 py-2 font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={p.id} className="bg-white shadow-sm hover:shadow rounded-lg">
              <td className="px-3 py-2 align-top text-slate-500 w-10">{i + 1}</td>
              <td className="px-3 py-2 align-top font-mono text-slate-700 break-all">{p.barcode}</td>
              <td className="px-3 py-2 align-top text-slate-800 font-medium max-w-xs break-words">{p.name}</td>
              <td className="px-3 py-2 align-top text-slate-600">{p.category}</td>
              <td className="px-3 py-2 align-top text-slate-700">{p.averagePrice}</td>
              <td className="px-3 py-2 align-top">
                <button
                  onClick={() => onRemove(i)}
                  className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
