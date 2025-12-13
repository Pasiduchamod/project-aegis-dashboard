# 📧 Free Email Service Setup Guide

## Overview

The dashboard now uses **EmailJS** - a completely free service to send automated emails to district officers with incident details. No backend server required!

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Free EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **"Sign Up"** - it's completely free!
3. Verify your email address
4. Log in to your EmailJS dashboard

---

### Step 2: Add Email Service

1. In EmailJS Dashboard, click **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended for testing)
   - Outlook
   - Yahoo
   - Or any custom SMTP
4. Follow the connection wizard
5. **IMPORTANT**: Copy your **Service ID** (e.g., `service_abc123`)

---

### Step 3: Create Email Template

1. In EmailJS Dashboard, click **"Email Templates"**
2. Click **"Create New Template"**
3. Set **Template Name**: `District Officer Alert` (or your choice)

#### Configure Email Template Fields:

**To Email Field:**

```
{{to_email}}
```

**Subject Field:**

```
{{subject}}
```

**Content/Message Field:**

```
{{message}}
```

4. **Save** the template
5. **IMPORTANT**: Copy your **Template ID** (e.g., `template_xyz789`)

---

### Step 4: Get Your Public Key

1. Go to **"Account"** → **"General"** in EmailJS Dashboard
2. Find your **Public Key** (e.g., `aBcDeFgHiJkLmN`)
3. Copy this key

---

### Step 5: Configure the Dashboard

1. Open the file: `src/services/emailService.ts`

2. Replace the placeholder values at the top:

```typescript
// REPLACE THESE VALUES:
const EMAILJS_SERVICE_ID = "service_abc123"; // Your Service ID from Step 2
const EMAILJS_TEMPLATE_ID = "template_xyz789"; // Your Template ID from Step 3
const EMAILJS_PUBLIC_KEY = "aBcDeFgHiJkLmN"; // Your Public Key from Step 4
```

3. Save the file

---

## ✅ Testing the Email Service

### For Incidents:

1. Open any incident in the dashboard
2. Click **"Email District Officer"** button
3. You should see a success message: ✅ Email sent successfully!
4. Check the district officer's email (e.g., `colombo@mailinator.com`)

### For Aid Requests:

1. Open any aid request in the dashboard
2. Click **"Email District Officer"** button
3. You should see a success message
4. Check the district officer's email

---

## 📧 Email Format

### Incident Email Subject:

```
[SEVERITY] Incident Type in District Name District
```

Example: `[CRITICAL] Fire Incident in Colombo District`

### Incident Email Content:

The email includes:

- **Incident Details**: Type, severity, district, timestamp
- **Location Information**: GPS coordinates + Google Maps link
- **Description**: If available
- **Images**: Number of photos attached
- **Incident ID**: For tracking

### Aid Request Email Subject:

```
[PRIORITY] Aid Request in District Name District
```

Example: `[URGENT PRIORITY] Aid Request in Kandy District`

### Aid Request Email Content:

The email includes:

- **Request Details**: Priority level, district, timestamp
- **Required Aid**: List of aid types (Food, Water, Medical, etc.)
- **Contact Information**: Requester name, phone, number of people
- **Location Information**: GPS coordinates + Google Maps link
- **Request ID**: For tracking

---

## 🌍 District Officer Email Mapping

Emails are automatically determined by the incident/request location:

| District | Email Address             |
| -------- | ------------------------- |
| Colombo  | `colombo@mailinator.com`  |
| Gampaha  | `gampaha@mailinator.com`  |
| Kalutara | `kalutara@mailinator.com` |
| Kandy    | `kandy@mailinator.com`    |
| Galle    | `galle@mailinator.com`    |
| Matara   | `matara@mailinator.com`   |
| Jaffna   | `jaffna@mailinator.com`   |
| ...      | ...                       |

> **Note**: Using mailinator.com for testing. For production, update district officer emails in `src/utils/emailUtils.ts`

---

## 🔍 Troubleshooting

### "Email service not configured" Alert?

- Make sure you've replaced the placeholder values in `emailService.ts`
- The values should NOT be `YOUR_SERVICE_ID`, `YOUR_TEMPLATE_ID`, etc.

### Email not sending?

1. Check browser console for errors
2. Verify your EmailJS credentials are correct
3. Make sure your EmailJS account is verified
4. Check if you've exceeded EmailJS free tier limits (200 emails/month)

### Wrong district officer receiving emails?

- Check the coordinates are within Sri Lanka
- Review district boundaries in `src/utils/emailUtils.ts`
- Adjust the `DISTRICT_BOUNDS` if needed

### Template variables not working?

- Ensure your EmailJS template uses exactly: `{{to_email}}`, `{{subject}}`, `{{message}}`
- Variables are case-sensitive

---

## 📊 EmailJS Free Tier Limits

- ✅ **200 emails per month** - Free forever
- ✅ **No credit card required**
- ✅ **Unlimited templates**
- ✅ **Multiple email services**

Need more? Upgrade to paid plans starting at $15/month for 1000 emails.

---

## 🔐 Security Notes

1. **Public Key is Safe**: The EmailJS public key can be exposed in client-side code
2. **Domain Whitelist**: Configure allowed domains in EmailJS dashboard for added security
3. **Rate Limiting**: EmailJS has built-in rate limiting to prevent abuse
4. **Email Verification**: Ensure your EmailJS email service is verified

---

## 🎯 Features

✅ **Free Service**: No cost, no backend required  
✅ **Automatic District Detection**: Uses GPS coordinates  
✅ **Professional Formatting**: Clean, readable emails  
✅ **Detailed Information**: All incident/aid request details included  
✅ **Google Maps Links**: Direct navigation to incident location  
✅ **Success Notifications**: User feedback on email status

---

## 📝 Customization

### Change District Officer Emails

Edit `src/utils/emailUtils.ts`:

```typescript
export function getDistrictOfficerEmail(district: string): string {
  if (district === "Unknown") return "";
  // Update this to use real email addresses:
  return `${district.toLowerCase()}@your-domain.com`;
}
```

### Modify Email Content

Edit email templates in `src/services/emailService.ts`:

- `formatIncidentEmailContent()` - For incident emails
- `formatAidRequestEmailContent()` - For aid request emails

---

## 🆘 Support

- **EmailJS Documentation**: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- **EmailJS Support**: [https://www.emailjs.com/support/](https://www.emailjs.com/support/)

---

## ✅ Checklist

- [ ] Created EmailJS account
- [ ] Added email service (Gmail/Outlook/etc.)
- [ ] Created email template with `{{to_email}}`, `{{subject}}`, `{{message}}`
- [ ] Copied Service ID
- [ ] Copied Template ID
- [ ] Copied Public Key
- [ ] Updated `src/services/emailService.ts` with your credentials
- [ ] Tested sending an email
- [ ] Verified email received successfully

---

**That's it! Your free email service is ready to notify district officers about incidents! 🎉**
