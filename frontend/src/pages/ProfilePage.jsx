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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-xl mx-auto">
            <div className="bg-white/75 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 sm:p-10 border border-slate-200/60 dark:border-slate-700/50 shadow-xl">
              <div className="text-center text-lg font-bold text-slate-900 dark:text-slate-100">Уншиж байна...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-xl mx-auto">
            <div className="bg-white/75 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 sm:p-10 border border-slate-200/60 dark:border-slate-700/50 shadow-xl">
              <div className="text-center text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Алдаа</div>
              <div className="text-center text-sm text-slate-600 dark:text-slate-400 mb-6">{error || 'Хэрэглэгч олдсонгүй'}</div>
              <div className="text-center mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-700/50">
                <Link to="/" className="mx-auto inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow transition text-slate-700 dark:text-slate-200 no-underline focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:focus:ring-amber-500/40">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Leaderboard руу буцах
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const total = user.totalContribution ? user.totalContribution.toLocaleString('mn-MN') : "0";
  const displayName = user.nickname || user.fullName || `Player ${user.id}`;
  const firstName = user.fullName || displayName;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-xl mx-auto">
          <div className="bg-white/75 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 sm:p-10 border border-slate-200/60 dark:border-slate-700/50 shadow-xl">
            <div className="text-center">
              <div className="relative mx-auto mb-6 h-28 w-28 rounded-full ring-4 ring-amber-400/90 dark:ring-amber-500/90 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={`${firstName} avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-400/20 to-amber-600/20 dark:from-amber-500/30 dark:to-amber-700/30">
                    <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                      {firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 text-center">
                {displayName}
              </h1>
              
              {user.fullName && user.nickname && (
                <div className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">
                  {user.fullName}
                </div>
              )}
              
              {user.profession && (
                <div className="text-sm text-slate-600 dark:text-slate-300 text-center mt-1">
                  {user.profession}
                </div>
              )}

              <div className="mt-4 text-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">Нийт хөнгөлөлт: </span>
                <span className="text-amber-500 dark:text-amber-400 font-semibold">{total} ₮</span>
              </div>

              {(user.phone || user.gmail) && (
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.phone && (
                    <div className="inline-flex items-center gap-2 justify-center text-slate-700 dark:text-slate-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  )}
                  {user.gmail && (
                    <a 
                      href={`mailto:${user.gmail}`}
                      className="inline-flex items-center gap-2 justify-center text-slate-700 dark:text-slate-200 break-all hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">{user.gmail}</span>
                    </a>
                  )}
                </div>
              )}

              {user.socials && Object.keys(user.socials).length > 0 && (
                <div className="mt-4 flex items-center justify-center gap-5">
                  {user.socials.facebook && (
                    <a 
                      href={user.socials.facebook} 
                      target="_blank" 
                      rel="noreferrer noopener"
                      className="h-10 w-10 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-sm transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:focus:ring-amber-500/40 text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400"
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
                      rel="noreferrer noopener"
                      className="h-10 w-10 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-sm transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:focus:ring-amber-500/40 text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400"
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
                      rel="noreferrer noopener"
                      className="h-10 w-10 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-sm transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:focus:ring-amber-500/40 text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400"
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
                      rel="noreferrer noopener"
                      className="h-10 w-10 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-sm transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:focus:ring-amber-500/40 text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400"
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
                <div className="mt-6 text-center text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {user.bio}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-700/50">
                <Link 
                  to="/" 
                  className="mx-auto inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow transition text-slate-700 dark:text-slate-200 no-underline focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:focus:ring-amber-500/40"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Leaderboard руу буцах
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
