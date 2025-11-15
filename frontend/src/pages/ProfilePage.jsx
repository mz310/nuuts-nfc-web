import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import { getIndustryImage } from "../utils/industryImages";

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
        if (mounted) {
          setUser(data);
        }
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

  const getGenderText = (gender) => {
    if (gender === "male") return "Эрэгтэй";
    if (gender === "female") return "Эмэгтэй";
    return "Бусад";
  };

  return (
    <div className="w-full relative min-h-screen py-8 px-4 overflow-hidden">
      {/* Background accent circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-amber-200/30 dark:bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-pink-200/20 dark:bg-pink-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* LEFT SIDE */}
            <div className="flex flex-col items-center md:items-start gap-4 flex-shrink-0 md:w-80">
              {/* Profile Image */}
              <div className="w-32 h-32 rounded-full overflow-hidden bg-amber-400 dark:bg-amber-600 border-4 border-amber-500/30 dark:border-amber-400/30 shadow-lg">
                {user.industry && getIndustryImage(user.industry) ? (
                  <img
                    src={getIndustryImage(user.industry)}
                    alt={`${user.name} avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 flex items-center justify-center text-white text-4xl font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {user.name}
                </h1>
              </div>

              {/* Nickname */}
              <div className="text-center md:text-left">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  @{user.nickname || label}
                </p>
              </div>

              {/* Profession */}
              {user.profession && (
                <div className="text-center md:text-left">
                  <span className="inline-block px-4 py-2 bg-amber-500/20 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium border border-amber-500/30 dark:border-amber-400/30">
                    {user.profession}
                  </span>
                </div>
              )}

              {/* Gender */}
              <div className="text-center md:text-left">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {getGenderText(user.gender || "other")}
                </p>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Divider */}
              <div className="border-t border-slate-200 dark:border-slate-700"></div>

              {/* Phone Section */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
                  ХОЛБОГДОХ
                </h2>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-purple-500 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="text-slate-900 dark:text-slate-100">
                    {user.phone || "—"}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200 dark:border-slate-700"></div>

              {/* About Section */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
                  ABOUT
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {user.bio || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;