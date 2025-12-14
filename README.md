# 🛡️ Project Aegis Dashboard - LankaSafe

A comprehensive disaster management and emergency response dashboard for coordinating relief efforts, managing detention camps, tracking incidents, and organizing volunteer resources.

## 🌐 Live Demo

**[View Live Dashboard →](https://lankasafe.netlify.app/)**

## 📸 Screenshots

### Aid Request Tracking

![Dashboard Overview](https://res.cloudinary.com/dnfbik3if/image/upload/v1765684535/Screenshot_2025-12-14_092444_ybypkp.png)

### Detention Camp Management

![Incident Management](https://res.cloudinary.com/dnfbik3if/image/upload/v1765684535/Screenshot_2025-12-14_092450_yklviy.png)

### Incident Management 

![Aid Request Tracking](https://res.cloudinary.com/dnfbik3if/image/upload/v1765684535/Screenshot_2025-12-14_092438_qlqfyv.png)

### Volunteer Coordination

![Detention Camp Management](https://res.cloudinary.com/dnfbik3if/image/upload/v1765684534/Screenshot_2025-12-14_092456_h5ppb7.png)

### Statistics Detailed View

![Volunteer Coordination](https://res.cloudinary.com/dnfbik3if/image/upload/v1765684534/Screenshot_2025-12-14_092502_pqoueb.png)

## ✨ Features

- **📊 Real-time Dashboard** - Live statistics and overview of all emergency operations
- **🚨 Incident Management** - Track and manage emergency incidents with location mapping
- **🆘 Aid Request System** - Coordinate and prioritize aid requests from affected areas
- **🏕️ Detention Camp Management** - Monitor camp capacity, resources, and conditions
- **👥 Volunteer Coordination** - Manage volunteer registrations and task assignments
- **🗺️ Interactive Maps** - Visualize incidents, camps, and aid requests on interactive maps using Leaflet
- **📈 Analytics & Reporting** - Real-time charts and statistics powered by Recharts
- **📧 Email Notifications** - Automated email alerts for critical updates
- **🔐 Secure Admin Portal** - Protected dashboard with authentication
- **🔄 Real-time Sync** - Firebase integration for live data updates

## 🛠️ Tech Stack

- **Frontend Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Maps:** Leaflet & React Leaflet
- **Charts:** Recharts
- **Backend:** Firebase (Firestore, Authentication, Storage)
- **Email Service:** EmailJS
- **Icons:** Lucide React
- **Deployment:** Netlify

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd project-aegis-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Firebase**

   Create a `src/firebaseConfig.ts` file with your Firebase credentials:

   ```typescript
   export const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id",
   };
   ```

4. **Configure EmailJS**

   Update the email service configuration in `src/services/emailService.ts` with your EmailJS credentials.

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to `http://localhost:5173`

### Default Admin Credentials

- **Username:** admin
- **Password:** admin123

⚠️ **Important:** Change these credentials in production!

## 📦 Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder, ready for deployment.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📁 Project Structure

```
project-aegis-dashboard/
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── MapComponent.tsx
│   │   ├── StatsOverview.tsx
│   │   ├── IncidentList.tsx
│   │   ├── AidRequestList.tsx
│   │   ├── DetentionCampList.tsx
│   │   ├── VolunteerList.tsx
│   │   └── ...
│   ├── services/          # API and service layer
│   │   ├── firebaseService.ts
│   │   └── emailService.ts
│   ├── types.ts           # TypeScript type definitions
│   ├── mockData.ts        # Mock data for development
│   ├── firebaseConfig.ts  # Firebase configuration
│   └── App.tsx            # Main application component
├── public/                # Static assets
└── dist/                  # Production build output
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## 🔑 Key Components

### Dashboard

Main control center displaying real-time statistics, charts, and quick access to all modules.

### Incident Management

Track and categorize emergency incidents with severity levels, location data, and real-time status updates.

### Aid Request System

Coordinate aid distribution with priority levels, resource tracking, and fulfillment status.

### Detention Camp Management

Monitor camp operations including capacity, current occupancy, available resources, and camp conditions.

### Volunteer Coordination

Manage volunteer database with skill matching, availability tracking, and task assignment capabilities.

## 🔥 Firebase Collections

The application uses the following Firebase Firestore collections:

- `incidents` - Emergency incident reports
- `aidRequests` - Aid and resource requests
- `detentionCamps` - Camp information and status
- `volunteers` - Volunteer registrations and profiles

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Bug Reports

If you discover any bugs, please create an issue on GitHub with detailed information about the problem.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Development Team

Built with ❤️ for emergency response and disaster management.

## 🆘 Support

For support and queries, please open an issue in the GitHub repository.

## 🙏 Acknowledgments

- React Team for the amazing framework
- Firebase for backend infrastructure
- Leaflet for interactive mapping
- Recharts for data visualization
- All contributors and testers

---

**LankaSafe Dashboard** - Coordinating relief efforts, saving lives.
