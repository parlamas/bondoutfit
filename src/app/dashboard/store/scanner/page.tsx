//src/app/dashboard/store/scanner/page.tsx

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import QR scanner (client-side only)
const QrScanner = dynamic(() => import('react-qr-scanner').then(mod => mod.QrScanner), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-800 rounded-xl flex items-center justify-center text-white">Loading scanner...</div>
});

export default function ScannerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handleScan = async (result: any) => {
    if (!result || processing) return;
    
    const text = result.text;
    if (!text || scanResult === text) return; // Prevent duplicate scans
    
    setProcessing(true);
    setScanResult(text);
    
    try {
      const qrData = JSON.parse(text);
      const { visitId } = qrData;
      
      // Determine action based on visit status
      const visitRes = await fetch(`/api/visits/${visitId}`);
      if (!visitRes.ok) throw new Error('Visit not found');
      
      const visit = await visitRes.json();
      const scanAction = visit.checkedIn ? 'complete' : 'check-in';
      
      // Send scan to server
      const scanRes = await fetch(`/api/visits/${visitId}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: scanAction }),
      });
      
      if (scanRes.ok) {
        const data = await scanRes.json();
        setMessage(`✅ ${scanAction === 'check-in' ? 'Checked in' : 'Completed'}: ${visit.user.name}`);
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage('');
          setScanResult(null);
          setProcessing(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Scan error:', error);
      setMessage('❌ Invalid QR code or error scanning');
      setTimeout(() => {
        setMessage('');
        setScanResult(null);
        setProcessing(false);
      }, 3000);
    }
  };

  const handleError = (error: any) => {
    console.error('QR Scanner error:', error);
  };

  if (status === 'loading') return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading authentication...</div>;
  
  if (!session || (session.user as any).role !== 'STORE_MANAGER') {
    router.push('/auth/store/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          QR Code Scanner
        </h1>
        
        <div className="bg-black rounded-xl overflow-hidden mb-4">
          <QrScanner
  delay={300}
  onError={handleError}
  onScan={handleScan}
  constraints={{
    facingMode: 'environment'
  }}
  className="w-full h-64 object-cover"
/>
        </div>
        
        {message && (
          <div className={`p-4 rounded-lg mb-4 text-center ${
            message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
        
        <div className="bg-gray-800 rounded-lg p-4 text-white text-sm">
          <p className="font-medium mb-2">Instructions:</p>
          <ul className="space-y-1">
            <li>• Point camera at customer's QR code</li>
            <li>• First scan: Auto check-in (unlocks discount)</li>
            <li>• Second scan: Auto complete visit</li>
            <li>• No manual buttons needed!</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/dashboard/store/visits')}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            ← Back to Visits
          </button>
        </div>
      </div>
    </div>
  );
}