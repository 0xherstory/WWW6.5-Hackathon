const CONTACTS_KEY = "herguard_emergency_contacts";

export interface EmergencyContact {
  name: string;
  email: string;
}

export function loadContacts(): EmergencyContact[] {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveContacts(contacts: EmergencyContact[]) {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}
