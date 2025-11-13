# Hybrid Card App 🪪

AI destekli kartvizit dijitalleştirme ve yönetim uygulaması. React Native + Expo + Firebase ile geliştirilmiştir.

## ✨ Özellikler

- 📸 Kartvizit tarama ve OCR
- 🤖 AI destekli veri çıkarma (Document AI)
- 📁 Klasör bazlı organizasyon
- ⭐ Favori kartlar
- 🔍 Gelişmiş arama ve filtreleme
- 📊 Excel export
- 🎙️ Ses notu ekleme
- ☁️ Firebase backend (Firestore + Storage + Auth)
- 🔐 Email/Password, Google, Apple Sign In

## 🚀 Kurulum

### 1. Bağımlılıkları yükleyin

```bash
npm install
```

### 2. Firebase Konfigürasyonu

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp .env.example .env
```

`.env` dosyasını açın ve Firebase değerlerinizi girin:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Firebase değerlerini nereden bulabilirsiniz?**
1. [Firebase Console](https://console.firebase.google.com)'a gidin
2. Projenizi seçin
3. **Project Settings** → **General** → **Your apps**
4. Web app'inizin config değerlerini kopyalayın

> ⚠️ **Önemli**: `.env` dosyası `.gitignore`'da bulunur ve asla commit edilmemelidir.

### 3. Uygulamayı başlatın

```bash
npx expo start
```

Platform seçenekleri:

```bash
# Android emulator
npm run android

# iOS simulator
npm run ios

# Web browser
npm run web
```

## 📱 Platform Desteği

- ✅ iOS
- ✅ Android
- ✅ Web

## 🛠 Teknoloji Stack

- **Frontend**: React Native 0.81.5, React 19.1.0
- **Framework**: Expo 54.0
- **Backend**: Firebase (Firestore, Storage, Auth, Analytics)
- **AI/ML**: Google Cloud Document AI, Vision OCR
- **State Management**: React Hooks
- **Navigation**: React Navigation 7.x
- **UI**: Custom components, Expo Vector Icons

## 📁 Proje Yapısı

```
hybrid-card-app/
├── screens/          # 24+ ekran
├── components/       # 27+ bileşen
├── services/         # API ve Firebase servisleri
├── navigation/       # Stack & Tab navigatörler
├── utils/            # Yardımcı fonksiyonlar
└── assets/           # Görseller ve medya
```

## 🔥 Firebase Servisleri

### Firestore Collections
- `users` - Kullanıcı profilleri
- `categories` - Klasörler
- `cards` - Kartvizitler
- `fairs` - Fuarlar

### Firestore Indexes
Firestore indexes otomatik olarak `firestore.indexes.json` dosyasından yüklenecektir.

## 🔐 Güvenlik

- API key'ler environment variable'larda saklanır
- Firebase Security Rules aktiftir
- AsyncStorage ile persist auth

## 🧪 Test

```bash
npm run lint
```

## 📄 Lisans

Private project

## 🤝 Katkıda Bulunma

Bu proje aktif geliştirme aşamasındadır.

---

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
