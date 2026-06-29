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
  refresh: () => {},
  processNow: async () => {},
});

export function OfflineQueueProvider({ children }) {
  const [pendingCount, setPendingCount] = useState(0);

  const refresh = useCallback(async () => {
    const n = await getPendingCount();
    setPendingCount(n);
  }, []);

  const processNow = useCallback(async () => {
    await processQueue();
    await refresh();
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
    <OfflineQueueContext.Provider value={{ pendingCount, refresh, processNow }}>
      {children}
    </OfflineQueueContext.Provider>
  );
}

export function useOfflineQueue() {
  return useContext(OfflineQueueContext);
}
