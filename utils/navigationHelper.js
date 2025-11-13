// utils/navigationHelper.js

/**
 * 🔄 Güvenli sayfa yönlendirme
 * Hedef sayfa stack içinde varsa tekrar eklemez.
 */
export const safeNavigate = (navigation, routeName, params = {}) => {
  try {
    const currentRoute = navigation.getCurrentRoute()?.name;
    if (currentRoute !== routeName) {
      navigation.navigate(routeName, params);
    } else {
      console.log(`🧭 Zaten ${routeName} ekranındasın.`);
    }
  } catch (error) {
    console.error("❌ Navigation error:", error);
  }
};

/**
 * 🔙 Ana sayfaya dön
 */
export const goHome = (navigation) => {
  navigation.navigate("Home");
};

/**
 * 🧩 QA akışını başlat (örnek)
 */
export const goToQADetail = (navigation, cardId) => {
  navigation.navigate("QADetailScreen", { cardId });
};
