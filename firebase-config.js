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
let db = null;

// This will be called after Firebase scripts are loaded
function initializeFirebase() {
    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);

        // Initialize Firebase Authentication
        auth = firebase.auth();

        // Initialize Google Auth Provider
        googleProvider = new firebase.auth.GoogleAuthProvider();

        // Initialize Firestore
        db = firebase.firestore();

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

// Firestore service functions
const FirestoreService = {
    currentUserId: null,

    setUser(userId) {
        this.currentUserId = userId;
    },

    getUserCollection() {
        if (!this.currentUserId || !db) {
            throw new Error('User not authenticated or Firestore not initialized');
        }
        return db.collection('users').doc(this.currentUserId).collection('verses');
    },

    getPrayerCollection() {
        if (!this.currentUserId || !db) {
            throw new Error('User not authenticated or Firestore not initialized');
        }
        return db.collection('users').doc(this.currentUserId).collection('prayers');
    },

    async getVerses() {
        try {
            if (!this.currentUserId) {
                return [];
            }

            const snapshot = await this.getUserCollection().orderBy('dateAdded', 'desc').get();
            const verses = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                verses.push({
                    id: doc.id,
                    ...data,
                    // Convert Firestore timestamp to ISO string if it exists
                    dateAdded: data.dateAdded?.toDate?.()?.toISOString() || new Date().toISOString()
                });
            });
            return verses;
        } catch (error) {
            console.error('Error getting verses:', error);
            throw error;
        }
    },

    async addVerse(verse) {
        try {
            const versesRef = this.getUserCollection();

            // Check if verse already exists
            const existingQuery = await versesRef.where('reference', '==', verse.reference).get();

            if (!existingQuery.empty) {
                console.log('Verse already exists');
                return await this.getVerses();
            }

            // Add new verse
            const newVerse = {
                reference: verse.reference,
                text: verse.text,
                translation: verse.translation || verse.version || 'KJV',
                version: verse.version || verse.translation || 'KJV',
                memorized: false,
                dateAdded: firebase.firestore.FieldValue.serverTimestamp()
            };

            await versesRef.add(newVerse);
            return await this.getVerses();
        } catch (error) {
            console.error('Error adding verse:', error);
            throw error;
        }
    },

    async toggleMemorized(id) {
        try {
            const verseRef = this.getUserCollection().doc(id);
            const verseDoc = await verseRef.get();

            if (verseDoc.exists) {
                const currentMemorized = verseDoc.data().memorized || false;
                await verseRef.update({
                    memorized: !currentMemorized
                });
            }

            return await this.getVerses();
        } catch (error) {
            console.error('Error toggling memorized:', error);
            throw error;
        }
    },

    async deleteVerse(id) {
        try {
            await this.getUserCollection().doc(id).delete();
            return await this.getVerses();
        } catch (error) {
            console.error('Error deleting verse:', error);
            throw error;
        }
    },

    async clearUserData() {
        try {
            if (!this.currentUserId) {
                return;
            }

            const snapshot = await this.getUserCollection().get();
            const batch = db.batch();

            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
        } catch (error) {
            console.error('Error clearing user data:', error);
            throw error;
        }
    },

    // Prayer service methods
    async getPrayers() {
        try {
            if (!this.currentUserId) {
                return [];
            }

            const snapshot = await this.getPrayerCollection().orderBy('dateAdded', 'desc').get();
            const prayers = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                prayers.push({
                    id: doc.id,
                    ...data,
                    // Convert Firestore timestamp to ISO string if it exists
                    dateAdded: data.dateAdded?.toDate?.()?.toISOString() || new Date().toISOString(),
                    dateAnswered: data.dateAnswered?.toDate?.()?.toISOString() || null
                });
            });
            return prayers;
        } catch (error) {
            console.error('Error getting prayers:', error);
            throw error;
        }
    },

    async addPrayer(prayer) {
        try {
            const prayersRef = this.getPrayerCollection();

            // Add new prayer
            const newPrayer = {
                title: prayer.title,
                content: prayer.content,
                category: prayer.category,
                verseRefs: prayer.verseRefs || [],
                answered: false,
                dateAdded: firebase.firestore.FieldValue.serverTimestamp(),
                dateAnswered: null
            };

            await prayersRef.add(newPrayer);
            return await this.getPrayers();
        } catch (error) {
            console.error('Error adding prayer:', error);
            throw error;
        }
    },

    async updatePrayer(id, updates) {
        try {
            const prayerRef = this.getPrayerCollection().doc(id);
            const prayerDoc = await prayerRef.get();

            if (prayerDoc.exists) {
                const updateData = {
                    title: updates.title,
                    content: updates.content,
                    category: updates.category,
                    verseRefs: updates.verseRefs || [],
                    answered: updates.answered
                };

                // If marking as answered and not already answered, set dateAnswered
                if (updates.answered && !prayerDoc.data().answered) {
                    updateData.dateAnswered = firebase.firestore.FieldValue.serverTimestamp();
                } else if (!updates.answered) {
                    updateData.dateAnswered = null;
                }

                await prayerRef.update(updateData);
            }

            return await this.getPrayers();
        } catch (error) {
            console.error('Error updating prayer:', error);
            throw error;
        }
    },

    async deletePrayer(id) {
        try {
            await this.getPrayerCollection().doc(id).delete();
            return await this.getPrayers();
        } catch (error) {
            console.error('Error deleting prayer:', error);
            throw error;
        }
    }
};
