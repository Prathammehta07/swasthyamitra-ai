import { useState, useEffect } from 'react';

type ConnectionType = 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
type EffectiveConnectionType = '2g' | '3g' | '4g' | 'slow-2g';

interface NetworkInformation extends EventTarget {
  readonly type?: ConnectionType;
  readonly effectiveType?: EffectiveConnectionType;
  readonly downlinkMax?: number;
  readonly downlink?: number;
  readonly rtt?: number;
  readonly saveData?: boolean;
  onchange?: EventListener;
}

declare global {
  interface Navigator {
    readonly connection?: NetworkInformation;
    readonly mozConnection?: NetworkInformation;
    readonly webkitConnection?: NetworkInformation;
  }
}

export function useNetworkMonitor() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    const checkConnectionSpeed = () => {
      if (connection) {
        // Consider 'slow-2g' or '2g' as slow, or downlink < 1 Mbps
        const isSlow = connection.effectiveType === 'slow-2g' || 
                       connection.effectiveType === '2g' || 
                       (connection.downlink !== undefined && connection.downlink < 1);
        setIsSlowConnection(isSlow);
      }
    };

    if (connection) {
      checkConnectionSpeed();
      connection.addEventListener('change', checkConnectionSpeed);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', checkConnectionSpeed);
      }
    };
  }, []);

  return { isOnline, isSlowConnection };
}
