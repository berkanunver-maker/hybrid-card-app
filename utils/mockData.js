// utils/mockData.js

// Örnek fuar listesi
export const mockFairs = [
  { id: "1", name: "TechConnect 2025 - İstanbul" },
  { id: "2", name: "AI & Robotics Expo 2025 - Berlin" },
  { id: "3", name: "Future Business Summit - London" },
  { id: "4", name: "Global Industry Fair - Dubai" },
];

// Örnek kart verisi (OCR sonucu)
export const mockCard = {
  id: "mockCard123",
  name: "Berkan Özdemir",
  company: "Beko Global",
  email: "berkan@beko.com",
  phone: "+90 555 123 4567",
  accuracy: 92.3,
};

// Örnek QA sonucu
export const mockQAResult = {
  fieldsChecked: 12,
  fieldsCorrect: 11,
  confidence: "high",
  suggestions: ["Email format corrected", "Company name normalized"],
};
