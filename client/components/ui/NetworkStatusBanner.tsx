import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-red-500 text-white w-full sticky top-0 z-50 animate-in slide-in-from-top-2">
      <div className="container flex items-center justify-center p-2 text-sm font-medium">
        <WifiOff className="w-4 h-4 mr-2" />
        You are currently offline. Some features may not be available until your connection is restored.
      </div>
    </div>
  );
}
