import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, Keyboard } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [manualBarcode, setManualBarcode] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (scannerRef.current && isInitializedRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError('');

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('barcode-reader');
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        undefined
      );

      isInitializedRef.current = true;
      setIsScanning(true);
    } catch (err) {
      setError('Error al acceder a la cámara. Asegúrate de dar permisos.');
      console.error(err);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isInitializedRef.current) {
      try {
        await scannerRef.current.stop();
        isInitializedRef.current = false;
        setIsScanning(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Escanear Código de Barras</h2>
          <p className="text-gray-600 text-sm">Usa la cámara o ingresa el código manualmente</p>
        </div>

        <div id="barcode-reader" className={`mb-4 ${!isScanning ? 'hidden' : ''}`}></div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={isScanning ? stopScanning : startScanning}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors mb-6 ${
            isScanning
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isScanning ? (
            <>
              <CameraOff size={20} />
              Detener Escáner
            </>
          ) : (
            <>
              <Camera size={20} />
              Iniciar Escáner
            </>
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O ingresa manualmente</span>
          </div>
        </div>

        <form onSubmit={handleManualSubmit} className="mt-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Keyboard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Código de barras"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isScanning}
              />
            </div>
            <button
              type="submit"
              disabled={!manualBarcode.trim() || isScanning}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
