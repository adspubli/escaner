import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { CameraScanner } from './CameraScanner';

interface ProductScannerProps {
  onScan: (code: string) => void;
  isLoading?: boolean;
}

export function ProductScanner({ onScan, isLoading }: ProductScannerProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    onScan(code);
    setManualCode('');
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-slate-200 mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4">
        <Camera className="w-5 h-5 text-orange-600" /> Escaneo
      </h2>
      <p className="text-slate-600 text-sm mb-4">Escanea con cámara o ingresa un código manual (UPC/EAN).</p>
      <div className="flex flex-col sm:flex-row gap-4 mb-5">
        <button
          type="button"
            onClick={() => setShowScanner(true)}
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-700 transition-all shadow active:scale-95 flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          Abrir Cámara
        </button>
      </div>
      <form onSubmit={submitManual} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Código manual"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!manualCode.trim() || isLoading}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Agregar
        </button>
      </form>
      <p className="text-[11px] text-slate-400 mt-3">Requiere HTTPS en móviles para acceso a cámara (iOS).</p>
      {showScanner && (
        <CameraScanner
          onScan={(code) => {
            onScan(code);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
