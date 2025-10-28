// Configuration Template
// Copy this file to config.js and fill in your actual API keys
// NEVER commit config.js to version control

const AppConfig = {
    // Firebase Configuration
    // Get these values from: https://console.firebase.google.com/
    // Project Settings > General > Your apps > Web app
    firebase: {
        apiKey: "YOUR_FIREBASE_API_KEY",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID",
        measurementId: "YOUR_MEASUREMENT_ID"
    },

    // Bible API Configuration
    // Get your API key from: https://scripture.api.bible/
    // Sign up for a free account and create an API key
    bibleApi: {
        apiKey: "YOUR_BIBLE_API_KEY"
    }
};
