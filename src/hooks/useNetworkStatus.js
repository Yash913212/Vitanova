/**
 * NutriVision AI — Network Status Hook
 */
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [status, setStatus] = useState({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setStatus({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable ?? true,
      });
    });
    return () => unsubscribe();
  }, []);

  return status;
}
