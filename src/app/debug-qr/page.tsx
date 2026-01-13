// app/debug/debug-qr/page.tsx

'use client';

import { useEffect } from 'react';

export default function DebugQRPage() {
  useEffect(() => {
    import('@yudiel/react-qr-scanner').then((module) => {
      console.log('🔍 QR Scanner module:', module);
      console.log('📦 All exports:', Object.keys(module));
      
      // Check each export
      Object.keys(module).forEach(key => {
        console.log(`  - ${key}:`, typeof module[key]);
      });
      
      console.log('⚡ Default export:', module.default);
    }).catch(error => {
      console.error('❌ Error loading module:', error);
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">QR Scanner Debug</h1>
      <p>Check the browser console for export information.</p>
      <p className="mt-2 text-gray-600">Press F12 or right-click → Inspect → Console</p>
    </div>
  );
}