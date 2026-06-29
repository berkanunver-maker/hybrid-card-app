// services/contactsService.js — kartı telefon rehberine kaydet
import * as Contacts from "expo-contacts";
import { cleanUrl } from "../utils/format";

export async function saveContactToPhone(fields) {
  const f = fields || {};
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      return { success: false, error: "permission" };
    }

    const fullName = (f.name || "").trim();
    const parts = fullName.split(/\s+/).filter(Boolean);
    const firstName = parts.length ? parts[0] : "İsimsiz";
    const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";

    const phoneNumbers = [];
    if (f.mobile) phoneNumbers.push({ label: "mobile", number: String(f.mobile) });
    if (f.phone) phoneNumbers.push({ label: "work", number: String(f.phone) });

    const emails = [];
    if (f.email) emails.push({ label: "work", email: String(f.email) });

    const urls = [];
    const web = f.website ? cleanUrl(f.website) : "";
    if (web) urls.push({ label: "work", url: web });

    const contact = {
      [Contacts.Fields.FirstName]: firstName,
      [Contacts.Fields.LastName]: lastName,
      ...(f.company ? { [Contacts.Fields.Company]: f.company } : {}),
      ...(f.title ? { [Contacts.Fields.JobTitle]: f.title } : {}),
      ...(phoneNumbers.length ? { [Contacts.Fields.PhoneNumbers]: phoneNumbers } : {}),
      ...(emails.length ? { [Contacts.Fields.Emails]: emails } : {}),
      ...(urls.length ? { [Contacts.Fields.UrlAddresses]: urls } : {}),
    };

    await Contacts.addContactAsync(contact);
    return { success: true };
  } catch (e) {
    return { success: false, error: e?.message || "unknown" };
  }
}
