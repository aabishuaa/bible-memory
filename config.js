// Configuration Template
// Copy this file to config.js and fill in your actual API keys
// NEVER commit config.js to version control

const AppConfig = {
  // Firebase Configuration
  // Get these values from: https://console.firebase.google.com/
  // Project Settings > General > Your apps > Web app
  firebase: {
    apiKey: "AIzaSyALDC6yTPDRiGA9FK-V_o1RhNGOxWyTV78",
    authDomain: "bible-memory-f26bb.firebaseapp.com",
    projectId: "bible-memory-f26bb",
    storageBucket: "bible-memory-f26bb.firebasestorage.app",
    messagingSenderId: "1037146731449",
    appId: "1:1037146731449:web:4b4c78d31402f9a9f37c68",
    measurementId: "G-GXPVB0WKZC",
  },

  // Bible API Configuration
  // Get your API key from: https://scripture.api.bible/
  // Sign up for a free account and create an API key
  bibleApi: {
    apiKey: "d7c354dc4347405810e82c9f352f159e",

    // Bible IDs for COPYRIGHTED translations (ESV, NIV, etc.).
    //
    // Unlike public-domain versions (KJV, ASV, WEB, BSB) which work on any key,
    // copyrighted translations must be explicitly enabled on YOUR API.Bible key:
    //   1. Sign in at https://scripture.api.bible/ and open your application.
    //   2. On the free "Starter" plan you may add up to 3 copyrighted, non-commercial
    //      translations (e.g. ESV, NIV) to your key.
    //   3. Copy each translation's exact Bible ID from your dashboard and paste it below.
    //
    // The IDs seeded here are the commonly-published ones, but they will ONLY resolve
    // if your key has been granted access to that translation. If a version is not
    // enabled, the app falls back gracefully and shows an actionable message.
    versionIds: {
      ESV: "f421fe261da7624f-01", // English Standard Version - verify/enable on your key
      NIV: "71c6eab17ae5b667-01", // New International Version - verify/enable on your key
    },
  },
};
