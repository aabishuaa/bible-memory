// Firebase Configuration
// Configuration is now loaded from config.js
// See config.example.js for setup instructions

// Check if AppConfig is loaded
if (typeof AppConfig === 'undefined' || !AppConfig.firebase) {
  console.error('Firebase configuration not found. Please create config.js from config.example.js');
  // Error is handled by the Login component with a custom modal
}

const firebaseConfig = AppConfig?.firebase || {};

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

        // Set auth persistence to LOCAL (keeps users logged in after refresh)
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .catch((error) => {
                console.error('Error setting auth persistence:', error);
            });

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
    // Sign in with Google using popup (avoids redirect loops and Hosting dependency)
    signInWithGoogle: async () => {
        try {
            // Use popup instead of redirect to avoid infinite redirect loops
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
    },

    // Bible Studies service methods
    getStudiesCollection() {
        if (!this.currentUserId || !db) {
            throw new Error('User not authenticated or Firestore not initialized');
        }
        return db.collection('users').doc(this.currentUserId).collection('studies');
    },

    async getStudies() {
        try {
            if (!this.currentUserId) {
                return [];
            }

            const snapshot = await this.getStudiesCollection().orderBy('dateModified', 'desc').get();
            const studies = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                studies.push({
                    id: doc.id,
                    ...data,
                    dateCreated: data.dateCreated?.toDate?.()?.toISOString() || new Date().toISOString(),
                    dateModified: data.dateModified?.toDate?.()?.toISOString() || new Date().toISOString()
                });
            });
            return studies;
        } catch (error) {
            console.error('Error getting studies:', error);
            throw error;
        }
    },

    async addStudy(study) {
        try {
            const studiesRef = this.getStudiesCollection();

            const newStudy = {
                title: study.title,
                reference: study.reference,
                passages: study.passages || [],
                highlights: study.highlights || [],
                notes: study.notes || [],
                dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
                dateModified: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await studiesRef.add(newStudy);
            return docRef.id;
        } catch (error) {
            console.error('Error adding study:', error);
            throw error;
        }
    },

    async updateStudy(id, updates) {
        try {
            const studyRef = this.getStudiesCollection().doc(id);
            const studyDoc = await studyRef.get();

            if (studyDoc.exists) {
                const updateData = {
                    ...updates,
                    dateModified: firebase.firestore.FieldValue.serverTimestamp()
                };

                await studyRef.update(updateData);
            }

            return await this.getStudies();
        } catch (error) {
            console.error('Error updating study:', error);
            throw error;
        }
    },

    async deleteStudy(id) {
        try {
            await this.getStudiesCollection().doc(id).delete();
            return await this.getStudies();
        } catch (error) {
            console.error('Error deleting study:', error);
            throw error;
        }
    },

    // Group Bible Studies service methods
    generateStudyCode() {
        // Generate a 6-character alphanumeric code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    async createGroupStudy(study) {
        try {
            if (!this.currentUserId) {
                throw new Error('User not authenticated');
            }

            const groupStudiesRef = db.collection('groupStudies');

            // Generate a unique code
            let studyCode = this.generateStudyCode();
            let codeExists = true;

            // Ensure the code is unique
            while (codeExists) {
                const codeQuery = await groupStudiesRef.where('code', '==', studyCode).get();
                if (codeQuery.empty) {
                    codeExists = false;
                } else {
                    studyCode = this.generateStudyCode();
                }
            }

            const newGroupStudy = {
                code: studyCode,
                title: study.title,
                reference: study.reference,
                passages: study.passages || [],
                leadId: this.currentUserId,
                leadName: study.leadName || 'Unknown',
                leadPhoto: study.leadPhoto || null,
                participantIds: [],
                participants: [], // Array of {uid, displayName, photoURL}
                mainPoints: study.mainPoints || [],
                thoughts: [], // Array of {userId, userName, userPhoto, text, timestamp}
                dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
                dateModified: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await groupStudiesRef.add(newGroupStudy);
            return {
                id: docRef.id,
                code: studyCode
            };
        } catch (error) {
            console.error('Error creating group study:', error);
            throw error;
        }
    },

    async joinGroupStudy(code, userData) {
        try {
            if (!this.currentUserId) {
                throw new Error('User not authenticated');
            }

            const groupStudiesRef = db.collection('groupStudies');
            const codeQuery = await groupStudiesRef.where('code', '==', code.toUpperCase()).get();

            if (codeQuery.empty) {
                throw new Error('Invalid study code');
            }

            const studyDoc = codeQuery.docs[0];
            const studyData = studyDoc.data();

            // Check if user is already a participant or the lead
            if (studyData.leadId === this.currentUserId) {
                throw new Error('You are the lead of this study');
            }

            if (studyData.participantIds.includes(this.currentUserId)) {
                throw new Error('You have already joined this study');
            }

            // Add user to participants
            await studyDoc.ref.update({
                participantIds: firebase.firestore.FieldValue.arrayUnion(this.currentUserId),
                participants: firebase.firestore.FieldValue.arrayUnion({
                    uid: this.currentUserId,
                    displayName: userData.displayName || 'Unknown',
                    photoURL: userData.photoURL || null
                }),
                dateModified: firebase.firestore.FieldValue.serverTimestamp()
            });

            return studyDoc.id;
        } catch (error) {
            console.error('Error joining group study:', error);
            throw error;
        }
    },

    async getGroupStudies() {
        try {
            if (!this.currentUserId) {
                return [];
            }

            const groupStudiesRef = db.collection('groupStudies');

            // Get studies where user is the lead
            const leadStudiesQuery = await groupStudiesRef
                .where('leadId', '==', this.currentUserId)
                .orderBy('dateModified', 'desc')
                .get();

            // Get studies where user is a participant
            const participantStudiesQuery = await groupStudiesRef
                .where('participantIds', 'array-contains', this.currentUserId)
                .orderBy('dateModified', 'desc')
                .get();

            const studies = [];
            const studyIds = new Set();

            // Process lead studies
            leadStudiesQuery.forEach(doc => {
                const data = doc.data();
                if (!studyIds.has(doc.id)) {
                    studyIds.add(doc.id);
                    studies.push({
                        id: doc.id,
                        ...data,
                        isLead: true,
                        dateCreated: data.dateCreated?.toDate?.()?.toISOString() || new Date().toISOString(),
                        dateModified: data.dateModified?.toDate?.()?.toISOString() || new Date().toISOString()
                    });
                }
            });

            // Process participant studies
            participantStudiesQuery.forEach(doc => {
                const data = doc.data();
                if (!studyIds.has(doc.id)) {
                    studyIds.add(doc.id);
                    studies.push({
                        id: doc.id,
                        ...data,
                        isLead: false,
                        dateCreated: data.dateCreated?.toDate?.()?.toISOString() || new Date().toISOString(),
                        dateModified: data.dateModified?.toDate?.()?.toISOString() || new Date().toISOString()
                    });
                }
            });

            // Sort by dateModified descending
            studies.sort((a, b) => new Date(b.dateModified) - new Date(a.dateModified));

            return studies;
        } catch (error) {
            console.error('Error getting group studies:', error);
            throw error;
        }
    },

    async updateGroupStudy(id, updates) {
        try {
            const studyRef = db.collection('groupStudies').doc(id);
            const studyDoc = await studyRef.get();

            if (!studyDoc.exists) {
                throw new Error('Study not found');
            }

            const updateData = {
                ...updates,
                dateModified: firebase.firestore.FieldValue.serverTimestamp()
            };

            await studyRef.update(updateData);
            return await this.getGroupStudies();
        } catch (error) {
            console.error('Error updating group study:', error);
            throw error;
        }
    },

    async addThoughtToGroupStudy(studyId, thought, userData) {
        try {
            const studyRef = db.collection('groupStudies').doc(studyId);

            const newThought = {
                userId: this.currentUserId,
                userName: userData.displayName || 'Unknown',
                userPhoto: userData.photoURL || null,
                text: thought,
                timestamp: new Date().toISOString()
            };

            await studyRef.update({
                thoughts: firebase.firestore.FieldValue.arrayUnion(newThought),
                dateModified: firebase.firestore.FieldValue.serverTimestamp()
            });

            return await this.getGroupStudies();
        } catch (error) {
            console.error('Error adding thought:', error);
            throw error;
        }
    },

    async leaveGroupStudy(studyId, userData) {
        try {
            const studyRef = db.collection('groupStudies').doc(studyId);
            const studyDoc = await studyRef.get();

            if (!studyDoc.exists) {
                throw new Error('Study not found');
            }

            const studyData = studyDoc.data();

            // Find the participant object to remove
            const participantToRemove = studyData.participants.find(p => p.uid === this.currentUserId);

            if (participantToRemove) {
                await studyRef.update({
                    participantIds: firebase.firestore.FieldValue.arrayRemove(this.currentUserId),
                    participants: firebase.firestore.FieldValue.arrayRemove(participantToRemove),
                    dateModified: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            return await this.getGroupStudies();
        } catch (error) {
            console.error('Error leaving group study:', error);
            throw error;
        }
    },

    async deleteGroupStudy(id) {
        try {
            const studyRef = db.collection('groupStudies').doc(id);
            const studyDoc = await studyRef.get();

            if (!studyDoc.exists) {
                throw new Error('Study not found');
            }

            const studyData = studyDoc.data();

            // Only the lead can delete the study
            if (studyData.leadId !== this.currentUserId) {
                throw new Error('Only the lead can delete this study');
            }

            await studyRef.delete();
            return await this.getGroupStudies();
        } catch (error) {
            console.error('Error deleting group study:', error);
            throw error;
        }
    },

    // Real-time listener for a specific group study
    onGroupStudyChange(studyId, callback) {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        const studyRef = db.collection('groupStudies').doc(studyId);

        return studyRef.onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                callback({
                    id: doc.id,
                    ...data,
                    isLead: data.leadId === this.currentUserId,
                    dateCreated: data.dateCreated?.toDate?.()?.toISOString() || new Date().toISOString(),
                    dateModified: data.dateModified?.toDate?.()?.toISOString() || new Date().toISOString()
                });
            } else {
                callback(null);
            }
        }, (error) => {
            console.error('Error listening to group study changes:', error);
        });
    }
};
