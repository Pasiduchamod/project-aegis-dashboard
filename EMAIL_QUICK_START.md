# 📧 Email Service - Quick Start

## ✅ What You Got

A **FREE email notification system** that automatically sends detailed incident reports to district officers!

---

## 🎯 Features

### For Incidents:

```
📧 Email Subject: [CRITICAL] Fire Incident in Colombo District

📋 Email Contains:
  ✓ Incident type and severity
  ✓ District and location details
  ✓ GPS coordinates + Google Maps link
  ✓ Timestamp
  ✓ Description (if any)
  ✓ Number of photos
  ✓ Incident ID for tracking
```

### For Aid Requests:

```
📧 Email Subject: [URGENT PRIORITY] Aid Request in Kandy District

📋 Email Contains:
  ✓ Priority level
  ✓ Required aid types (Food, Water, Medical, etc.)
  ✓ Contact person and phone
  ✓ Number of people affected
  ✓ GPS coordinates + Google Maps link
  ✓ Request ID for tracking
```

---

## 🚀 How to Use

### 1. Setup (One Time - 5 Minutes)

**Step A:** Go to https://www.emailjs.com/ → Sign up (free)

**Step B:** Add your email service (Gmail/Outlook)

**Step C:** Create email template:

- To: `{{to_email}}`
- Subject: `{{subject}}`
- Message: `{{message}}`

**Step D:** Copy these 3 values:

- Service ID
- Template ID
- Public Key

**Step E:** Open `src/services/emailService.ts` and replace:

```typescript
const EMAILJS_SERVICE_ID = "your_service_id_here";
const EMAILJS_TEMPLATE_ID = "your_template_id_here";
const EMAILJS_PUBLIC_KEY = "your_public_key_here";
```

### 2. Send Emails (Anytime)

1. Open any incident or aid request in dashboard
2. Click **"Email District Officer"** button
3. Done! ✅ Email sent automatically

---

## 🌍 Auto District Detection

The system automatically determines which district officer to email:

- Incident in Colombo → emails `colombo@mailinator.com`
- Incident in Kandy → emails `kandy@mailinator.com`
- Aid request in Galle → emails `galle@mailinator.com`
- ... etc for all 25 districts

---

## 🧪 Testing

**Use Mailinator (Free Testing):**

1. Send email to Colombo officer
2. Visit https://www.mailinator.com/
3. Enter inbox: `colombo`
4. See your email! 📧

---

## 💰 Pricing

**FREE:**

- 200 emails/month
- No credit card needed
- No backend server required
- Forever free!

---

## 📚 Full Documentation

- **Complete Setup Guide:** `EMAIL_SERVICE_SETUP.md`
- **Implementation Details:** `EMAIL_SERVICE_IMPLEMENTATION.md`
- **Code:** `src/services/emailService.ts`

---

## ⚡ That's It!

Just configure EmailJS credentials (5 minutes) and you're ready to send professional incident alerts to district officers! 🎉

**Questions?** Check `EMAIL_SERVICE_SETUP.md` for troubleshooting.
