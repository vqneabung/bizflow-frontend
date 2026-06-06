/**
 * BarcodeScanner.tsx — Barcode scanner component.
 *
 * Sử dụng @yudiel/react-qr-scanner (barcode-detection polyfill bằng ZXing WASM).
 * Dùng dynamic import (ssr: false) vì camera API không chạy được trên server.
 *
 * Cross-browser:
 * - Chrome/Edge 88+ (native BarcodeDetector)
 * - Firefox 90+ (polyfill)
 * - Safari 14+ (polyfill)
 * - iOS 14.5+
 *
 * Features:
 * - Camera button → scan view → auto-close khi detect
 * - Built-in: finder overlay, torch, audio beep
 * - Hỗ trợ format: EAN-13, EAN-8, Code-128, Code-39, UPC-A, UPC-E, QR
 */
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { type IDetectedBarcode } from '@yudiel/react-qr-scanner'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff } from 'lucide-react'

/**
 * Dynamic import: scanner chỉ mount ở client (SSR không support getUserMedia).
 */
const Scanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then((m) => m.Scanner),
  { ssr: false },
)

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  disabled?: boolean
}

// Scanner defaults to ALL formats — không cần formats prop

export default function BarcodeScanner({ onScan, disabled = false }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)

  const handleScan = (codes: IDetectedBarcode[]) => {
    const code = codes?.[0]
    if (!code?.rawValue) return
    onScan(code.rawValue)
    setIsScanning(false)
  }

  /** Scan view */
  if (isScanning) {
    return (
      <div className="space-y-2">
        <div
          className="bg-muted rounded-lg overflow-hidden border-2 border-primary/30"
          style={{ width: 320, height: 200 }}
        >
          <Scanner
            onScan={handleScan}
            onError={() => setIsScanning(false)}
            constraints={{ facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }}
            components={{ finder: true, torch: true }}
            sound
            styles={{ container: { width: '100%', height: '100%' } }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsScanning(false)}
        >
          <CameraOff className="h-4 w-4 mr-1" />
          Huỷ
        </Button>
      </div>
    )
  }

  /** Scan trigger button */
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setIsScanning(true)}
      disabled={disabled}
    >
      <Camera className="h-4 w-4 mr-1" />
      Quét mã vạch
    </Button>
  )
}
