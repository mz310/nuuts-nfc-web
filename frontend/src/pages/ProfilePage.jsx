import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";

function ProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.getUserProfile(id);
        if (mounted) setUser(data);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="hero">
        <div className="hero-title">Уншиж байна...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="hero">
        <div className="hero-title">Алдаа</div>
        <div className="hero-sub">{error || "Хэрэглэгч олдсонгүй"}</div>
        <p className="mt-6">
          <Link to="/" className="btn btn-outline">
            ← Leaderboard руу буцах
          </Link>
        </p>
      </div>
    );
  }

  const label = user.label || `Player ${user.id}`;
  // Format created_ts to 'Mon YYYY' (e.g., Nov 2025)
  function formatJoinDate(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    if (isNaN(d)) return ts;
    return d.toLocaleString("en-US", { month: "short", year: "numeric" });
  }

  const joined = formatJoinDate(user.created_ts);

  return (
    <div className="min-h-[60vh] bg-white py-8 px-4">
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-amber-50 to-amber-200 rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left column: avatar and basic */}
          <div className="lg:col-span-3 flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-amber-400 flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="text-lg font-semibold text-gray-800">
              {user.name}
            </div>
            <div className="text-sm text-gray-500">
              @{user.nickname || label}
            </div>
            {user.profession && (
              <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm mt-2">
                {user.profession}
              </div>
            )}
            <Link
              to="/"
              className="mt-4 inline-block w-full text-center bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg text-sm"
            >
              Edit Profile
            </Link>
          </div>

          {/* Right column: profile info */}
          <div className="lg:col-span-9 bg-white/40 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Profile Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm sm:text-base">
              <div>
                <div className="text-xs text-gray-500">Full Name</div>
                <div className="font-medium text-gray-800">{user.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Nickname</div>
                <div className="font-medium text-gray-800">
                  {user.nickname || "-"}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">UID</div>
                <div className="mt-1">
                  <input
                    type="text"
                    readOnly
                    value={user.uid || ""}
                    className="w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Phone</div>
                <div className="font-medium text-gray-800">
                  {user.phone || "-"}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Gender</div>
                <div className="font-medium text-gray-800">
                  {user.gender || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Joined</div>
                <div className="font-medium text-gray-800">{joined || "-"}</div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                About
              </h4>
              <div className="bg-white rounded-lg border border-gray-100 p-4 text-sm text-gray-700">
                {user.bio || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
