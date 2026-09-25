// babel.config.js
// Expo varsayılan preset'i (babel-preset-expo) reanimated/worklets plugin'ini paket
// kurulu olduğunda OTOMATİK ekler — bu yüzden burada ayrıca eklemiyoruz.
//
// Production build'lerinde tüm console.* çağrılarını kaldırıyoruz: OCR sonuçları,
// ses transkriptleri, e-postalar ve Storage URL'leri release build'de logcat/os_log'a
// düz metin PII olarak sızıyordu (denetim bulguları #5/#6/#9/#37 — KVKK ifşası).
// error/warn korunur ki kritik teşhis kaybolmasın.
module.exports = function (api) {
  // NODE_ENV/BABEL_ENV değişince cache'i geçersiz kıl (dev ↔ prod farkı için şart).
  api.cache.using(() => process.env.NODE_ENV || process.env.BABEL_ENV || "development");

  const isProduction =
    process.env.NODE_ENV === "production" || process.env.BABEL_ENV === "production";

  return {
    presets: ["babel-preset-expo"],
    plugins: isProduction
      ? [["transform-remove-console", { exclude: ["error", "warn"] }]]
      : [],
  };
};
