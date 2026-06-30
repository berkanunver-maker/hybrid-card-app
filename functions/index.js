// functions/index.js
// Faz 2 — Çok-kiracılı SaaS sunucu mantığı (Cloud Functions v2).
// TÜM güven sınırı burada: davet kabulü, koltuk muhasebesi, aktivite yazımı ve
// push gönderimi yalnızca burada (Admin SDK) yapılır — istemci bunları yazamaz.
// NOT: Deploy için Firebase Blaze planı gerekir (Faz 0 önkoşulu).

const crypto = require("crypto");
const { setGlobalOptions } = require("firebase-functions/v2");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { Expo } = require("expo-server-sdk");

initializeApp();
setGlobalOptions({ region: "us-central1", maxInstances: 10 });

const db = getFirestore();
const expo = new Expo();

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün

// ── Yardımcılar ──────────────────────────────────────────────────────────────
const orgRef = (orgId) => db.collection("organizations").doc(orgId);
const membershipId = (orgId, uid) => `${orgId}_${uid}`;
const membershipRef = (orgId, uid) =>
  db.collection("memberships").doc(membershipId(orgId, uid));

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

// Mevcut custom claim'leri koruyarak org/rol ekle (setCustomUserClaims hepsini ezer)
async function mergeClaims(uid, extra) {
  const user = await getAuth().getUser(uid);
  await getAuth().setCustomUserClaims(uid, { ...(user.customClaims || {}), ...extra });
}

async function requireAdmin(orgId, uid) {
  const m = await membershipRef(orgId, uid).get();
  const d = m.exists ? m.data() : null;
  if (!d || d.status !== "active" || !["owner", "admin"].includes(d.role)) {
    throw new HttpsError("permission-denied", "Bu işlem için yöneticilik gerekir.");
  }
  return d;
}

// ── createOrganization: kullanıcı bir şirket org'u oluşturur ve sahibi olur ───
exports.createOrganization = onCall(async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Giriş gerekli.");
  const name = (req.data?.name || "").toString().trim();
  if (name.length < 1 || name.length > 100) {
    throw new HttpsError("invalid-argument", "Geçersiz şirket adı.");
  }
  const seats = Math.max(1, Math.min(parseInt(req.data?.seats, 10) || 1, 1000));

  const newId = db.collection("organizations").doc().id;
  const orgId = `org:${newId}`;
  const ref = orgRef(orgId);

  await db.runTransaction(async (tx) => {
    tx.set(ref, {
      name,
      ownerUid: uid,
      plan: "company",
      seatsPurchased: seats,
      seatsUsed: 1,
      status: "active",
      provider: null,
      createdAt: FieldValue.serverTimestamp(),
    });
    tx.set(membershipRef(orgId, uid), {
      orgId,
      uid,
      role: "owner",
      status: "active",
      email: req.auth.token.email || null,
      displayName: req.auth.token.name || null,
      joinedAt: FieldValue.serverTimestamp(),
    });
  });

  await mergeClaims(uid, { orgId, role: "owner" });
  return { orgId };
});

// ── createInvite: admin/owner bir e-posta için davet üretir (token döner) ─────
exports.createInvite = onCall(async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Giriş gerekli.");
  const orgId = (req.data?.orgId || "").toString();
  const email = (req.data?.email || "").toString().toLowerCase().trim();
  const role = (req.data?.role || "member").toString();
  if (!orgId.startsWith("org:")) throw new HttpsError("invalid-argument", "Geçersiz org.");
  if (!email.includes("@")) throw new HttpsError("invalid-argument", "Geçersiz e-posta.");
  if (!["member", "admin"].includes(role)) throw new HttpsError("invalid-argument", "Geçersiz rol.");

  await requireAdmin(orgId, uid);

  // Koltuk dolu mu? (bilgi amaçlı; kesin kontrol kabulde yapılır)
  const org = await orgRef(orgId).get();
  const o = org.data() || {};
  if ((o.seatsUsed || 0) >= (o.seatsPurchased || 0)) {
    throw new HttpsError("resource-exhausted", "Boş koltuk yok. Önce koltuk ekleyin.");
  }

  const token = crypto.randomBytes(24).toString("hex");
  const inviteRef = db.collection("invites").doc();
  await inviteRef.set({
    orgId,
    email,
    role,
    tokenHash: sha256(token),
    status: "pending",
    invitedBy: uid,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: Timestamp.fromMillis(Date.now() + INVITE_TTL_MS),
  });

  // token yalnızca burada döner → davet linki/e-postasında kullanılır (DB'de hash tutulur)
  return { inviteId: inviteRef.id, token };
});

// ── acceptInvite: davetli daveti kabul eder (ATOMİK koltuk + üyelik) ──────────
exports.acceptInvite = onCall(async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Giriş gerekli.");
  // E-posta doğrulaması zorunlu (yoksa saldırgan kurbanın koltuğunu çalabilir)
  if (!req.auth.token.email_verified) {
    throw new HttpsError("failed-precondition", "Önce e-postanı doğrula.");
  }
  const inviteId = (req.data?.inviteId || "").toString();
  const token = (req.data?.token || "").toString();
  const callerEmail = (req.auth.token.email || "").toLowerCase();

  const inviteRef = db.collection("invites").doc(inviteId);

  const result = await db.runTransaction(async (tx) => {
    const inv = await tx.get(inviteRef);
    if (!inv.exists) throw new HttpsError("not-found", "Davet bulunamadı.");
    const d = inv.data();
    if (d.status !== "pending") throw new HttpsError("failed-precondition", "Davet zaten kullanılmış.");
    if (!d.expiresAt || d.expiresAt.toMillis() < Date.now()) {
      throw new HttpsError("failed-precondition", "Davetin süresi dolmuş.");
    }
    if (sha256(token) !== d.tokenHash) throw new HttpsError("permission-denied", "Geçersiz davet.");
    if (callerEmail !== d.email) throw new HttpsError("permission-denied", "Bu davet senin e-postana ait değil.");

    const oRef = orgRef(d.orgId);
    const org = await tx.get(oRef);
    if (!org.exists) throw new HttpsError("not-found", "Organizasyon bulunamadı.");
    const o = org.data();
    if (o.status !== "active") throw new HttpsError("failed-precondition", "Organizasyon aktif değil.");
    if ((o.seatsUsed || 0) >= (o.seatsPurchased || 0)) {
      throw new HttpsError("resource-exhausted", "Koltuk dolu.");
    }

    tx.set(membershipRef(d.orgId, uid), {
      orgId: d.orgId,
      uid,
      role: d.role,
      status: "active",
      email: req.auth.token.email || null,
      displayName: req.auth.token.name || null,
      invitedBy: d.invitedBy,
      joinedAt: FieldValue.serverTimestamp(),
    });
    tx.update(oRef, { seatsUsed: FieldValue.increment(1) });
    tx.update(inviteRef, {
      status: "accepted",
      acceptedBy: uid,
      acceptedAt: FieldValue.serverTimestamp(),
    });
    return { orgId: d.orgId, role: d.role };
  });

  await mergeClaims(uid, { orgId: result.orgId, role: result.role });
  return result;
});

// ── onCardCreated: çalışan kart eklediğinde aktivite yaz + yöneticilere push ──
exports.onCardCreated = onDocumentCreated("cards/{cardId}", async (event) => {
  const card = event.data?.data();
  if (!card) return;

  const orgId = card.orgId;
  // Yalnızca ŞİRKET org'ları; kişisel hesaplarda (personal:*) takip yok
  if (!orgId || !String(orgId).startsWith("org:")) return;

  const actorUid = card.ownerId || card.userId || null;
  const fields = card.fields || card;
  const name = fields.name || "İsimsiz";
  const company = fields.company || "";
  const noteText = card.note || card.voice_note?.text || "";

  // Aktör adı (üyelikten) — denormalize
  let actorName = "";
  if (actorUid) {
    const am = await membershipRef(orgId, actorUid).get();
    actorName = (am.exists && am.data().displayName) || "";
  }

  // 1) Aktivite dokümanı (DETAY burada — kural korumalı uygulama-içi akış)
  await orgRef(orgId)
    .collection("activity")
    .add({
      type: "card.created",
      orgId,
      actorUid,
      actorName,
      cardId: event.params.cardId,
      title: `${actorName || "Bir çalışan"} yeni müşteri ekledi`,
      preview: `${name}${company ? " · " + company : ""}${noteText ? " — " + noteText : ""}`,
      voice: card.voice_note
        ? { transcript: card.voice_note.text || "", audioUrl: card.voice_note.audioUrl || null }
        : null,
      createdAt: FieldValue.serverTimestamp(),
      deliveredPush: false,
    });

  // 2) Push — owner/admin'lere. Rol ÜYELİKTEN okunur (cihaz dokümanından DEĞİL).
  const mSnap = await db
    .collection("memberships")
    .where("orgId", "==", orgId)
    .where("status", "==", "active")
    .get();
  const recipientUids = mSnap.docs
    .map((d) => d.data())
    .filter((m) => ["owner", "admin"].includes(m.role) && m.uid !== actorUid)
    .map((m) => m.uid);
  if (recipientUids.length === 0) return;

  const tokens = [];
  for (const ruid of recipientUids) {
    const dSnap = await orgRef(orgId)
      .collection("devices")
      .where("uid", "==", ruid)
      .where("enabled", "==", true)
      .get();
    dSnap.forEach((doc) => {
      const tk = doc.data().expoPushToken;
      if (Expo.isExpoPushToken(tk)) tokens.push(tk);
    });
  }
  if (tokens.length === 0) return;

  // Push GÖVDESİ GENEL — müşteri verisi/transkript payload'a KONMAZ (kilit ekranı + KVKK).
  const messages = tokens.map((to) => ({
    to,
    sound: "default",
    title: "Yeni hareket",
    body: `${actorName || "Bir çalışan"} yeni bir müşteri ekledi`,
    data: { type: "card.created", orgId, cardId: event.params.cardId },
  }));

  for (const chunk of expo.chunkPushNotifications(messages)) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (e) {
      console.error("push gönderim hatası:", e);
    }
  }
});
