# Backend Security Guide - Firebase Functions

Bu rehber, Firebase Functions ile **server-side** güvenlik önlemlerini nasıl uygulayacağınızı gösterir.

> ⚠️ **ÖNEMLİ**: Client-side güvenlik önlemleri (şu an uygulamada mevcut) yeterli değildir. Gerçek güvenlik için backend (Firebase Functions) implementasyonu şarttır.

---

## 📋 İçindekiler

1. [Firebase Functions Kurulumu](#1-firebase-functions-kurulumu)
2. [JWT Doğrulaması](#2-jwt-doğrulaması)
3. [Rate Limiting](#3-rate-limiting)
4. [Authorization Katmanı](#4-authorization-katmanı)
5. [Request Validation](#5-request-validation)
6. [Deployment](#6-deployment)

---

## 1. Firebase Functions Kurulumu

### Adım 1: Firebase CLI ile Functions Oluşturun

```bash
# Firebase CLI kurulumu (eğer yoksa)
npm install -g firebase-tools

# Firebase login
firebase login

# Functions initialize
firebase init functions
```

**Soru-Cevap:**
- Language: JavaScript veya TypeScript (TypeScript önerilir)
- ESLint: Yes
- Dependencies: Yes

### Adım 2: Gerekli Bağımlılıkları Yükleyin

```bash
cd functions
npm install express cors express-rate-limit helmet firebase-admin
```

---

## 2. JWT Doğrulaması

Firebase Authentication zaten JWT kullanır, ancak ek doğrulama ekleyebilirsiniz.

### `functions/middleware/auth.js`

```javascript
const admin = require('firebase-admin');

/**
 * Verify Firebase ID Token
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

/**
 * Verify user owns the resource
 */
const verifyOwnership = (req, res, next) => {
  const requestedUserId = req.params.userId || req.body.userId;

  if (requestedUserId !== req.user.uid) {
    return res.status(403).json({ error: 'Forbidden: Access denied' });
  }

  next();
};

module.exports = { verifyToken, verifyOwnership };
```

---

## 3. Rate Limiting

Server-side rate limiting ile API abuse'i önleyin.

### `functions/middleware/rateLimit.js`

```javascript
const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for auth endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

/**
 * File upload rate limiter
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads per hour
  message: 'Upload limit exceeded, please try again later.',
});

module.exports = { apiLimiter, authLimiter, uploadLimiter };
```

---

## 4. Authorization Katmanı

Kullanıcı rolleri ve izinleri kontrol edin.

### `functions/middleware/authorization.js`

```javascript
const admin = require('firebase-admin');

/**
 * Check if user has admin role
 */
const isAdmin = async (req, res, next) => {
  try {
    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(req.user.uid)
      .get();

    const userData = userDoc.data();

    if (!userData || userData.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Check if user can access resource
 */
const canAccessResource = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const resourceDoc = await admin
        .firestore()
        .collection(resourceType)
        .doc(resourceId)
        .get();

      if (!resourceDoc.exists) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      const resourceData = resourceDoc.data();

      // Check ownership
      if (resourceData.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Forbidden: Access denied' });
      }

      req.resource = resourceData;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = { isAdmin, canAccessResource };
```

---

## 5. Request Validation

Gelen istekleri doğrulayın.

### `functions/middleware/validation.js`

```javascript
const { body, param, validationResult } = require('express-validator');

/**
 * Validate request and return errors if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

/**
 * Validation rules for creating a card
 */
const validateCreateCard = [
  body('name').optional().isLength({ max: 200 }).trim().escape(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isLength({ max: 50 }).trim(),
  body('company').optional().isLength({ max: 200 }).trim().escape(),
  body('userId').notEmpty().isString(),
  validate,
];

/**
 * Validation rules for user ID
 */
const validateUserId = [
  param('userId').notEmpty().isString().trim(),
  validate,
];

/**
 * Sanitize input to prevent XSS
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

module.exports = {
  validate,
  validateCreateCard,
  validateUserId,
  sanitizeInput,
};
```

---

## 6. Ana Functions Dosyası

### `functions/index.js`

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Initialize Firebase Admin
admin.initializeApp();

// Middleware imports
const { verifyToken, verifyOwnership } = require('./middleware/auth');
const { apiLimiter, authLimiter, uploadLimiter } = require('./middleware/rateLimit');
const { canAccessResource } = require('./middleware/authorization');
const { validateCreateCard, validateUserId } = require('./middleware/validation');

// Create Express app
const app = express();

// Security middleware
app.use(helmet()); // Security headers
app.use(cors({ origin: true })); // CORS
app.use(express.json()); // Parse JSON bodies

// Apply general rate limiter
app.use(apiLimiter);

// ========================================
// PUBLIC ENDPOINTS (No authentication)
// ========================================

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now() });
});

// ========================================
// PROTECTED ENDPOINTS (Authentication required)
// ========================================

// Get user's cards
app.get('/users/:userId/cards',
  verifyToken,
  validateUserId,
  verifyOwnership,
  async (req, res) => {
    try {
      const cardsSnapshot = await admin
        .firestore()
        .collection('cards')
        .where('userId', '==', req.user.uid)
        .get();

      const cards = cardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({ cards });
    } catch (error) {
      console.error('Error fetching cards:', error);
      res.status(500).json({ error: 'Failed to fetch cards' });
    }
  }
);

// Create a new card
app.post('/users/:userId/cards',
  verifyToken,
  validateUserId,
  verifyOwnership,
  validateCreateCard,
  uploadLimiter,
  async (req, res) => {
    try {
      const cardData = {
        ...req.body,
        userId: req.user.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const cardRef = await admin
        .firestore()
        .collection('cards')
        .add(cardData);

      res.status(201).json({
        id: cardRef.id,
        message: 'Card created successfully'
      });
    } catch (error) {
      console.error('Error creating card:', error);
      res.status(500).json({ error: 'Failed to create card' });
    }
  }
);

// Delete a card
app.delete('/users/:userId/cards/:cardId',
  verifyToken,
  validateUserId,
  verifyOwnership,
  canAccessResource('cards'),
  async (req, res) => {
    try {
      await admin
        .firestore()
        .collection('cards')
        .doc(req.params.cardId)
        .delete();

      res.json({ message: 'Card deleted successfully' });
    } catch (error) {
      console.error('Error deleting card:', error);
      res.status(500).json({ error: 'Failed to delete card' });
    }
  }
);

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
```

---

## 7. Deployment

### Deploy Functions

```bash
# Test locally
firebase emulators:start --only functions

# Deploy to Firebase
firebase deploy --only functions
```

### Frontend'den Çağırma

```javascript
// Client-side kod (React Native)
import { getAuth } from 'firebase/auth';

const callSecureFunction = async (endpoint, data) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get ID token
  const idToken = await user.getIdToken();

  // Call function
  const response = await fetch(
    `https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/api${endpoint}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

// Usage
await callSecureFunction('/users/USER_ID/cards', {
  name: 'John Doe',
  email: 'john@example.com',
});
```

---

## 8. Güvenlik Checklist

Deployment öncesi:

- [ ] JWT doğrulaması aktif
- [ ] Rate limiting yapılandırıldı
- [ ] Authorization katmanı eklendi
- [ ] Input validation yapıldı
- [ ] CORS doğru yapılandırıldı
- [ ] Helmet security headers eklendi
- [ ] Environment variables kullanıldı
- [ ] Error logging yapılandırıldı
- [ ] HTTPS zorunlu
- [ ] Firestore Security Rules deploy edildi

---

## 9. Environment Variables

### `functions/.env`

```bash
# NEVER commit this file to git!
FIREBASE_API_KEY=your_api_key_here
SENDGRID_API_KEY=your_sendgrid_key_here
```

### Access in code:

```javascript
const apiKey = functions.config().api.key;
```

---

## 📚 Kaynaklar

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
- [Helmet.js Security](https://helmetjs.github.io/)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/best-practices)

---

**Son Güncelleme:** 2025-11-17
**Yazar:** Claude Code Assistant
