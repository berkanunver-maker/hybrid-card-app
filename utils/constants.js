// utils/constants.js

export const APP_NAME = "Hybrid Card App";
export const BASE_URL = "https://hybrid-card-api-145445824075.us-central1.run.app";

// Firestore koleksiyon adları
export const COLLECTIONS = {
  USERS: "users",
  CARDS: "cards",
  FAIRS: "fairs",
};

// QA durumları
export const QA_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  ERROR: "error",
};

// QA renk kodları
export const QA_COLORS = {
  HIGH: "#4CAF50",
  MEDIUM: "#FFC107",
  LOW: "#F44336",
};

// Klasör ikonları
export const FOLDER_ICONS = [
  "📁", "💼", "🏢", "🏍️", "🚗", "✈️", 
  "🏠", "🎓", "💻", "📱", "🎨", "🎮",
  "⚽", "🎵", "📚", "🍕", "☕", "🛍️",
  "💡", "🔧", "⚙️", "🎯", "🌟", "❤️"
];