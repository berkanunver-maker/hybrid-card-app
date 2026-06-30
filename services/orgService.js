// services/orgService.js
// İstemci tarafı org/üyelik yardımcıları (Faz 2).
// Yazma işlemleri (org/üyelik/davet/koltuk) Cloud Functions üzerinden yapılır
// (güvenlik gereği istemci doğrudan yazamaz). Okumalar kural-korumalı.
// NOT: callable'lar Cloud Functions deploy edilince (Blaze) çalışır.
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { app, db } from "./firestoreService";
import { isCompanyOrg } from "../utils/org";

// Functions bölgesi, index.js'teki setGlobalOptions ile aynı olmalı
const functions = getFunctions(app, "us-central1");

// ── Callable sarmalayıcılar (CF deploy gerektirir) ──────────────────────────
export async function createOrganization(name, seats = 1) {
  const fn = httpsCallable(functions, "createOrganization");
  const res = await fn({ name, seats });
  return res.data; // { orgId }
}

export async function createInvite(orgId, email, role = "member") {
  const fn = httpsCallable(functions, "createInvite");
  const res = await fn({ orgId, email, role });
  return res.data; // { inviteId, token }
}

export async function acceptInvite(inviteId, token) {
  const fn = httpsCallable(functions, "acceptInvite");
  const res = await fn({ inviteId, token });
  return res.data; // { orgId, role }
}

// ── Okuma yardımcıları ───────────────────────────────────────────────────────
// Kullanıcının üyelikleri (kişisel hesapta boş döner — personal org'larda üyelik dokümanı yok)
export async function getMyMemberships(uid) {
  if (!uid) return [];
  const q = query(collection(db, "memberships"), where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Kullanıcının aktif ŞİRKET org'u (varsa) + org dokümanı + rolü
export async function getActiveCompanyOrg(uid) {
  const ms = await getMyMemberships(uid);
  const company = ms.find((m) => m.status === "active" && isCompanyOrg(m.orgId));
  if (!company) return null;
  let org = null;
  try {
    const orgSnap = await getDoc(doc(db, "organizations", company.orgId));
    org = orgSnap.exists() ? orgSnap.data() : null;
  } catch (e) {
    // org okunamadıysa null geç
  }
  return { orgId: company.orgId, role: company.role, org };
}

// Canlı aktivite akışı aboneliği (onSnapshot). unsubscribe fonksiyonu döner.
export function subscribeToActivity(orgId, onChange, onError) {
  const q = query(
    collection(db, "organizations", orgId, "activity"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => onError && onError(err)
  );
}
