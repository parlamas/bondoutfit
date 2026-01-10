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

// Add to Home Screen Component
function AddToHomeScreenPrompt() {
  return (
    <div className="bg-blue-900 p-4 rounded-lg text-white mb-4">
      <p className="font-bold">📱 For Best Experience:</p>
      <ol className="list-decimal pl-4 mt-2 text-sm">
        <li>Open in Safari/Chrome</li>
        <li>Tap Share button (📤)</li>
        <li>Select "Add to Home Screen"</li>
        <li>Use like a native app!</li>
      </ol>
    </div>
  );
}

export default function ScannerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  // Beep function using Web Audio API (no file needed)
  const playBeep = () => {
  // Check if AudioContext is supported
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  try {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log('Beep sound failed:', error);
  }
};

  // Test function for the button
  const testScanFeedback = () => {
    // Test vibration
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    // Test sound
    playBeep();
  };

  const handleScan = async (result: any) => {
    if (!result || processing) return;
    
    const text = result.text;
    if (!text || scanResult === text) return; // Prevent duplicate scans
    
    // Add scanning feedback
    if (result) {
      // Vibrate phone (if supported)
      if (navigator.vibrate) navigator.vibrate(200);
      
      // Play beep sound
      playBeep();
    }
    
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
        <h1 className="text-2xl font-bold text-white mb-4 text-center">
          📱 QR Code Scanner
        </h1>
        
        {/* Add to Home Screen Prompt - Only show on mobile */}
        <div className="block md:hidden">
          <AddToHomeScreenPrompt />
        </div>
        
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
        
        <div className="bg-gray-800 rounded-lg p-4 text-white text-sm mb-4">
          <p className="font-medium mb-2">📋 Instructions:</p>
          <ul className="space-y-1">
            <li>• Point camera at customer's QR code</li>
            <li>• First scan: Auto check-in (unlocks discount)</li>
            <li>• Second scan: Auto complete visit</li>
            <li>• No manual buttons needed!</li>
            <li className="text-yellow-300">• 🔊 Sound & vibration on successful scan</li>
          </ul>
        </div>

        {/* Tips for Employees */}
        <div className="bg-gray-800 rounded-lg p-4 text-white text-sm mb-4">
          <p className="font-medium mb-2">💡 Employee Tips:</p>
          <ul className="space-y-1">
            <li>• Hold phone steady 6-12 inches from QR code</li>
            <li>• Ensure good lighting</li>
            <li>• Clean camera lens for better scanning</li>
            <li>• Add shortcut to home screen for quick access</li>
          </ul>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => router.push('/dashboard/store/visits')}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            ← Back to Visits
          </button>
          
          <button
            onClick={testScanFeedback}
            className="text-green-400 hover:text-green-300 text-sm"
          >
            🔊 Test Scan Feedback
          </button>
        </div>
      </div>
    </div>
  );
}