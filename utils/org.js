// utils/org.js — organizasyon (kiracı) kimliği yardımcıları.
// SaaS çok-kiracılı modelin temeli: her kullanıcı/şirket bir "org"dur.
// Kişisel hesap = tek üyeli org ("personal:<uid>"), şirket = "org:<id>".
// Böylece kişisel ve şirket akışı TEK kod yolunu paylaşır.

export const PERSONAL_PREFIX = "personal:";
export const ORG_PREFIX = "org:";

// Bir kullanıcının kişisel org kimliği
export function personalOrgId(uid) {
  return uid ? `${PERSONAL_PREFIX}${uid}` : null;
}

export function isPersonalOrg(orgId) {
  return typeof orgId === "string" && orgId.startsWith(PERSONAL_PREFIX);
}

export function isCompanyOrg(orgId) {
  return typeof orgId === "string" && orgId.startsWith(ORG_PREFIX);
}

// "personal:<uid>" → "<uid>"
export function uidFromPersonalOrg(orgId) {
  return isPersonalOrg(orgId) ? orgId.slice(PERSONAL_PREFIX.length) : null;
}
