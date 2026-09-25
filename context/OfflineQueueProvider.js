// context/OfflineQueueProvider.js
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { getPendingCount, processQueue } from "../services/offlineQueueService";

const OfflineQueueContext = createContext({
  pendingCount: 0,
  syncing: false,
  refresh: () => {},
  processNow: async () => ({ processed: 0 }),
});

export function OfflineQueueProvider({ children }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    const n = await getPendingCount();
    setPendingCount(n);
  }, []);

  // Sonucu döndürür → manuel tetikleyen ekran kullanıcıya geri bildirim gösterebilir
  // (#54). Otomatik (NetInfo/AppState) çağrılar sonucu yok sayıp sessiz kalır.
  const processNow = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await processQueue();
      await refresh();
      return res || { processed: 0 };
    } finally {
      setSyncing(false);
    }
  }, [refresh]);

  useEffect(() => {
    refresh();

    // Bağlantı geri gelince kuyruğu boşalt
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        processNow();
      }
    });

    // Uygulama öne gelince tazele + bağlıysa işle
    const appSub = AppState.addEventListener("change", (s) => {
      if (s === "active") {
        refresh();
        NetInfo.fetch().then((st) => {
          if (st.isConnected && st.isInternetReachable !== false) processNow();
        });
      }
    });

    return () => {
      unsubscribe();
      appSub.remove();
    };
  }, [refresh, processNow]);

  return (
    <OfflineQueueContext.Provider value={{ pendingCount, syncing, refresh, processNow }}>
      {children}
    </OfflineQueueContext.Provider>
  );
}

export function useOfflineQueue() {
  return useContext(OfflineQueueContext);
}
