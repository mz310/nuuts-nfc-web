import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";

function RegisterPage() {
  const [searchParams] = useSearchParams();
  const uid = (searchParams.get("uid") || "").toUpperCase();

  const [formData, setFormData] = useState({
    uid: uid,
    name: "",
    nickname: "",
    profession: "",
    phone: "",
    bio: "",
    gender: "other",
  });
  const [checkData, setCheckData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (uid) {
      checkUID();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  async function checkUID() {
    try {
      const data = await api.checkRegister(uid);
      setCheckData(data);
      setFormData((prev) => ({ ...prev, uid: uid }));
      setError(null);
    } catch (error) {
      console.error("Failed to check UID:", error);
      setError(
        error.message || "UID шалгахад алдаа гарлаа. Дахин оролдоно уу."
      );
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.postRegister({
        ...formData,
        uid: formData.uid || uid,
        // ensure gender is one of allowed values
        gender: (formData.gender || "other").toString().toLowerCase(),
      });
      setSuccess(true);
      setUserId(data.userId);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  const isCheckingUID = uid && !checkData && !error;

  if (success && userId) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8 sm:p-12">
          <div className="text-center mb-8">
            <div className="text-3xl mb-4">✓</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Бүртгэл амжилттай
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-2">
              Таны хэрэглэгч үүсгэлээ.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
              NFC writer-аар UID уншуулбал профайл линк бичигдэнэ.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`/u/${userId}`}
              className="flex-1 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-250 text-center text-sm shadow-md hover:shadow-lg"
            >
              Миний профайлыг харах
            </a>
            <a
              href="/"
              className="flex-1 border-2 border-amber-500 dark:border-amber-400 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-semibold py-3 px-6 rounded-lg transition-all duration-250 text-center text-sm"
            >
              Leaderboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 sm:p-8 lg:p-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Create your profile
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Please fill in your details below
          </p>
        </div>

        {/* UID Status Message */}
        {uid && (
          <div className="mb-6 p-4 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong className="font-semibold">NFC UID:</strong>{" "}
              <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">
                {formData.uid || "(waiting)"}
              </span>
            </p>
            {isCheckingUID && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Checking UID...</p>
            )}
            {checkData?.message && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{checkData.message}</p>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* UID (read-only; detected from NFC) */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                UID
              </label>
              <div
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 font-mono"
                aria-live="polite"
                aria-atomic="true"
              >
                {formData.uid || "(waiting for NFC)"}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none transition-all text-sm"
                placeholder="Sergelen"
              />
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nickname
              </label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none transition-all text-sm"
                placeholder="Serge"
              />
            </div>

            {/* Profession */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Profession
              </label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none transition-all text-sm"
                placeholder="Guard"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none transition-all text-sm"
                placeholder="+97699112233"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none transition-all text-sm"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Bio - Full Width */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Short Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none transition-all resize-none text-sm"
                placeholder="Volunteer guardian"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-250 text-sm shadow-md hover:shadow-lg"
            >
              {loading ? "Бүртгэж байна..." : "Register"}
            </button>
          </div>
        </form>

        <p className="text-center text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-6">
          Бүртгэлийн дараа NFC writer-аар UID-гаа дахин уншуулж profile линк
          бичүүлнэ.
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
