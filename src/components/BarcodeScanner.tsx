import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, type CameraDevice } from 'html5-qrcode';
import { Camera, CameraOff, Keyboard } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [warning, setWarning] = useState<string>('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [loadingCameras, setLoadingCameras] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [continuous, setContinuous] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const lastCodesRef = useRef<{ value: string; time: number }[]>([]);
  const DUP_WINDOW_MS = 3000; // ventana de supresión de duplicados
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isInitializedRef = useRef(false);

  // Check HTTPS requirement for iOS/Safari
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost'
    ) {
      setWarning(
        'Para que la cámara funcione en móviles (especialmente iOS) abre esta página con HTTPS (ej. usando un deploy en Vercel / Netlify) o en localhost.'
      );
    }
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current && isInitializedRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const fetchCameras = async () => {
    try {
      setLoadingCameras(true);
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);
      // Try to prefer environment (trasera)
      const preferred = devices.find((d) => /back|rear|environment/i.test(d.label)) || devices[0];
      if (preferred) setSelectedCameraId(preferred.id);
    } catch (err) {
      setError('No se pudieron obtener las cámaras. Acepta permisos y recarga.');
      console.error(err);
    } finally {
      setLoadingCameras(false);
    }
  };

  useEffect(() => {
    // Pre-list devices cuando el usuario llega al componente
    fetchCameras();
  }, []);

  const startScanning = async () => {
    try {
      setError('');

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('barcode-reader', {
          experimentalFeatures: { useBarCodeDetectorIfSupported: true },
          verbose: false,
        });
      }

      const config = {
        fps: 12,
        qrbox: { width: 280, height: 180 }, // algo más rectangular para códigos de barras
        aspectRatio: 1.7778, // 16:9
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
        ],
      } as const;

      // Prefer explicit camera id if available, else fallback to facingMode
      const cameraConfig = selectedCameraId
        ? { deviceId: { exact: selectedCameraId } }
        : { facingMode: 'environment' as const };

      await scannerRef.current.start(
        cameraConfig,
        config,
        (decodedText) => {
          const now = Date.now();
          // Limpiar viejos
          lastCodesRef.current = lastCodesRef.current.filter((c) => now - c.time < DUP_WINDOW_MS);
          const isDuplicate = lastCodesRef.current.some((c) => c.value === decodedText);
          if (isDuplicate && continuous) {
            return; // ignorar duplicado en escaneo continuo
          }
          lastCodesRef.current.push({ value: decodedText, time: now });

          if (navigator.vibrate) {
            navigator.vibrate(isDuplicate ? 20 : 60);
          }
          onScan(decodedText);
          if (!continuous) {
            stopScanning();
          }
        },
        (scanError) => {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.debug('Frame no válido', scanError);
          }
        }
      );

      isInitializedRef.current = true;
  setIsScanning(true);
  setShowModal(true);

      // Timeout si el video no aparece en 4s
      setTimeout(() => {
        if (showModal) {
          const videoElem = document.querySelector('#barcode-reader video');
          if (!videoElem) {
            setError('No se pudo inicializar el video. Reintenta, cambia de cámara o revisa permisos.');
            stopScanning();
          }
        }
      }, 4000);

      // Intentar detectar soporte de linterna
      try {
        const videoElem = document.querySelector('#barcode-reader video') as HTMLVideoElement | null;
        if (videoElem) {
          const stream = (videoElem as any).srcObject as MediaStream | undefined;
          const track = stream?.getVideoTracks()[0];
          if (track) {
            videoTrackRef.current = track;
            const capabilities = (track.getCapabilities && track.getCapabilities()) || {};
            if ((capabilities as any).torch) {
              setTorchSupported(true);
            }
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.debug('No se pudo evaluar soporte de torch', err);
      }
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
        setTorchOn(false);
        setShowModal(false);
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

  const toggleTorch = async () => {
    if (!videoTrackRef.current) return;
    try {
      // @ts-expect-error Algunos navegadores no tipan applyConstraints con torch
      await videoTrackRef.current.applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn((prev) => !prev);
    } catch (err) {
      setError('No se pudo cambiar el estado de la linterna.');
      console.error(err);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Escanear Código de Barras</h2>
          <p className="text-gray-600 text-lg">Usa la cámara o ingresa el código manualmente</p>
        </div>

        {/* Modal overlay para la cámara */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md aspect-[9/16] bg-black rounded-xl shadow-2xl overflow-hidden flex items-center justify-center">
              <div id="barcode-reader" className="w-full h-full"></div>
              {/* Marco guía */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-72 h-44 border-4 border-blue-400/70 rounded-xl shadow-[0_0_15px_4px_rgba(59,130,246,0.4)]"></div>
              </div>
              {/* Botón cerrar */}
              <button
                type="button"
                onClick={stopScanning}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white px-3 py-1 rounded-md text-sm font-medium"
              >
                Cerrar
              </button>
              {torchSupported && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`absolute bottom-4 right-4 px-4 py-2 rounded-md font-medium text-sm shadow ${
                    torchOn ? 'bg-yellow-500 text-white' : 'bg-white/80 text-gray-800'
                  }`}
                >
                  {torchOn ? 'Linterna ✔' : 'Linterna'}
                </button>
              )}
            </div>
            <p className="mt-4 text-sm text-gray-200 text-center max-w-sm leading-snug">
              Alinea el código de barras dentro del marco. Mantén la mano firme y asegúrate de tener buena iluminación.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-700 text-base font-medium">{error}</p>
          </div>
        )}

        {warning && !error && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-base font-medium">{warning}</p>
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-600">Cámara</label>
            <div className="flex gap-2">
              <select
                className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                disabled={isScanning || loadingCameras || cameras.length === 0}
              >
                {cameras.length === 0 && <option value="">{loadingCameras ? 'Cargando...' : 'Sin cámaras'}</option>}
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label || `Cámara ${c.id}`}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={fetchCameras}
                disabled={isScanning || loadingCameras}
                className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg font-medium disabled:opacity-50"
              >
                {loadingCameras ? '...' : '🔄'}
              </button>
            </div>
          </div>
          <label className="flex items-center gap-3 mt-6 md:mt-0">
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={continuous}
              onChange={(e) => setContinuous(e.target.checked)}
              disabled={isScanning}
            />
            <span className="text-sm font-medium text-gray-700">Escaneo continuo (no se detiene)</span>
          </label>
        </div>

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

        {/* El botón de linterna principal ya está dentro del modal; se elimina aquí */}

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
