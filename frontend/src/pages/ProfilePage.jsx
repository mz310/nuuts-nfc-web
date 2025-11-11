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
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8 sm:p-12 text-center">
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Уншиж байна...</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8 sm:p-12 text-center">
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Алдаа</div>
          <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6">{error || 'Хэрэглэгч олдсонгүй'}</div>
          <Link 
            to="/" 
            className="inline-block px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all duration-250 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-amber-500 dark:hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400"
          >
            ← Leaderboard руу буцах
          </Link>
        </div>
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
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8 sm:p-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">{label}</h1>
          <div className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-2">
            Нийт хөнгөлөлт: <strong className="text-amber-600 dark:text-amber-400 font-bold">{total} ₮</strong>
          </div>
          <div className="text-sm sm:text-base text-slate-500 dark:text-slate-500">
            ID: {user.id}{user.profession ? " · " + user.profession : ""}
          </div>
        </div>
        <div className="text-center mt-8">
          <Link 
            to="/" 
            className="inline-block px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all duration-250 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-amber-500 dark:hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400"
          >
            ← Leaderboard руу буцах
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
