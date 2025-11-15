const {
  getLeaderboardRows,
  getUserFullById,
  getTotalByUserId,
  createUserWithUid,
  getUserByUID,
  updateUser,
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
    industry: user.industry || null,
    uid: user.uid,
    phone: user.phone || null,
    bio: user.bio || null,
    gender: user.gender || "other",
    created_ts: user.created_ts || null,
    label,
    total,
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
    message: msg,
  });
}

// POST /api/register
function postRegister(req, res) {
  const uid = (req.body.uid || "").toString().trim();
  const name = (req.body.name || "").toString().trim();
  const nickname = (req.body.nickname || "").toString().trim();
  const profession = (req.body.profession || "").toString().trim();
  const industry = (req.body.industry || "").toString().trim();
  const phone = (req.body.phone || "").toString().trim();
  const bio = (req.body.bio || "").toString().trim();
  const gender = (req.body.gender || "other").toString().trim().toLowerCase();

  if (!name) {
    return res.status(400).json({ error: "Нэр шаардлагатай." });
  }

  if (!uid) {
    return res.status(400).json({ error: "UID шаардлагатай. NFC reader-ээс UID авах шаардлагатай." });
  }

  const allowed = ["male", "female", "other"];
  const chosenGender = allowed.includes(gender) ? gender : "other";

  try {
    const result = createUserWithUid({
      name,
      nickname,
      profession,
      industry: industry || null,
      uid: uid,
      phone: phone || null,
      bio: bio || null,
      gender: chosenGender,
    });

    res.json({
      success: true,
      userId: result.id,
      uid: result.uid,
      message: "Бүртгэл амжилттай",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

function getResolveUID(req, res) {
  const raw = (req.params.uid || "").toString().trim().toUpperCase();
  if (!raw) {
    return res.status(400).json({ error: "UID required" });
  }
  const user = getUserByUID(raw);
  if (user) {
    return res.json({
      exists: true,
      userId: user.id,
      redirect: `/u/${user.id}`,
    });
  }
  return res.json({
    exists: false,
    redirect: `/register?uid=${encodeURIComponent(raw)}`,
  });
}

function putUserProfile(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id) {
    return res.status(400).json({ ok: false, error: { message: "Invalid user ID" } });
  }

  const {
    name,
    nickname,
    profession,
    industry,
    phone,
    bio,
    gender,
  } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ ok: false, error: { message: "Name is required" } });
  }

  try {
    const updatedUser = updateUser(id, {
      name,
      nickname,
      profession,
      industry,
      phone,
      bio,
      gender,
    });

    if (!updatedUser) {
      return res.status(404).json({ ok: false, error: { message: "User not found" } });
    }

    const t = getTotalByUserId(id);
    const total = t ? t.total : 0;
    const label =
      (updatedUser.nickname && updatedUser.nickname.trim()) || updatedUser.name || `Player ${id}`;

    res.json({
      ok: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        nickname: updatedUser.nickname,
        profession: updatedUser.profession,
        industry: updatedUser.industry || null,
        uid: updatedUser.uid,
        phone: updatedUser.phone || null,
        bio: updatedUser.bio || null,
        gender: updatedUser.gender || "other",
        created_ts: updatedUser.created_ts || null,
        label,
        total,
      },
    });
  } catch (error) {
    return res.status(400).json({ ok: false, error: { message: error.message } });
  }
}

module.exports = {
  getLeaderboard,
  getUserProfile,
  checkRegister,
  postRegister,
  getResolveUID,
  putUserProfile,
};
