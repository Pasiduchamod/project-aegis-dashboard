# Firebase Setup Instructions

## 🔥 Dashboard Connected to Firebase Firestore

### ✅ Configuration Complete!

Your dashboard is already configured with your Firebase project:

**Project:** `project-aegis-ce5a8`  
**Database:** Firestore  
**Collection:** `incidents`

### Step 1: Configure Firestore Security Rules

In Firebase Console, go to **Firestore Database** > **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /incidents/{incidentId} {
      // Anyone can read incidents (for the dashboard)
      allow read: if true;
      
      // Only authenticated users can write (your mobile app)
      allow write: if request.auth != null;
    }
  }
}
```

This allows:
- ✅ Anyone to **read** incidents (for the dashboard)
- ✅ Only **authenticated users** to write (your mobile app)

### Step 2: Publish the Rules

1. Click **Publish** in Firebase Console
2. Your dashboard will now be able to read incident data!

### Step 4: Test the Connection

1. Save your changes
2. The dashboard will automatically reload
3. You should see real-time incidents from your mobile app!

## 🎯 Features

✅ **Real-time Updates** - Dashboard automatically updates when new incidents are reported  
✅ **Live Sync** - Green pulsing indicator shows active connection  
✅ **Auto-sorting** - Newest incidents appear first  
✅ **Error Handling** - Clear error messages if connection fails  

## 🔧 Troubleshooting

### "Failed to connect to database"
- Check that your Firebase config values are correct
- Ensure your database URL includes your project ID
- Verify Firebase Realtime Database is enabled in your project

### "Permission denied"
- Update your database rules to allow read access
- Make sure the rules are published

### No incidents showing
- Check that your mobile app is writing to the correct database
- Verify the data structure matches: `incidents/{incidentId}`
- Check Firebase Console to confirm incidents exist

## 📱 Mobile App Integration

Your mobile app should already be configured to write to the same Firebase database. The incidents will automatically sync to the dashboard in real-time!
