// routes/public.js — Public API endpoints

const {
  getLeaderboardRows,
  getUserFullById,
  getUserByIdWithTotal,
  getTotalByUserId,
  createUserWithUid,
  getUserByUID
} = require("../db");

// GET /api/leaderboard
function getLeaderboard(req, res) {
  const rows = getLeaderboardRows();
  res.json({ rows });
}

// GET /api/user/:id
function getUserProfile(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  const user = getUserFullById(id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const t = getTotalByUserId(id);
  const total = t ? t.total : 0;
  const label =
    (user.nickname && user.nickname.trim()) || user.name || `Player ${id}`;

  res.json({
    id: user.id,
    name: user.name,
    nickname: user.nickname,
    profession: user.profession,
    uid: user.uid,
    label,
    total
  });
}

// GET /api/register/check?uid=...
function checkRegister(req, res) {
  const uid = (req.query.uid || "").toString().toUpperCase();
  const exists = uid ? getUserByUID(uid) : null;
  const msg = exists
    ? "Энэ NFC аль хэдийн нэг хэрэглэгчтэй холбогдсон байна."
    : uid
    ? "Энэ NFC-г өөртэйгөө холбож бүртгүүлэх боломжтой. Бүртгэл хийсний дараа writer-аар дахин уншуул."
    : "NFC UID параметрээр ирвэл автоматаар бөглөгдөнө.";

  res.json({
    uid: uid || null,
    exists: !!exists,
    message: msg
  });
}

// POST /api/register
function postRegister(req, res) {
  const uid = (req.body.uid || "").toString().trim();
  const fullName = (req.body.fullName || "").toString().trim();
  const nickname = (req.body.nickname || "").toString().trim();
  const profession = (req.body.profession || "").toString().trim();
  const phone = (req.body.phone || "").toString().trim();
  const gmail = (req.body.gmail || "").toString().trim();
  const bio = (req.body.bio || "").toString().trim();
  const avatarUrl = (req.body.avatarUrl || "").toString().trim();
  const socials = req.body.socials || {};

  if (!fullName) {
    return res.status(400).json({ error: "Бүтэн нэр шаардлагатай." });
  }

  if (!gmail) {
    return res.status(400).json({ error: "Имэйл шаардлагатай." });
  }

  const socialsJson = Object.keys(socials).length > 0 ? JSON.stringify(socials) : null;

  const result = createUserWithUid({
    name: fullName,
    nickname: nickname || null,
    profession: profession || null,
    phone: phone || null,
    gmail: gmail || null,
    bio: bio || null,
    avatarUrl: avatarUrl || null,
    socials: socialsJson,
    uid: uid || null
  });

  res.json({
    success: true,
    userId: result.id,
    uid: result.uid,
    message: "Бүртгэл амжилттай"
  });
}

// GET /api/resolve/:uid — NFC direct resolve
function getResolveUID(req, res) {
  const raw = (req.params.uid || "").toString().trim().toUpperCase();
  if (!raw) {
    return res.status(400).json({ error: "UID required" });
  }
  const user = getUserByUID(raw);
  if (user) {
    return res.json({ exists: true, userId: user.id, redirect: `/u/${user.id}` });
  }
  return res.json({ exists: false, redirect: `/register?uid=${encodeURIComponent(raw)}` });
}

// GET /api/users/:id
function getUserById(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id) {
    return res.status(400).json({ ok: false, error: { message: "Invalid user ID" } });
  }

  const user = getUserByIdWithTotal(id);
  if (!user) {
    return res.status(404).json({ ok: false, error: { message: "User not found" } });
  }

  res.json({ ok: true, data: user });
}

module.exports = {
  getLeaderboard,
  getUserProfile,
  getUserById,
  checkRegister,
  postRegister,
  getResolveUID
};

