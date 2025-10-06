import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface CameraScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

// Valida longitud típica de códigos de barras estándares (UPC-A 12, EAN-13 13)
function isLikelyBarcode(value: string) {
  const v = value.trim();
  return /^\d{12,13}$/.test(v);
}

export function CameraScanner({ onScan, onClose }: CameraScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const scanner = new Html5Qrcode('reader', {
      experimentalFeatures: { useBarCodeDetectorIfSupported: true },
      verbose: false,
    });
    scannerRef.current = scanner;

    let stopped = false;

    const startScanner = async () => {
      try {
        setIsScanning(true);
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 12,
            qrbox: { width: 260, height: 200 },
            aspectRatio: 1.7778,
            // Nota: formatsToSupport no está tipado en la versión instalada. Si se actualiza la librería, se puede reintroducir.
          },
          (decodedText) => {
            const cleanCode = decodedText.trim();
            if (isLikelyBarcode(cleanCode)) {
              onScan(cleanCode);
              stopScanner();
            }
          },
          () => {
            // Frame error ignorado
          }
        );
      } catch (err) {
        if (!stopped) {
          setError('No se pudo acceder a la cámara. Verifica permisos / HTTPS.');
          console.error('Error al iniciar el escáner:', err);
        }
      }
    };

    const stopScanner = async () => {
      if (scannerRef.current) {
        try {
          if ((scannerRef.current as any).isScanning) {
            await scannerRef.current.stop();
          }
          setIsScanning(false);
        } catch (err) {
          console.error('Error al detener el escáner:', err);
        }
      }
    };

    startScanner();

    return () => {
      stopped = true;
      stopScanner();
    };
  }, [onScan]);

  const handleClose = async () => {
    if (scannerRef.current) {
      try {
        if ((scannerRef.current as any).isScanning) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.error('Error al detener el escáner:', err);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Camera className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-bold text-slate-800">Escanear Código de Barras</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-center">
            <p className="text-red-700 font-medium text-sm">{error}</p>
            <button
              onClick={handleClose}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all text-sm font-semibold"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div
              id="reader"
              className="rounded-xl overflow-hidden border-2 border-slate-300 mb-4 relative bg-black"
            >
              {/* Marco guía */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-72 h-40 border-4 border-blue-400/70 rounded-lg shadow-[0_0_12px_3px_rgba(59,130,246,0.45)]" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">Alinea el código dentro del marco</p>
              <p className="text-xs text-slate-500">El escaneo se detiene automáticamente</p>
            </div>

            <button
              onClick={handleClose}
              className="mt-5 w-full bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-all text-sm"
            >
              Cancelar
            </button>
          </>
        )}

        {!error && !isScanning && (
          <p className="text-xs text-amber-600 mt-3">Reiniciando…</p>
        )}
      </div>
    </div>
  );
}
