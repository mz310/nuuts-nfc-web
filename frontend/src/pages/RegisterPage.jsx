import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import './RegisterPage.css';

/**
 * RegisterPage - NFC Registration Form
 * 
 * BUG FIX SUMMARY:
 * ================
 * Root Cause: CSS in HomePage.css was hiding ALL .hero elements without .visible class.
 *             Only HomePage uses the scroll animation hook to add .visible class.
 *             RegisterPage, AboutPage, and ProfilePage use .hero but don't use the hook,
 *             so they were being hidden by the CSS rule.
 * 
 * Fix Applied:
 * 1. Changed CSS selector from .hero:not(.visible) to .scroll-animated:not(.visible)
 * 2. Added .scroll-animated class only to HomePage elements that use the scroll hook
 * 3. Other pages' .hero elements now remain visible by default
 * 4. Improved error handling - show errors instead of silently failing
 * 5. Added loading state indicator while checking UID
 * 
 * Files Modified:
 * - frontend/src/pages/HomePage.css: Scoped scroll animation CSS to .scroll-animated class
 * - frontend/src/pages/HomePage.jsx: Added .scroll-animated class to hero and board elements
 * - frontend/src/pages/RegisterPage.jsx: Improved error handling and loading states
 * 
 * Result: Registration form and other pages now stay visible and stable.
 */
function RegisterPage() {
  const [searchParams] = useSearchParams();
  const uid = (searchParams.get('uid') || '').toUpperCase();
  
  const [formData, setFormData] = useState({
    uid: uid,
    name: '',
    nickname: '',
    profession: ''
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
    // Note: No auto-hide or redirect logic here - form stays visible
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  async function checkUID() {
    try {
      const data = await api.checkRegister(uid);
      setCheckData(data);
      setFormData(prev => ({ ...prev, uid: uid }));
      // Clear any previous errors on successful check
      setError(null);
    } catch (error) {
      console.error('Failed to check UID:', error);
      // Show error message instead of hiding the form
      setError(error.message || 'UID шалгахад алдаа гарлаа. Дахин оролдоно уу.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.postRegister({
        ...formData,
        uid: formData.uid || uid
      });
      setSuccess(true);
      setUserId(data.userId);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  function handleChange(e) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  if (success && userId) {
    return (
      <div className="hero">
        <div className="hero-title">Бүртгэл амжилттай</div>
        <div className="hero-sub">Таны хэрэглэгч үүсгэлээ.</div>
        <p className="hero-sub">
          NFC writer-аар UID уншуулбал профайл линк бичигдэнэ.
        </p>
        <div style={{ marginTop: 'var(--space-xl)', display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={`/u/${userId}`} className="btn">Миний профайлыг харах</a>
          <a href="/" className="btn btn-outline">Leaderboard руу буцах</a>
        </div>
      </div>
    );
  }

  // Determine message based on check result
  let msg = "NFC UID параметрээр ирвэл автоматаар бөглөгдөнө.";
  if (checkData?.message) {
    msg = checkData.message;
  } else if (uid) {
    msg = "Энэ NFC-г өөртэйгөө холбож бүртгүүлэх боломжтой. Бүртгэл хийсний дараа writer-аар дахин уншуул.";
  }

  // Show loading state while checking UID (only if UID exists and we're checking)
  const isCheckingUID = uid && !checkData && !error;

  return (
    <div className="hero">
      <div className="hero-title">NFC бүртгэл</div>
      <div className="hero-sub">{msg}</div>
      {isCheckingUID && (
        <p style={{ marginTop: 'var(--space-sm)', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          UID шалгаж байна...
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: 'var(--space-xl) auto 0' }}>
        <p style={{ marginTop: 'var(--space-md)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', textAlign: 'center' }}>
          NFC UID: <strong style={{ color: 'var(--brand-primary)' }}>{formData.uid || "(одоогоор тодорхойгүй)"}</strong>
        </p>
        <p>
          <input
            name="name"
            placeholder="Нэр"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </p>
        <p>
          <input
            name="nickname"
            placeholder="Хоч (optional)"
            value={formData.nickname}
            onChange={handleChange}
          />
        </p>
        <p>
          <input
            name="profession"
            placeholder="Мэргэжил (optional)"
            value={formData.profession}
            onChange={handleChange}
          />
        </p>
        {error && (
          <p style={{ color: '#dc2626', marginBottom: 'var(--space-sm)' }}>
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 'var(--space-sm)' }}>
          {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
        </button>
      </form>
      <p style={{ marginTop: 'var(--space-lg)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 'var(--line-height-relaxed)' }}>
        Бүртгэлийн дараа NFC writer-аар UID-гаа дахин уншуулж profile линк бичүүлнэ.
      </p>
    </div>
  );
}

export default RegisterPage;

