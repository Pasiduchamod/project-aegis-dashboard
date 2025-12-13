import emailjs from '@emailjs/browser';
import type { AidRequest, Incident } from '../types.js';
import { getDistrictFromCoordinates, getDistrictOfficerEmail } from '../utils/emailUtils.js';

/**
 * Show toast notification
 */
function showToast(title: string, message: string, type: 'success' | 'error') {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 max-w-sm w-full bg-slate-800 border rounded-lg shadow-lg overflow-hidden animate-slide-in`;
  toast.style.animation = 'slideIn 0.3s ease-out';
  
  const borderColor = type === 'success' ? 'border-green-500' : 'border-red-500';
  const iconColor = type === 'success' ? 'text-green-400' : 'text-red-400';
  const icon = type === 'success' ? '✓' : '✕';
  
  toast.innerHTML = `
    <div class="flex items-start p-4 border-l-4 ${borderColor}">
      <div class="flex-shrink-0">
        <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center ${iconColor} font-bold text-lg">
          ${icon}
        </div>
      </div>
      <div class="ml-3 flex-1">
        <p class="text-sm font-semibold text-white">${title}</p>
        <p class="text-sm text-slate-300 mt-1">${message}</p>
      </div>
      <button class="ml-4 text-slate-400 hover:text-white" onclick="this.parentElement.parentElement.remove()">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
  
  // Add animations if not already present
  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// EmailJS configuration
// These values need to be configured in your EmailJS dashboard
// Visit https://www.emailjs.com/ to set up your account
const EMAILJS_SERVICE_ID = 'service_emh2kyl'; // Replace with your EmailJS Service ID
const EMAILJS_TEMPLATE_ID = 'template_2rgexkg'; // Replace with your EmailJS Template ID
const EMAILJS_PUBLIC_KEY = '6nFk29xR7dbPSV6z8'; // Replace with your EmailJS Public Key

/**
 * Initialize EmailJS with public key
 */
export function initEmailService() {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

/**
 * Format incident details for email
 */
function formatIncidentEmailContent(incident: Incident): {
  subject: string;
  message: string;
  to_email: string;
} {
  const district = getDistrictFromCoordinates(incident.latitude, incident.longitude);
  const to_email = getDistrictOfficerEmail(district);
  
  const date = new Date(incident.timestamp).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  
  const severityLabel = incident.severity >= 4 ? 'CRITICAL' : incident.severity >= 3 ? 'HIGH' : 'MODERATE';
  const mapsUrl = `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`;
  
  const subject = `[${severityLabel}] ${incident.type} Incident in ${district} District`;
  
  const message = `Dear District Officer,

An incident has been reported in your district that requires immediate attention.

INCIDENT DETAILS:
─────────────────
Type: ${incident.type}
Severity: ${severityLabel} (${incident.severity}/5)
District: ${district}
Reported At: ${date}
${incident.location ? `Location: ${incident.location}\n` : ''}
${incident.description ? `\nDescription:\n${incident.description}\n` : ''}
LOCATION:
─────────
Coordinates: ${incident.latitude.toFixed(6)}, ${incident.longitude.toFixed(6)}
Google Maps: ${mapsUrl}

INCIDENT ID: ${incident.id}

Please take necessary action and update the incident status in the LankaSafe HQ Dashboard.

${incident.cloudImageUrls && incident.cloudImageUrls.length > 0 ? 
`\n📷 Images Available: ${incident.cloudImageUrls.length} photo(s) attached to this incident` : ''}

─────────────────────────────────────────────
This is an automated alert from LankaSafe HQ
Emergency Response System`;

  return { subject, message, to_email };
}

/**
 * Format aid request details for email
 */
function formatAidRequestEmailContent(aidRequest: AidRequest): {
  subject: string;
  message: string;
  to_email: string;
} {
  const district = getDistrictFromCoordinates(aidRequest.latitude, aidRequest.longitude);
  const to_email = getDistrictOfficerEmail(district);
  
  const date = new Date(aidRequest.created_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  
  const priorityLabel = aidRequest.priority_level >= 4 ? 'URGENT' : aidRequest.priority_level >= 3 ? 'HIGH' : 'NORMAL';
  const mapsUrl = `https://www.google.com/maps?q=${aidRequest.latitude},${aidRequest.longitude}`;
  
  let aidTypes: string[] = [];
  try {
    aidTypes = JSON.parse(aidRequest.aid_types);
  } catch {
    aidTypes = [aidRequest.aid_types];
  }
  
  const subject = `[${priorityLabel} PRIORITY] Aid Request in ${district} District`;
  
  const message = `Dear District Officer,

An aid request has been submitted in your district that requires assistance.

AID REQUEST DETAILS:
───────────────────
Priority: ${priorityLabel} (${aidRequest.priority_level}/5)
District: ${district}
Requested At: ${date}

Required Aid:
${aidTypes.map(type => `• ${type}`).join('\n')}

${aidRequest.description ? `\nAdditional Information:\n${aidRequest.description}\n` : ''}
${aidRequest.requester_name || aidRequest.contact_number ? `
CONTACT INFORMATION:
───────────────────
${aidRequest.requester_name ? `Contact Person: ${aidRequest.requester_name}` : ''}
${aidRequest.contact_number ? `Phone: ${aidRequest.contact_number}` : ''}
${aidRequest.number_of_people ? `Number of People: ${aidRequest.number_of_people}` : ''}
` : ''}
LOCATION:
─────────
Coordinates: ${aidRequest.latitude.toFixed(6)}, ${aidRequest.longitude.toFixed(6)}
Google Maps: ${mapsUrl}

REQUEST ID: ${aidRequest.id}

Please coordinate with the requesting party and provide necessary assistance.

─────────────────────────────────────────────
This is an automated alert from LankaSafe HQ
Emergency Response System`;

  return { subject, message, to_email };
}

/**
 * Send email for an incident using EmailJS
 * @param incident The incident details
 * @returns Promise that resolves when email is sent
 */
export async function sendIncidentEmail(incident: Incident): Promise<void> {
  const { subject, message, to_email } = formatIncidentEmailContent(incident);

  if (!to_email) {
    alert('Unable to determine district officer email from coordinates');
    return;
  }

  try {
    // Send email using EmailJS
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email,
        subject,
        message,
      }
    );

    showToast('Email sent successfully', `Alert sent to ${to_email}`, 'success');
  } catch (error) {
    console.error('Failed to send email:', error);
    showToast('Email failed', 'Unable to send alert. Please try again.', 'error');
    throw error;
  }
}

/**
 * Send email for an aid request using EmailJS
 * @param aidRequest The aid request details
 * @returns Promise that resolves when email is sent
 */
export async function sendAidRequestEmail(aidRequest: AidRequest): Promise<void> {
  const { subject, message, to_email } = formatAidRequestEmailContent(aidRequest);

  if (!to_email) {
    alert('Unable to determine district officer email from coordinates');
    return;
  }

  try {
    // Send email using EmailJS
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email,
        subject,
        message,
      }
    );

    showToast('Email sent successfully', `Alert sent to ${to_email}`, 'success');
  } catch (error) {
    console.error('Failed to send email:', error);
    showToast('Email failed', 'Unable to send alert. Please try again.', 'error');
    throw error;
  }
}

/**
 * Fallback to mailto link if EmailJS is not configured
 */
export function sendEmailViaMailto(to: string, subject: string, body: string): void {
  const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink, '_blank');
}
