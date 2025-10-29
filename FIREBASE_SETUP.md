# Firebase Setup Instructions

This guide will help you set up Firebase Authentication for your Bible Memory app.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter a project name (e.g., "Bible Memory App")
   - Choose whether to enable Google Analytics (optional)
   - Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`) to add a web app
2. Register your app:
   - Enter an app nickname (e.g., "Bible Memory Web")
   - Check "Also set up Firebase Hosting" if you want (optional)
   - Click "Register app"

3. Copy the Firebase configuration object shown on screen. It will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef..."
};
```

## Step 3: Enable Google Authentication

1. In the Firebase Console, go to **Authentication** from the left sidebar
2. Click on the **Sign-in method** tab
3. Click on **Google** in the providers list
4. Toggle the **Enable** switch
5. Select a **Project support email** from the dropdown
6. Click **Save**

## Step 4: Configure Your App

1. Open the `firebase-config.js` file in your project
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",              // Replace with your API key
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",        // Replace with your project ID
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"                 // Replace with your app ID
};
```

## Step 5: Configure Authorized Domains

If you're hosting your app on a custom domain or localhost:

1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add your domain(s):
   - For local development: `localhost` (should be there by default)
   - For production: Add your custom domain (e.g., `yourdomain.com`)

## Step 6: Test Your Setup

1. Open `index.html` in a web browser
2. You should see the login screen
3. Click "Sign in with Google"
4. Complete the Google sign-in flow
5. You should be redirected to the main app

## Troubleshooting

### "Firebase is not configured" Error
- Make sure you've replaced all placeholder values in `firebase-config.js`
- Check that the Firebase SDK scripts are loading correctly

### "Unauthorized domain" Error
- Go to Firebase Console > Authentication > Settings > Authorized domains
- Add your domain to the list

### Sign-in Redirect Issues
- The app uses redirect-based authentication to avoid Cross-Origin-Opener-Policy (COOP) errors
- The page will redirect to Google for sign-in and then back to your app
- Make sure your domain is listed in Firebase Console > Authentication > Authorized domains

### Console Errors
- Open browser developer tools (F12)
- Check the Console tab for specific error messages
- Make sure all Firebase configuration values are correct

## Data Storage

Currently, all verse data is stored locally in the browser's localStorage. Each user's data is stored separately using their Firebase user ID as a key prefix (`bible_verses_<user_id>`).

When you're ready to add a database:
- You can use Firebase Firestore or Realtime Database
- The StorageService can be updated to sync with the cloud database
- User data will persist across devices

## Security Notes

- Never commit your actual Firebase configuration to a public repository
- Consider using environment variables or a separate config file that's gitignored
- Review Firebase Security Rules when you add a database

## Next Steps

Once authentication is working:
1. Test adding verses while logged in
2. Sign out and sign in with a different Google account
3. Verify that each user has their own set of verses
4. Plan your database integration (Firestore recommended)

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com/)
