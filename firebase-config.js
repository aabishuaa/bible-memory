// Firebase Configuration
// Replace these values with your Firebase project credentials
// To get these values:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select an existing one
// 3. Go to Project Settings > General
// 4. Scroll down to "Your apps" and click on the web app icon (</>)
// 5. Copy the firebaseConfig object values below

const firebaseConfig = {
  apiKey: "AIzaSyALDC6yTPDRiGA9FK-V_o1RhNGOxWyTV78",
  authDomain: "bible-memory-f26bb.firebaseapp.com",
  projectId: "bible-memory-f26bb",
  storageBucket: "bible-memory-f26bb.firebasestorage.app",
  messagingSenderId: "1037146731449",
  appId: "1:1037146731449:web:4b4c78d31402f9a9f37c68",
  measurementId: "G-GXPVB0WKZC"
};

// Initialize Firebase
let auth = null;
let googleProvider = null;

// This will be called after Firebase scripts are loaded
function initializeFirebase() {
    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);

        // Initialize Firebase Authentication
        auth = firebase.auth();

        // Initialize Google Auth Provider
        googleProvider = new firebase.auth.GoogleAuthProvider();

        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return false;
    }
}

// Auth service functions
const FirebaseAuth = {
    // Sign in with Google popup
    signInWithGoogle: async () => {
        try {
            const result = await auth.signInWithPopup(googleProvider);
            return {
                success: true,
                user: {
                    uid: result.user.uid,
                    email: result.user.email,
                    displayName: result.user.displayName,
                    photoURL: result.user.photoURL
                }
            };
        } catch (error) {
            console.error('Error signing in with Google:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Sign out
    signOut: async () => {
        try {
            await auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Error signing out:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Listen to auth state changes
    onAuthStateChanged: (callback) => {
        return auth.onAuthStateChanged((user) => {
            if (user) {
                callback({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                });
            } else {
                callback(null);
            }
        });
    },

    // Get current user
    getCurrentUser: () => {
        const user = auth.currentUser;
        if (user) {
            return {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            };
        }
        return null;
    }
};
