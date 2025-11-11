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
      <div className="bg-gradient-to-br from-amber-50 to-amber-200 min-h-[calc(100vh-120px)] py-8 sm:py-12 px-3 sm:px-4">
        <div className="bg-gradient-to-br from-amber-50 to-amber-200 rounded-xl sm:rounded-2xl shadow-lg w-full max-w-2xl mx-auto p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-2 sm:mb-3">
            ✓ Бүртгэл амжилттай
          </h2>
          <p className="text-gray-600 text-center mb-3 sm:mb-4 text-xs sm:text-sm">
            Таны хэрэглэгч үүсгэлээ.
          </p>
          <p className="text-gray-500 text-center mb-4 sm:mb-6 text-xs">
            NFC writer-аар UID уншуулбал профайл линк бичигдэнэ.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <a
              href={`/u/${userId}`}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-lg transition-all text-center text-xs sm:text-sm"
            >
              Миний профайлыг харах
            </a>
            <a
              href="/"
              className="flex-1 border-2 border-amber-500 text-amber-600 hover:bg-amber-50 font-semibold py-2 rounded-lg transition-all text-center text-xs sm:text-sm"
            >
              Leaderboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-200 min-h-[calc(100vh-120px)] py-8 sm:py-12 px-3 sm:px-4">
      <div className="bg-gradient-to-br from-amber-50 to-amber-200 rounded-xl sm:rounded-2xl shadow-lg w-full max-w-3xl mx-auto p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-1 sm:mb-2">
          User Registration
        </h1>
        <p className="text-gray-500 text-center mb-4 sm:mb-6 text-xs sm:text-sm">
          Please fill in your details below
        </p>

        {/* UID Status Message */}
        {uid && (
          <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs sm:text-sm">
            <p className="text-gray-700">
              <strong>NFC UID:</strong>{" "}
              <span className="text-amber-600 font-mono text-xs">
                {formData.uid || "(waiting)"}
              </span>
            </p>
            {isCheckingUID && (
              <p className="text-xs text-amber-500 mt-1">Checking UID...</p>
            )}
            {checkData?.message && (
              <p className="text-xs text-gray-600 mt-1">{checkData.message}</p>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Form Container with Padding and Margin */}
        <div className="bg-white rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4"
          >
            {/* UID */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                UID
              </label>
              <input
                type="text"
                name="uid"
                value={formData.uid}
                onChange={handleChange}
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all text-xs sm:text-sm"
                placeholder="1DA7862A0D1080"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all text-xs sm:text-sm"
                placeholder="Sergelen"
              />
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nickname
              </label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all text-xs sm:text-sm"
                placeholder="Serge"
              />
            </div>

            {/* Profession */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Profession
              </label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all text-xs sm:text-sm"
                placeholder="Guard"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all text-xs sm:text-sm"
                placeholder="+97699112233"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all text-xs sm:text-sm bg-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Bio - Full Width */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Short Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={2}
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all resize-none text-xs sm:text-sm"
                placeholder="Volunteer guardian"
              />
            </div>

            {/* Submit Button - Full Width */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-all text-xs sm:text-sm"
              >
                {loading ? "Бүртгэж байна..." : "Register"}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-gray-500 text-xs mt-3 sm:mt-4">
          Бүртгэлийн дараа NFC writer-аар UID-гаа дахин уншуулж profile линк
          бичүүлнэ.
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
