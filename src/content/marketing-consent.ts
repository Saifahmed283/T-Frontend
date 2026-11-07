/**
 * Marketing Consent types and utilities
 */
export type MarketingList = 'newsletter' | 'events' | 'insights' | 'careers';

export const MARKETING_LISTS: { value: MarketingList; label: string; description: string }[] = [
  {
    value: 'newsletter',
    label: 'Monthly newsletter',
    description: 'Our monthly note: what we published, what we learned, and one thing we got wrong.',
  },
  {
    value: 'events',
    label: 'Event invitations',
    description: 'Invitations to webinars, workshops, and public events.',
  },
  {
    value: 'insights',
    label: 'Insights & publications',
    description: 'New policy briefs, practice notes, data products, and podcast episodes.',
  },
  {
    value: 'careers',
    label: 'Careers & opportunities',
    description: 'Open roles, expert network registration, and internship announcements.',
  },
];

export interface MarketingConsent {
  email: string;
  lists: MarketingList[];
  consentedAt: string;
  source: string; // 'footer' | 'contact' | 'join' | 'checkout' | 'dashboard'
  ipAddress?: string;
  userAgent?: string;
}

export interface UnsubscribeRequest {
  email: string;
  token: string; // HMAC of email + list + secret
  lists?: MarketingList[]; // if undefined, unsubscribe from all
}

export function generateUnsubscribeToken(email: string, list: MarketingList | 'all', secret: string): string {
  // In production, use proper HMAC with crypto.subtle or Node crypto
  const msg = `${email}:${list}:${secret}`;
  // Simple hash for demo - replace with HMAC-SHA256 in production
  let hash = 0;
  for (let i = 0; i < msg.length; i++) {
    hash = ((hash << 5) - hash) + msg.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function verifyUnsubscribeToken(email: string, list: MarketingList, token: string, secret: string): boolean {
  return generateUnsubscribeToken(email, list, secret) === token;
}

export function buildUnsubscribeUrl(baseUrl: string, email: string, list: MarketingList, secret: string): string {
  const token = generateUnsubscribeToken(email, list, secret);
  return `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}&list=${list}&token=${token}`;
}

export function buildUnsubscribeAllUrl(baseUrl: string, email: string, secret: string): string {
  // Token for "all lists" - use a special marker
  const token = generateUnsubscribeToken(email, 'all', secret);
  return `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}&list=all&token=${token}`;
}