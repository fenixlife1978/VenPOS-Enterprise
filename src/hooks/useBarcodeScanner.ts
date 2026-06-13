import { useState, useEffect, useCallback } from 'react';

export const useBarcodeScanner = (onScan: (code: string) => void) => {
  const [buffer, setBuffer] = useState('');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (buffer.length > 0) {
        onScan(buffer);
        setBuffer('');
      }
      if (timeoutId) clearTimeout(timeoutId);
      return;
    }
    
    if (event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key)) {
      setBuffer(prev => prev + event.key);
      
      if (timeoutId) clearTimeout(timeoutId);
      const newTimeout = setTimeout(() => {
        setBuffer('');
      }, 100);
      setTimeoutId(newTimeout);
    }
  }, [buffer, onScan, timeoutId]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleKeyPress, timeoutId]);
  
  return { buffer };
};
