# 📧 Email Service Architecture

## 🔄 Email Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DASHBOARD USER                               │
│                                                                      │
│  1. Views incident/aid request details                              │
│  2. Clicks "Email District Officer" button                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EMAIL SERVICE                                   │
│                  (emailService.ts)                                   │
│                                                                      │
│  1. Extract incident/aid request details                            │
│  2. Get GPS coordinates (lat, lng)                                   │
│  3. Determine district from coordinates                              │
│  4. Get district officer email                                       │
│  5. Format professional email:                                       │
│     - Subject: [SEVERITY] Type in District                           │
│     - Body: All details + Google Maps link                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         EMAILJS SERVICE                              │
│                    (emailjs.com - FREE)                              │
│                                                                      │
│  1. Receives email data via API                                      │
│  2. Validates template variables                                     │
│  3. Connects to your email service (Gmail/Outlook)                   │
│  4. Sends email to district officer                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DISTRICT OFFICER EMAIL                            │
│              (e.g., colombo@mailinator.com)                          │
│                                                                      │
│  📧 Receives formatted email with:                                   │
│     • Incident/Aid details                                           │
│     • Location coordinates                                           │
│     • Google Maps link                                               │
│     • Contact information                                            │
│     • Tracking ID                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ System Components

### 1. **Email Service** (`src/services/emailService.ts`)

**Functions:**

- `initEmailService()` - Initialize EmailJS with public key
- `sendIncidentEmail(incident)` - Send email for incidents
- `sendAidRequestEmail(aidRequest)` - Send email for aid requests
- `formatIncidentEmailContent()` - Format incident email
- `formatAidRequestEmailContent()` - Format aid request email

**Dependencies:**

- `@emailjs/browser` npm package
- `src/types.ts` - TypeScript interfaces
- `src/utils/emailUtils.ts` - District mapping

### 2. **Email Utils** (`src/utils/emailUtils.ts`)

**Functions:**

- `getDistrictFromCoordinates(lat, lng)` - Returns district name
- `getDistrictOfficerEmail(district)` - Returns officer email

**Data:**

- `DISTRICT_BOUNDS` - GPS boundaries for all 25 Sri Lankan districts

### 3. **UI Components**

**IncidentDetailModal** (`src/components/IncidentDetailModal.tsx`)

```typescript
const handleSendEmail = async () => {
  await sendIncidentEmail(incident);
};
```

**AidRequestDetailModal** (`src/components/AidRequestDetailModal.tsx`)

```typescript
const handleSendEmail = async () => {
  await sendAidRequestEmail(aidRequest);
};
```

### 4. **App Initialization** (`src/App.tsx`)

```typescript
useEffect(() => {
  initEmailService(); // Initialize EmailJS on app startup
}, []);
```

---

## 📊 Data Flow

### Incident Email Example:

```
INPUT (Incident Object):
{
  id: "inc_123",
  type: "Fire",
  severity: 5,
  latitude: 6.9271,
  longitude: 79.8612,
  timestamp: 1702468800000,
  description: "Large fire at warehouse",
  cloudImageUrls: ["url1", "url2"]
}

↓ PROCESS

1. District Detection:
   6.9271, 79.8612 → "Colombo"

2. Email Mapping:
   "Colombo" → "colombo@mailinator.com"

3. Email Formatting:
   Subject: "[CRITICAL] Fire Incident in Colombo District"
   Body: [Formatted with all details]

↓ OUTPUT

EmailJS API Call:
{
  to_email: "colombo@mailinator.com",
  subject: "[CRITICAL] Fire Incident in Colombo District",
  message: [Formatted message],
  incident_id: "inc_123",
  severity: 5,
  district: "Colombo"
}

↓ RESULT

✅ Email delivered to district officer
```

---

## 🗺️ District Mapping System

### GPS to District:

```javascript
DISTRICT_BOUNDS = {
  Colombo: [6.78, 79.74, 7.05, 80.05],
  // [minLat, minLng, maxLat, maxLng]
  Kandy: [7.1, 80.45, 7.5, 80.85],
  Galle: [5.95, 80.05, 6.3, 80.4],
  // ... all 25 districts
};
```

### District to Email:

```javascript
getDistrictOfficerEmail("Colombo") → "colombo@mailinator.com"
getDistrictOfficerEmail("Kandy")   → "kandy@mailinator.com"
getDistrictOfficerEmail("Galle")   → "galle@mailinator.com"
```

---

## 🔧 Configuration

### EmailJS Setup (One Time):

```
1. Create Account → emailjs.com
2. Add Email Service → Gmail/Outlook
3. Create Template → to_email, subject, message
4. Get Credentials:
   - Service ID:  service_abc123
   - Template ID: template_xyz789
   - Public Key:  aBcDeFgHiJkLmN
5. Update emailService.ts
```

---

## 🎯 Email Templates

### Incident Email:

```
Subject: [CRITICAL] Fire Incident in Colombo District

Body:
Dear District Officer,

An incident has been reported in your district...

INCIDENT DETAILS:
─────────────────
Type: Fire
Severity: CRITICAL (5/5)
District: Colombo
Reported At: Dec 13, 2025, 3:00 PM

LOCATION:
─────────
Coordinates: 6.927100, 79.861200
Google Maps: https://www.google.com/maps?q=6.927100,79.861200

📷 Images Available: 2 photo(s)

INCIDENT ID: inc_123
```

### Aid Request Email:

```
Subject: [URGENT PRIORITY] Aid Request in Kandy District

Body:
Dear District Officer,

An aid request has been submitted...

AID REQUEST DETAILS:
───────────────────
Priority: URGENT (5/5)
District: Kandy
Requested At: Dec 13, 2025, 3:00 PM

Required Aid:
• Food
• Water
• Medical Supplies

CONTACT INFORMATION:
───────────────────
Contact Person: John Doe
Phone: +94771234567
Number of People: 25

REQUEST ID: aid_456
```

---

## 🚀 Performance

- **Email Send Time:** ~1-2 seconds
- **Free Tier:** 200 emails/month
- **No Backend:** Client-side only
- **No Database:** Direct API calls

---

## 🔒 Security

✅ **Public Key is Safe** - Designed for client-side use  
✅ **Rate Limited** - EmailJS prevents spam  
✅ **Domain Whitelist** - Configure in EmailJS dashboard  
✅ **Email Validation** - Service must be verified

---

## 📈 Scalability

**Current Setup:**

- ✅ Handles 200 emails/month (free)
- ✅ No server costs
- ✅ No maintenance

**If You Need More:**

- 💰 $15/month → 1,000 emails
- 💰 $32/month → 5,000 emails
- 💰 $82/month → 20,000 emails

---

## ✅ Implementation Checklist

- [x] EmailJS package installed
- [x] Email service created
- [x] District mapping implemented
- [x] UI components updated
- [x] Email formatting implemented
- [x] Error handling added
- [x] Success feedback added
- [ ] **YOU DO:** Configure EmailJS credentials
- [ ] **YOU DO:** Test email sending

---

**Ready to send professional incident alerts! 🎉**
