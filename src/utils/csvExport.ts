import { Product } from '../types/product';

export function exportToCSV(products: Product[]): void {
  if (products.length === 0) {
    alert('No products to export');
    return;
  }

  // CSV header
  const headers = ['Nombre', 'Descripción', 'Precio Promedio', 'Categoría', 'Código de Barras'];

  // Convert products to CSV rows
  const rows = products.map(product => [
    escapeCSV(product.name),
    escapeCSV(product.description),
    escapeCSV(product.averagePrice),
    escapeCSV(product.category),
    escapeCSV(product.barcode),
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `productos_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
