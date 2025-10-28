# Security Setup Guide

This document explains how to securely configure the Bible Memory app with your API keys.

## Important Security Notice

**Never commit `config.js` to version control!** This file contains sensitive API keys and is excluded via `.gitignore`.

## Initial Setup

### 1. Create Your Configuration File

Copy the example configuration file to create your own:

```bash
cp config.example.js config.js
```

### 2. Get Your Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click on the gear icon ⚙️ > Project Settings
4. Scroll down to "Your apps" section
5. Click on the web app icon (`</>`)
6. Copy the `firebaseConfig` values

### 3. Get Your Bible API Key

1. Visit [API.Bible](https://scripture.api.bible/)
2. Sign up for a free account
3. Create a new API key
4. Copy the API key

### 4. Update config.js

Open `config.js` and replace the placeholder values with your actual credentials:

```javascript
const AppConfig = {
    firebase: {
        apiKey: "YOUR_ACTUAL_FIREBASE_API_KEY",
        authDomain: "your-project.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project.firebasestorage.app",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef",
        measurementId: "G-XXXXXXXXXX"
    },
    bibleApi: {
        apiKey: "YOUR_ACTUAL_BIBLE_API_KEY"
    }
};
```

## Security Best Practices

### ✅ Do's
- ✅ Keep `config.js` in `.gitignore`
- ✅ Use Firebase Security Rules to protect your database
- ✅ Regularly rotate your API keys
- ✅ Monitor your Firebase and Bible API usage

### ❌ Don'ts
- ❌ Never commit `config.js` to Git
- ❌ Never share your API keys publicly
- ❌ Never hardcode API keys in other files
- ❌ Never expose `config.js` in screenshots or documentation

## Firebase Security Rules

Make sure to set up proper Firebase Security Rules in your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## API Key Rotation

If you suspect your API keys have been compromised:

1. **Firebase:**
   - Go to Firebase Console > Project Settings
   - Regenerate your API keys
   - Update `config.js` with new keys

2. **Bible API:**
   - Go to API.Bible dashboard
   - Delete the compromised key
   - Create a new API key
   - Update `config.js` with the new key

## Deployment Considerations

When deploying to production:

1. Use environment-specific configuration files
2. Consider using Firebase App Check for additional security
3. Set up API key restrictions in your provider's console
4. Monitor API usage for unusual patterns

## Questions or Issues?

If you notice any security concerns, please:
- Do not post API keys in issues
- Contact the repository maintainers privately
- Follow responsible disclosure practices
