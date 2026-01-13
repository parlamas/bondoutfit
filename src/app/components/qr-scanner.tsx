// src/components/qr-scanner.tsx

'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the QR scanner (client-side only)
const Scanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner),
  {
    ssr: false, // Don't render on server
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading scanner...</p>
        </div>
      </div>
    )
  }
);

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: unknown) => void;
  className?: string;
}

export default function QRScanner({ onScan, onError, className = '' }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [scanMessage, setScanMessage] = useState<string>('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    // Check if browser supports camera access
    const checkCameraSupport = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false);
        setScanMessage('Browser does not support camera access');
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasCamera(videoDevices.length > 0);
        
        if (videoDevices.length === 0) {
          setScanMessage('No camera found on this device');
        }
      } catch (error) {
        console.error('Error checking camera:', error);
        setHasCamera(false);
        setScanMessage('Error checking camera availability');
      }
    };

    checkCameraSupport();
  }, []);

  const handleScan = (result: any) => {
    if (result?.getText()) {
      const text = result.getText();
      console.log('QR Code scanned:', text);
      setScanMessage('✓ QR code detected! Processing...');
      
      // Small delay to show success message
      setTimeout(() => {
        onScan(text);
        setIsScanning(false);
        setScanMessage('');
      }, 500);
    }
  };

  const handleError = (error: unknown) => {
    console.error('QR Scanner error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    // Don't show generic "No QR code found" errors
    if (!errorMsg.includes('No QR code found')) {
      setScanMessage(`Scanner error: ${errorMsg}`);
      onError?.(error);
      
      // Auto-hide error after 3 seconds
      setTimeout(() => setScanMessage(''), 3000);
    }
  };

  const startScanner = async () => {
    try {
      // Request camera permissions
      await navigator.mediaDevices.getUserMedia({ video: true });
      setIsScanning(true);
      setScanMessage('');
      setPermissionDenied(false);
    } catch (error: any) {
      console.error('Camera access denied:', error);
      setScanMessage('Camera access denied. Please enable camera permissions.');
      setHasCamera(false);
      setPermissionDenied(true);
    }
  };

  const stopScanner = () => {
    setIsScanning(false);
    setScanMessage('');
  };

  // Show loading state while checking camera
  if (hasCamera === null) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Checking camera...</p>
      </div>
    );
  }

  if (!hasCamera || permissionDenied) {
    return (
      <div className={`p-6 bg-white border border-gray-200 rounded-xl ${className}`}>
        <div className="text-center mb-4">
          <div className="inline-block p-3 bg-gray-100 rounded-full mb-3">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Camera {permissionDenied ? 'Access Denied' : 'Not Available'}</h3>
          <p className="text-gray-600 text-sm mb-4">
            {permissionDenied 
              ? 'Camera permissions are blocked. Please enable camera access in your browser settings.'
              : 'Your device doesn\'t have a camera or camera access is not supported.'}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-medium text-gray-700 text-sm mb-2">To fix this:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Check if your device has a camera</li>
            <li>• Allow camera permissions in browser settings</li>
            <li>• Try using a different browser (Chrome/Firefox/Safari)</li>
            <li>• Ensure no other app is using the camera</li>
          </ul>
        </div>
        
        {permissionDenied && (
          <button
            onClick={() => {
              setPermissionDenied(false);
              setHasCamera(null);
              // Re-check camera
              setTimeout(() => {
                navigator.mediaDevices.enumerateDevices()
                  .then(devices => {
                    const videoDevices = devices.filter(device => device.kind === 'videoinput');
                    setHasCamera(videoDevices.length > 0);
                  })
                  .catch(() => setHasCamera(false));
              }, 100);
            }}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Retry Camera Check
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {!isScanning ? (
        <button
          onClick={startScanner}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl w-full max-w-md mx-auto"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Scan Customer QR Code
        </button>
      ) : (
        <div className="space-y-4">
          <div className="relative border-4 border-blue-500 rounded-xl overflow-hidden bg-black">
            <Scanner
              onScan={handleScan}
              onError={handleError}
              constraints={{
                facingMode: 'environment', // Use rear camera on mobile
                width: { min: 640, ideal: 1920 },
                height: { min: 480, ideal: 1080 }
              }}
              scanDelay={300}
              styles={{
                container: {
                  width: '100%',
                  height: '400px'
                },
                video: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            {scanMessage && (
              <p className={`px-4 py-2 rounded-lg text-sm font-medium ${
                scanMessage.includes('✓') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {scanMessage}
              </p>
            )}
            
            <p className="text-sm text-gray-600">Align QR code within the frame</p>
            <p className="text-xs text-gray-500">Scan will automatically detect and process</p>
            
            <button
              onClick={stopScanner}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Stop Scanning
            </button>
          </div>
        </div>
      )}
    </div>
  );
}