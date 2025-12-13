# 📧 Email Configuration Guide

## Automatic Email Sending Setup

The dashboard now supports **automatic email sending** to district officers when you click the "Email District Officer" button. This uses [EmailJS](https://www.emailjs.com/) - a free service for sending emails directly from JavaScript.

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **"Sign Up"** (it's free!)
3. Verify your email address

### Step 2: Add Email Service
1. In your EmailJS Dashboard, click **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider (Gmail recommended for testing)
4. Follow the connection instructions
5. **Copy your Service ID** (e.g., `service_xyz123`)

### Step 3: Create Email Template
1. In your EmailJS Dashboard, click **"Email Templates"**
2. Click **"Create New Template"**
3. You'll see a template editor with several fields. Fill them as follows:

#### A. Template Settings (Top of the page):
- **Template Name**: `District Officer Alert` (or any name you prefer)

#### B. Email Content Fields:

**To Email** field:
```
{{to_email}}
```
*(This is the recipient's email - the system will automatically fill this with the district officer's email)*

**Subject** field:
```
{{subject}}
```
*(The system will automatically generate the subject line based on incident/aid type)*

**Content** field (the main message body):
```
{{message}}

---
Alert Details:
District: {{district}}

---
This is an automated alert from LankaSafe HQ Emergency Response System
```

#### C. Understanding Template Variables (Important!):

Template variables are placeholders wrapped in double curly braces `{{variable_name}}`. EmailJS will replace these with actual values when sending emails.

**Our system sends these variables:**
- `{{to_email}}` - Gets replaced with district officer email (e.g., colombo@mailinator.com)
- `{{subject}}` - Gets replaced with email subject (e.g., "[CRITICAL] Fire Incident in Colombo District")
- `{{message}}` - Gets replaced with the full incident/aid details
- `{{district}}` - Gets replaced with district name (e.g., "Colombo")
- `{{reply_to}}` - Gets replaced with 'lankasafe@emergency.gov.lk'

**Example of what gets sent:**
When an incident happens in Colombo, the template variables become:
- `{{to_email}}` → `colombo@mailinator.com`
- `{{subject}}` → `[CRITICAL] Fire Incident in Colombo District`
- `{{message}}` → Full incident description with location, severity, etc.
- `{{district}}` → `Colombo`

#### D. Optional Settings (at the bottom):

**From Name**: 
```
LankaSafe HQ
```

**From Email**: 
```
(Use your email address - this is set in Email Service settings)
```

**Reply To** (if available):
```
{{reply_to}}
```
*(This allows district officers to reply to lankasafe@emergency.gov.lk)*

4. Click **"Save"** button at the top right
5. **Copy your Template ID** from the template list (e.g., `template_abc456`)

#### ✅ Quick Check:
Your template should look like this in the editor:
- **To Email box**: `{{to_email}}`
- **Subject box**: `{{subject}}`  
- **Content/Message box**: `{{message}}` followed by footer info

**Don't write actual email addresses or text in these fields** - keep the `{{variable}}` format so the system can fill them automatically!

### Step 4: Get Your Public Key
1. In your EmailJS Dashboard, click **"Account"**
2. Find your **Public Key** (e.g., `YOUR_PUBLIC_KEY_HERE`)
3. **Copy this key**

### Step 5: Update Configuration
1. Open: `src/config/emailConfig.ts`
2. Replace the placeholder values:

```typescript
export const EMAIL_CONFIG = {
  SERVICE_ID: 'your_service_id_here',     // From Step 2
  TEMPLATE_ID: 'your_template_id_here',   // From Step 3
  PUBLIC_KEY: 'your_public_key_here',     // From Step 4
};
```

---

## ✅ Testing

1. Start your dashboard: `npm run dev`
2. Click on any incident or aid request
3. Click **"Email District Officer"**
4. Watch for the success message: "Email sent successfully to [District] Officer"
5. Check the district officer's email inbox (e.g., colombo@mailinator.com)
   - Go to [https://www.mailinator.com/](https://www.mailinator.com/)
   - Enter: `colombo` (or any district name)
   - Click **"GO"** to see the inbox

---

## 📋 District Email Addresses

All district officers use the format: `{district}@mailinator.com`

Examples:
- Colombo: `colombo@mailinator.com`
- Kandy: `kandy@mailinator.com`
- Galle: `galle@mailinator.com`
- Jaffna: `jaffna@mailinator.com`

*(All 25 districts are supported!)*

---

## 🎯 Features

### Automatic Email Includes:
- **For Incidents:**
  - Severity level (CRITICAL/HIGH/MODERATE)
  - Incident type and location
  - Google Maps link
  - Timestamp and Incident ID

- **For Aid Requests:**
  - Priority level (URGENT/HIGH/NORMAL)
  - Required aid types
  - Contact information
  - Google Maps link
  - Request ID

### UI Features:
- ✅ Loading spinner while sending
- ✅ Success notification (auto-hides after 5 seconds)
- ✅ Error messages if sending fails
- ✅ Button disabled during sending

---

## 🔧 Troubleshooting

### Email not sending?
1. Check console for errors (F12 → Console)
2. Verify your EmailJS credentials are correct
3. Make sure you're connected to the internet
4. Check EmailJS dashboard for usage limits

### "EmailJS not configured" message?
- You haven't updated the config file yet
- Follow Step 5 above to add your credentials

### Rate Limiting?
- EmailJS free tier: 200 emails/month
- Upgrade to paid plan for more emails

---

## 💡 Fallback Mode

If EmailJS is not configured, the system automatically falls back to opening your default email client with a pre-filled message. This ensures the feature works even without EmailJS setup!

---

## 🆓 EmailJS Pricing

- **Free Plan**: 200 emails/month (perfect for testing)
- **Personal Plan**: $7/month for 1,000 emails
- **Professional Plan**: More emails for larger teams

[View pricing](https://www.emailjs.com/pricing/)

---

## 📚 Additional Resources

- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [React Integration Guide](https://www.emailjs.com/docs/examples/reactjs/)
- [API Reference](https://www.emailjs.com/docs/sdk/send/)

---

**Need help?** Check the EmailJS docs or ask your team lead!
