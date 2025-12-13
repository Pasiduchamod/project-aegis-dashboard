# 🎯 ACTION REQUIRED: Configure Email Service

## ⚠️ Important - Do These 3 Steps:

---

## Step 1️⃣: Get EmailJS Account (2 minutes)

1. Visit: https://www.emailjs.com/
2. Click "Sign Up" (FREE)
3. Verify your email
4. Log in

---

## Step 2️⃣: Setup EmailJS (3 minutes)

### A. Add Email Service:

1. Dashboard → "Email Services"
2. "Add New Service"
3. Choose "Gmail" (or your preference)
4. Connect your email
5. **Copy the Service ID** (looks like: `service_abc123`)

### B. Create Template:

1. Dashboard → "Email Templates"
2. "Create New Template"
3. Fill in:
   - **To Email:** `{{to_email}}`
   - **Subject:** `{{subject}}`
   - **Content:** `{{message}}`
4. Save
5. **Copy the Template ID** (looks like: `template_xyz789`)

### C. Get Public Key:

1. Dashboard → "Account" → "General"
2. Find "Public Key"
3. **Copy the Public Key** (looks like: `aBcDeFgHiJkLmN`)

---

## Step 3️⃣: Update Code (30 seconds)

Open file: **`src/services/emailService.ts`**

Find these lines (at the top):

```typescript
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
```

Replace with YOUR values:

```typescript
const EMAILJS_SERVICE_ID = "service_abc123"; // Your Service ID
const EMAILJS_TEMPLATE_ID = "template_xyz789"; // Your Template ID
const EMAILJS_PUBLIC_KEY = "aBcDeFgHiJkLmN"; // Your Public Key
```

Save the file.

---

## ✅ Test It!

1. Run your dashboard: `npm run dev`
2. Open any incident
3. Click "Email District Officer"
4. Should see: **✅ Email sent successfully!**
5. Check email at: https://www.mailinator.com/ (enter inbox: `colombo`)

---

## 🎉 You're Done!

Now when you click "Email District Officer", it will automatically:

- ✅ Detect the district from GPS coordinates
- ✅ Format a professional email with all incident details
- ✅ Send to the correct district officer
- ✅ Include Google Maps link for navigation
- ✅ Show success confirmation

---

## 📚 Need Help?

See detailed guides:

- **Quick Start:** `EMAIL_QUICK_START.md`
- **Full Setup:** `EMAIL_SERVICE_SETUP.md`
- **Architecture:** `EMAIL_SERVICE_ARCHITECTURE.md`

---

## 🆘 Troubleshooting

**"Email service not configured" message?**
→ You forgot Step 3 (update the credentials in emailService.ts)

**Email not arriving?**
→ Check spam folder, verify EmailJS account, check console for errors

**Wrong district?**
→ Check GPS coordinates are correct in the incident data

---

**Total Time: 5 minutes • Cost: FREE (200 emails/month)** 🎯
