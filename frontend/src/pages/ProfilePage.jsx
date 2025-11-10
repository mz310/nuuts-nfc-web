import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';

function ProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [id]);

  async function loadProfile() {
    try {
      setLoading(true);
      const response = await api.getUserById(id);
      if (response.ok && response.data) {
        setUser(response.data);
      } else {
        setError(response.error?.message || 'Хэрэглэгч олдсонгүй');
      }
      setLoading(false);
    } catch (error) {
      setError(error.message || 'Хэрэглэгч олдсонгүй');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="text-center text-lg font-bold text-slate-900 dark:text-slate-100">Уншиж байна...</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="text-center text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Алдаа</div>
          <div className="text-center text-sm text-slate-600 dark:text-slate-400 mb-6">{error || 'Хэрэглэгч олдсонгүй'}</div>
          <div className="text-center">
            <Link to="/" className="inline-block px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-[250ms] no-underline">← Leaderboard руу буцах</Link>
          </div>
        </div>
      </div>
    );
  }

  const total = user.totalContribution ? user.totalContribution.toLocaleString("en-US") : "0";
  const displayName = user.nickname || user.fullName || `Player ${user.id}`;

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="text-center mb-6">
          {user.avatarUrl && (
            <img 
              src={user.avatarUrl} 
              alt={displayName}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-amber-400 dark:border-amber-400 shadow-lg"
            />
          )}
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{displayName}</h1>
          {user.fullName && user.nickname && (
            <div className="text-sm text-slate-500 dark:text-slate-500 mb-2">{user.fullName}</div>
          )}
          {user.profession && (
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">{user.profession}</div>
          )}
          <div className="text-base text-slate-600 dark:text-slate-400 mb-1">
            Нийт хөнгөлөлт: <strong className="text-amber-600 dark:text-amber-400 font-semibold">{total} ₮</strong>
          </div>
          {user.phone && (
            <div className="text-sm text-slate-500 dark:text-slate-500 mb-1">📱 {user.phone}</div>
          )}
          {user.gmail && (
            <div className="text-sm text-slate-500 dark:text-slate-500 mb-1">✉️ {user.gmail}</div>
          )}
          {user.socials && Object.keys(user.socials).length > 0 && (
            <div className="flex justify-center gap-3 mt-3">
              {user.socials.facebook && (
                <a 
                  href={user.socials.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {user.socials.instagram && (
                <a 
                  href={user.socials.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {user.socials.twitter && (
                <a 
                  href={user.socials.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              )}
              {user.socials.github && (
                <a 
                  href={user.socials.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  aria-label="GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                  </svg>
                </a>
              )}
            </div>
          )}
          {user.bio && (
            <div className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-left max-w-md mx-auto">
              {user.bio}
            </div>
          )}
        </div>
        <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
          <Link to="/" className="inline-block px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-[250ms] no-underline">← Leaderboard руу буцах</Link>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
