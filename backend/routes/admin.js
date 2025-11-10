// routes/admin.js — Admin API endpoints

const {
  searchUsers,
  listUsers,
  getUserByUID,
  getTotalByUserId,
  insertTransactionAndUpdateTotal,
  quickRegisterLink,
  deleteUserCascade
} = require("../db");
const { ADMIN_USER, ADMIN_PASS } = require("../config");

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

// POST /api/admin/login
function postLogin(req, res) {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.isAdmin = true;
    return res.json({ success: true });
  }
  return res.status(401).json({ error: "Нэвтрэх нэр эсвэл нууц үг буруу." });
}

// POST /api/admin/logout
function postLogout(req, res) {
  req.session.destroy(() => {
    res.json({ success: true });
  });
}

// GET /api/admin/dashboard
function getAdmin(req, res) {
  const q = (req.query.q || "").trim();
  const users = q ? searchUsers(q, 100) : listUsers(50);

  const usersWithTotals = users.map((u) => {
    const t = getTotalByUserId(u.id);
    return {
      ...u,
      total: t ? t.total : 0
    };
  });

  res.json({
    users: usersWithTotals,
    query: q
  });
}

// POST /api/admin/quick-add-tx
function postQuickAddTx(req, res) {
  const uid = (req.body.uid || "").toString().trim().toUpperCase();
  const amount = parseFloat(req.body.amount || "0");
  const user = getUserByUID(uid);

  if (!uid || !user || !(amount > 0)) {
    return res.status(400).json({
      error: "Алдаа: UID/хэрэглэгч/дүн буруу."
    });
  }

  insertTransactionAndUpdateTotal(user.id, amount);

  return res.json({
    success: true,
    message: `ID ${user.id} · ${user.name} +${amount.toFixed(0)}₮ нэмлээ`
  });
}

// POST /api/admin/quick-register-link
function postQuickRegisterLink(req, res) {
  // Convert empty UID string to null so quickRegisterLink can generate random UID
  const uidRaw = (req.body.uid || "").toString().trim();
  const uid = uidRaw === "" ? null : uidRaw;
  const name = (req.body.name || "").toString().trim();
  const nickname = (req.body.nickname || "").toString().trim();
  const profession = (req.body.profession || "").toString().trim();

  if (!name) {
    return res.status(400).json({
      error: "Нэр хоосон."
    });
  }

  try {
    const finalUID = quickRegisterLink({ uid, name, nickname, profession });
    return res.json({
      success: true,
      message: `'${name}' бүртгэж UID ${finalUID} холбосон.`
    });
  } catch (e) {
    return res.status(500).json({
      error: "Алдаа: " + e.message
    });
  }
}

// POST /api/admin/delete-user
function postDeleteUser(req, res) {
  const id = parseInt(req.body.user_id || "0", 10);
  if (!id) {
    return res.status(400).json({
      error: "ID буруу."
    });
  }
  try {
    deleteUserCascade(id);
    return res.json({
      success: true,
      message: `Хэрэглэгч ID ${id} устгалаа.`
    });
  } catch (e) {
    return res.status(500).json({
      error: "Устгах үед алдаа: " + e.message
    });
  }
}

module.exports = {
  requireAdmin,
  postLogin,
  postLogout,
  getAdmin,
  postQuickAddTx,
  postQuickRegisterLink,
  postDeleteUser
};

