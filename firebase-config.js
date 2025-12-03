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
                passages: study.passages || [], // Now: [{reference, verses: [{verseNumber, text}]}]
                highlights: study.highlights || [],
                notes: study.notes || [],
                additionalReferences: study.additionalReferences || [],
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
                passages: study.passages || [], // Array of {reference, verses: [{verseNumber, text}]}
                additionalReferences: [], // Array of additional scripture references
                leadId: this.currentUserId,
                leadName: study.leadName || 'Unknown',
                leadPhoto: study.leadPhoto || null,
                participantIds: [],
                participants: [], // Array of {uid, displayName, photoURL}
                mainPoints: study.mainPoints || [],
                thoughts: [], // Array of {id, userId, userName, userPhoto, text, timestamp}
                notes: [], // Array of {id, userId, userName, userPhoto, passageReference, verseNumber, color, text, timestamp}
                highlights: study.highlights || [], // Array of {passageReference, verseNumber, color}
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
                id: Date.now().toString() + '_' + this.currentUserId,
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

    // Delete a main point (lead only)
    async deleteMainPoint(studyId, pointIndex) {
        try {
            const studyRef = db.collection('groupStudies').doc(studyId);
            const studyDoc = await studyRef.get();

            if (!studyDoc.exists) {
                throw new Error('Study not found');
            }

            const studyData = studyDoc.data();

            // Only the lead can delete main points
            if (studyData.leadId !== this.currentUserId) {
                throw new Error('Only the lead can delete main points');
            }

            const mainPoints = [...studyData.mainPoints];
            mainPoints.splice(pointIndex, 1);

            await studyRef.update({
                mainPoints: mainPoints,
                dateModified: firebase.firestore.FieldValue.serverTimestamp()
            });

            return await this.getGroupStudies();
        } catch (error) {
            console.error('Error deleting main point:', error);
            throw error;
        }
    },

    // Edit a main point (lead only)
    async editMainPoint(studyId, pointIndex, newText) {
        try {
            const studyRef = db.collection('groupStudies').doc(studyId);
            const studyDoc = await studyRef.get();

            if (!studyDoc.exists) {
                throw new Error('Study not found');
            }

            const studyData = studyDoc.data();

            // Only the lead can edit main points
            if (studyData.leadId !== this.currentUserId) {
                throw new Error('Only the lead can edit main points');
            }

            const mainPoints = [...studyData.mainPoints];
            mainPoints[pointIndex] = newText;

            await studyRef.update({
                mainPoints: mainPoints,
                dateModified: firebase.firestore.FieldValue.serverTimestamp()
            });

            return await this.getGroupStudies();
        } catch (error) {
            console.error('Error editing main point:', error);
            throw error;
        }
    },

    // Delete a thought (own thoughts only)
    async deleteThought(studyId, thoughtId) {
        try {
            const studyRef = db.collection('groupStudies').doc(studyId);
            const studyDoc = await studyRef.get();

            if (!studyDoc.exists) {
                throw new Error('Study not found');
            }

            const studyData = studyDoc.data();
            const thoughts = studyData.thoughts || [];
            const thoughtToDelete = thoughts.find(t => t.id === thoughtId);

            if (!thoughtToDelete) {
                throw new Error('Thought not found');
            }

            // Only the owner can delete their thought
            if (thoughtToDelete.userId !== this.currentUserId) {
                throw new Error('You can only delete your own thoughts');
            }

            const updatedThoughts = thoughts.filter(t => t.id !== thoughtId);

            await studyRef.update({
                thoughts: updatedThoughts,
                dateModified: firebase.firestore.FieldValue.serverTimestamp()
            });

            return await this.getGroupStudies();
        } catch (error) {
            console.error('Error deleting thought:', error);
            throw error;
        }
    },

    // Edit a thought (own thoughts only)
    async editThought(studyId, thoughtId, newText) {
        try {
            const studyRef = db.collection('groupStudies').doc(studyId);
            const studyDoc = await studyRef.get();

            if (!studyDoc.exists) {
                throw new Error('Study not found');
            }

            const studyData = studyDoc.data();
            const thoughts = studyData.thoughts || [];
            const thoughtIndex = thoughts.findIndex(t => t.id === thoughtId);

            if (thoughtIndex === -1) {
                throw new Error('Thought not found');
            }

            // Only the owner can edit their thought
            if (thoughts[thoughtIndex].userId !== this.currentUserId) {
                throw new Error('You can only edit your own thoughts');
            }

            const updatedThoughts = [...thoughts];
            updatedThoughts[thoughtIndex] = {
                ...updatedThoughts[thoughtIndex],
                text: newText,
                edited: true,
                editedAt: new Date().toISOString()
            };

            await studyRef.update({
                thoughts: updatedThoughts,
                dateModified: firebase.firestore.FieldValue.serverTimestamp()
            });

            return await this.getGroupStudies();
        } catch (error) {
            console.error('Error editing thought:', error);
            throw error;
        }
    },

    // Add a note to a group study
    async addNoteToGroupStudy(studyId, note, userData) {
        try {
            const studyRef = db.collection('groupStudies').doc(studyId);

            const newNote = {
                id: Date.now().toString() + '_' + this.currentUserId,
                userId: this.currentUserId,
                userName: userData.displayName || 'Unknown',
                userPhoto: userData.photoURL || null,
                passageReference: note.passageReference,
                verseNumber: note.verseNumber,
                color: note.color,
                text: note.text,
                timestamp: new Date().toISOString()
            };

            await studyRef.update({
                notes: firebase.firestore.FieldValue.arrayUnion(newNote),
                dateModified: firebase.firestore.FieldValue.serverTimestamp()
            });

            return await this.getGroupStudies();
        } catch (error) {
            console.error('Error adding note:', error);
            throw error;
        }
    },

    // Delete a note (own notes only)
    async deleteNoteFromGroupStudy(studyId, noteId) {
        try {
            const studyRef = db.collection('groupStudies').doc(studyId);
            const studyDoc = await studyRef.get();

            if (!studyDoc.exists) {
                throw new Error('Study not found');
            }

            const studyData = studyDoc.data();
            const notes = studyData.notes || [];
            const noteToDelete = notes.find(n => n.id === noteId);

            if (!noteToDelete) {
                throw new Error('Note not found');
            }

            // Only the owner can delete their note
            if (noteToDelete.userId !== this.currentUserId) {
                throw new Error('You can only delete your own notes');
            }

            const updatedNotes = notes.filter(n => n.id !== noteId);

            await studyRef.update({
                notes: updatedNotes,
                dateModified: firebase.firestore.FieldValue.serverTimestamp()
            });

            return await this.getGroupStudies();
        } catch (error) {
            console.error('Error deleting note:', error);
            throw error;
        }
    },

    // Edit a note (own notes only)
    async editNoteInGroupStudy(studyId, noteId, newText, newColor) {
        try {
            const studyRef = db.collection('groupStudies').doc(studyId);
            const studyDoc = await studyRef.get();

            if (!studyDoc.exists) {
                throw new Error('Study not found');
            }

            const studyData = studyDoc.data();
            const notes = studyData.notes || [];
            const noteIndex = notes.findIndex(n => n.id === noteId);

            if (noteIndex === -1) {
                throw new Error('Note not found');
            }

            // Only the owner can edit their note
            if (notes[noteIndex].userId !== this.currentUserId) {
                throw new Error('You can only edit your own notes');
            }

            const updatedNotes = [...notes];
            updatedNotes[noteIndex] = {
                ...updatedNotes[noteIndex],
                text: newText,
                color: newColor,
                edited: true,
                editedAt: new Date().toISOString()
            };

            await studyRef.update({
                notes: updatedNotes,
                dateModified: firebase.firestore.FieldValue.serverTimestamp()
            });

            return await this.getGroupStudies();
        } catch (error) {
            console.error('Error editing note:', error);
            throw error;
        }
    },

    // Add a highlight to a group study
    async addHighlightToGroupStudy(studyId, passageReference, verseNumber, color) {
        try {
            const studyRef = db.collection('groupStudies').doc(studyId);
            const studyDoc = await studyRef.get();

            if (!studyDoc.exists) {
                throw new Error('Study not found');
            }

            const studyData = studyDoc.data();
            const highlights = studyData.highlights || [];

            // Remove existing highlight for this verse if any
            const updatedHighlights = highlights.filter(h =>
                !(h.passageReference === passageReference && h.verseNumber === verseNumber)
            );

            // Add new highlight
            updatedHighlights.push({ passageReference, verseNumber, color });

            await studyRef.update({
                highlights: updatedHighlights,
                dateModified: firebase.firestore.FieldValue.serverTimestamp()
            });

            return await this.getGroupStudies();
        } catch (error) {
            console.error('Error adding highlight:', error);
            throw error;
        }
    },

    // Remove a highlight from a group study
    async removeHighlightFromGroupStudy(studyId, passageReference, verseNumber) {
        try {
            const studyRef = db.collection('groupStudies').doc(studyId);
            const studyDoc = await studyRef.get();

            if (!studyDoc.exists) {
                throw new Error('Study not found');
            }

            const studyData = studyDoc.data();
            const highlights = studyData.highlights || [];

            const updatedHighlights = highlights.filter(h =>
                !(h.passageReference === passageReference && h.verseNumber === verseNumber)
            );

            await studyRef.update({
                highlights: updatedHighlights,
                dateModified: firebase.firestore.FieldValue.serverTimestamp()
            });

            return await this.getGroupStudies();
        } catch (error) {
            console.error('Error removing highlight:', error);
            throw error;
        }
    },

    // Add an additional reference to a group study
    async addAdditionalReference(studyId, reference, passages, label = "") {
        try {
            const studyRef = db.collection('groupStudies').doc(studyId);
            const studyDoc = await studyRef.get();

            if (!studyDoc.exists) {
                throw new Error('Study not found');
            }

            const newReference = {
                id: Date.now().toString(),
                reference: reference,
                passages: passages,
                label: label || "",
                addedAt: new Date().toISOString()
            };

            await studyRef.update({
                additionalReferences: firebase.firestore.FieldValue.arrayUnion(newReference),
                dateModified: firebase.firestore.FieldValue.serverTimestamp()
            });

            return await this.getGroupStudies();
        } catch (error) {
            console.error('Error adding additional reference:', error);
            throw error;
        }
    },

    // Remove an additional reference from a group study
    async removeAdditionalReference(studyId, referenceId) {
        try {
            const studyRef = db.collection('groupStudies').doc(studyId);
            const studyDoc = await studyRef.get();

            if (!studyDoc.exists) {
                throw new Error('Study not found');
            }

            const studyData = studyDoc.data();
            const additionalReferences = studyData.additionalReferences || [];

            const updatedReferences = additionalReferences.filter(r => r.id !== referenceId);

            await studyRef.update({
                additionalReferences: updatedReferences,
                dateModified: firebase.firestore.FieldValue.serverTimestamp()
            });

            return await this.getGroupStudies();
        } catch (error) {
            console.error('Error removing additional reference:', error);
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
