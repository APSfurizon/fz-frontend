import "./qr-reader.scss";

import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState } from "react";

type QRScannerProps = {
  onSuccess?: (decodedText: string) => void;
  onError?: (error: any) => void;
};

const QRScanner: React.FC<QRScannerProps> = ({ onSuccess = () => { }, onError = () => { } }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const activeScanRef = useRef(false);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState("Premi 'Avvia scanner' per iniziare");

  const startScan = useCallback(async () => {
    if (!scannerRef.current || isScanning) return;

    setStatus("Inizializzazione camera...");
    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => () => {
          typeof onSuccess === "function" && onSuccess(decodedText);
          setStatus(`Ultimo codice: ${decodedText}`)
        },
        () => setStatus("Ricerca in corso...")
      );
      activeScanRef.current = true;
      setIsScanning(true);
      setStatus("Ricerca in corso...");
    } catch {
      setStatus("Impossibile accedere alla camera");
      typeof onError === "function" && onError("Impossibile accedere alla camera");
    }
  }, [isScanning]);

  const stopScan = useCallback(async () => {
    if (!scannerRef.current || !isScanning) return;

    setStatus("Arresto scanner...");
    await scannerRef.current.stop().catch(() => setStatus("Errore durante l'arresto"));
    activeScanRef.current = false;
    setIsScanning(false);
    setStatus("Scanner fermo");
  }, [isScanning]);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode("reader", { verbose: false });

    return () => {
      if (scannerRef.current) {
        if (activeScanRef.current) {
          scannerRef.current.stop().catch(() => null);
        }
        scannerRef.current.clear();
      }
    };
  }, []);

  return (
    <div className="qr-reader">
      <div className="qr-reader__viewport">
        <div id="reader" className="qr-reader__canvas" />
        <div className="qr-reader__frame" />
      </div>

      <div className="qr-reader__actions">
        {!isScanning && <button
          onClick={startScan}
          disabled={isScanning}
          className={`qr-reader__button qr-reader__button--primary${isScanning ? " qr-reader__button--disabled" : ""
            }`}
        >
          Scan QR
        </button>
        }
        {isScanning && <button
          onClick={stopScan}
          disabled={!isScanning}
          className={`qr-reader__button qr-reader__button--ghost${!isScanning ? " qr-reader__button--disabled" : ""
            }`}
        >
          Ferma
        </button>
        }
      </div>
    </div>
  );
};

export default QRScanner;