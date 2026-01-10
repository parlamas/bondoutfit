//src/types/react-qr-scanner.d.ts

declare module 'react-qr-scanner' {
  import { ComponentType } from 'react';
  
  interface QrScannerProps {
    delay?: number;
    onError?: (error: any) => void;
    onScan?: (result: { text: string }) => void;
    constraints?: MediaTrackConstraints;
    className?: string;
  }
  
  export const QrScanner: ComponentType<QrScannerProps>;
}