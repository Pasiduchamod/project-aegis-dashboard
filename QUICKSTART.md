# 🚀 LankaSafe HQ Dashboard - Quick Start Guide

Welcome to the **LankaSafe HQ Dashboard**! This guide will help you get started with the project in minutes.

## 📋 Prerequisites

Before you begin, make sure you have the following installed on your system:

- **Node.js** (version 16.x or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- A code editor (we recommend [VS Code](https://code.visualstudio.com/))

## 🔧 Step 1: Clone or Fork the Repository

### Option A: Clone the Repository
```bash
git clone <repository-url>
cd project-aegis-dashboard
```

### Option B: Fork the Repository
1. Click the "Fork" button on the repository page
2. Clone your forked repository:
```bash
git clone <your-fork-url>
cd project-aegis-dashboard
```

## 📦 Step 2: Install Dependencies

Run the following command in the project root directory:

```bash
npm install
```

This will install all required dependencies including:
- React 19.2.0
- TypeScript
- Vite (build tool)
- Firebase
- Leaflet (for maps)
- Recharts (for statistics)
- Tailwind CSS
- Lucide React (icons)

## 🔥 Step 3: Configure Firebase

The application uses Firebase for real-time data synchronization. You have two options:

### Option A: Use Existing Configuration (Development/Testing)
The repository includes a pre-configured Firebase setup for testing. You can start the app immediately.

### Option B: Use Your Own Firebase Project (Recommended for Production)

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project" and follow the setup wizard
   - Enable Google Analytics (optional)

2. **Set Up Firestore Database:**
   - In your Firebase project, go to "Firestore Database"
   - Click "Create Database"
   - Start in **production mode** or **test mode** (for development)
   - Choose a Cloud Firestore location

3. **Create Collections:**
   Create the following collections in Firestore:
   - `incidents` - For emergency incident reports
   - `aidRequests` - For aid/rescue requests
   - `detentionCamps` - For refugee camp information
   - `volunteers` - For volunteer registrations

4. **Get Your Firebase Config:**
   - Go to Project Settings (⚙️ icon)
   - Scroll down to "Your apps" section
   - Click the web icon (`</>`) to add a web app
   - Copy the `firebaseConfig` object

5. **Update Configuration:**
   - Open `src/firebaseConfig.ts`
   - Replace the existing config with your Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

6. **Set Firestore Security Rules (Important!):**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow read access to all authenticated users
       match /{document=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
     }
   }
   ```

## 🚀 Step 4: Start the Development Server

Run the following command:

```bash
npm run dev
```

The application will start on `http://localhost:5173/` (or another port if 5173 is busy).

## 🔐 Step 5: Login

The dashboard uses a simple authentication system:

**Default Credentials:**
- **Email:** `admin@lankasafe.lk`
- **Password:** `admin123`

> ⚠️ **Note:** This is a basic authentication setup. For production use, implement proper Firebase Authentication.

## 🗺️ Step 6: Explore the Dashboard

Once logged in, you'll see:

1. **Navigation Bar:**
   - District filter (filter incidents by Sri Lankan districts)
   - Sort options (Most Recent, Oldest First, By Severity)
   - Live sync indicator
   - Logout button

2. **Tabs:**
   - **Incidents** - View and manage emergency incidents
   - **Aid Requests** - Track aid/rescue requests
   - **Detention Camps** - Manage refugee camps
   - **Volunteers** - View volunteer registrations
   - **Overview & Stats** - Dashboard statistics and analytics

3. **Features:**
   - Interactive map showing incident locations
   - Real-time data updates from Firebase
   - Filter by status (Critical, Pending, Completed)
   - Click on map markers for detailed information
   - Click map to add new detention camps

## 📁 Project Structure

```
project-aegis-dashboard/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images and logos
│   ├── components/     # React components
│   │   ├── Dashboard.tsx
│   │   ├── MapComponent.tsx
│   │   ├── IncidentList.tsx
│   │   ├── AidRequestList.tsx
│   │   └── ...
│   ├── services/       # Firebase and API services
│   │   ├── firebaseService.ts
│   │   └── emailService.ts
│   ├── utils/          # Utility functions
│   ├── types.ts        # TypeScript type definitions
│   ├── firebaseConfig.ts  # Firebase configuration
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Building for Production

When you're ready to deploy:

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## 📱 Connecting Mobile App

If you have the mobile companion app (Project Aegis):

1. Ensure both apps use the same Firebase project
2. Mobile app will send incidents/aid requests to Firestore
3. Dashboard will display them in real-time
4. No additional configuration needed!

## 🔍 Troubleshooting

### Port Already in Use
If port 5173 is busy, Vite will automatically use another port. Check the terminal output.

### Firebase Connection Issues
- Verify your `firebaseConfig` is correct
- Check Firestore security rules
- Ensure you have internet connection

### Map Not Loading
- Check browser console for errors
- Ensure Leaflet CSS is loaded
- Try clearing browser cache

### No Data Showing
- Verify Firebase collections exist
- Check if you have data in Firestore
- Ensure Firestore security rules allow reads

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Leaflet Documentation](https://leafletjs.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the LankaSafe emergency response system.

## 💬 Support

If you encounter any issues or have questions:
- Check the troubleshooting section above
- Open an issue on GitHub
- Review the code comments for guidance

---

**Happy Coding! 🎉**

Now you're ready to start using the LankaSafe HQ Dashboard!
