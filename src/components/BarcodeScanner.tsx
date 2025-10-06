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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Escanear Código de Barras</h2>
          <p className="text-gray-600 text-lg">Usa la cámara o ingresa el código manualmente</p>
        </div>

        <div id="barcode-reader" className={`mb-6 ${!isScanning ? 'hidden' : ''}`}></div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-700 text-base font-medium">{error}</p>
          </div>
        )}

        <button
          onClick={isScanning ? stopScanning : startScanning}
          className={`w-full flex items-center justify-center gap-3 px-8 py-6 rounded-xl text-xl font-bold transition-colors mb-8 shadow-lg ${
            isScanning
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isScanning ? (
            <>
              <CameraOff size={32} />
              Detener Escáner
            </>
          ) : (
            <>
              <Camera size={32} />
              Iniciar Escáner
            </>
          )}
        </button>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-base">
            <span className="px-4 bg-white text-gray-500 font-medium">O ingresa manualmente</span>
          </div>
        </div>

        <form onSubmit={handleManualSubmit}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Keyboard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Código de barras"
                className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isScanning}
              />
            </div>
            <button
              type="submit"
              disabled={!manualBarcode.trim() || isScanning}
              className="px-8 py-4 text-lg bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
