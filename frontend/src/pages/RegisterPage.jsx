import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = (searchParams.get('uid') || '').toUpperCase();
  
  const [formData, setFormData] = useState({
    uid: uid,
    fullName: '',
    nickname: '',
    profession: '',
    phone: '',
    gmail: '',
    socials: {
      facebook: '',
      instagram: '',
      twitter: '',
      github: ''
    },
    bio: '',
    avatarUrl: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
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
      setFormData(prev => ({ ...prev, uid: uid }));
      setError(null);
    } catch (error) {
      console.error('Failed to check UID:', error);
      setError(error.message || 'UID шалгахад алдаа гарлаа. Дахин оролдоно уу.');
    }
  }

  function validateForm() {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Нэр шаардлагатай';
    }

    if (!formData.gmail.trim()) {
      errors.gmail = 'Имэйл шаардлагатай';
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.gmail)) {
        errors.gmail = 'Хүчинтэй имэйл оруулна уу';
      }
    }

    if (!formData.uid || !formData.uid.trim()) {
      errors.uid = 'UID шаардлагатай';
    }

    if (formData.avatarUrl && formData.avatarUrl.trim()) {
      try {
        new URL(formData.avatarUrl);
      } catch {
        errors.avatarUrl = 'Хүчинтэй URL оруулна уу';
      }
    }

    const socials = formData.socials;
    if (socials.facebook && socials.facebook.trim()) {
      try {
        new URL(socials.facebook);
      } catch {
        errors.socialsFacebook = 'Хүчинтэй URL оруулна уу';
      }
    }
    if (socials.instagram && socials.instagram.trim()) {
      try {
        new URL(socials.instagram);
      } catch {
        errors.socialsInstagram = 'Хүчинтэй URL оруулна уу';
      }
    }
    if (socials.twitter && socials.twitter.trim()) {
      try {
        new URL(socials.twitter);
      } catch {
        errors.socialsTwitter = 'Хүчинтэй URL оруулна уу';
      }
    }
    if (socials.github && socials.github.trim()) {
      try {
        new URL(socials.github);
      } catch {
        errors.socialsGithub = 'Хүчинтэй URL оруулна уу';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const socials = {};
      if (formData.socials.facebook?.trim()) socials.facebook = formData.socials.facebook.trim();
      if (formData.socials.instagram?.trim()) socials.instagram = formData.socials.instagram.trim();
      if (formData.socials.twitter?.trim()) socials.twitter = formData.socials.twitter.trim();
      if (formData.socials.github?.trim()) socials.github = formData.socials.github.trim();

      const payload = {
        uid: formData.uid || uid,
        fullName: formData.fullName.trim(),
        nickname: formData.nickname.trim() || undefined,
        profession: formData.profession.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        gmail: formData.gmail.trim(),
        bio: formData.bio.trim() || undefined,
        avatarUrl: formData.avatarUrl.trim() || undefined
      };

      if (Object.keys(socials).length > 0) {
        payload.socials = socials;
      }

      const data = await api.postRegister(payload);
      setSuccess(true);
      setUserId(data.userId);
      setTimeout(() => {
        navigate(`/u/${data.userId}`);
      }, 1500);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name.startsWith('socials.')) {
      const socialKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socials: {
          ...prev.socials,
          [socialKey]: value
        }
      }));
      const errorKey = `socials${socialKey.charAt(0).toUpperCase() + socialKey.slice(1)}`;
      if (fieldErrors[errorKey]) {
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next[errorKey];
          return next;
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      if (fieldErrors[name]) {
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    }
  }

  if (success && userId) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Бүртгэл амжилттай</h1>
            <div className="text-base text-slate-600 dark:text-slate-400 mb-2">Таны хэрэглэгч үүсгэлээ.</div>
            <div className="text-sm text-slate-500 dark:text-slate-500">
              NFC writer-аар UID уншуулбал профайл линк бичигдэнэ.
            </div>
          </div>
          <div className="flex gap-4 justify-center flex-wrap pt-4 border-t border-slate-200 dark:border-slate-700">
            <a href={`/u/${userId}`} className="px-4 py-2 rounded-lg bg-amber-500 dark:bg-amber-600 text-white font-medium hover:bg-amber-600 dark:hover:bg-amber-700 transition-colors duration-[250ms] no-underline">Миний профайлыг харах</a>
            <a href="/" className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-[250ms] no-underline">Leaderboard руу буцах</a>
          </div>
        </div>
      </div>
    );
  }

  let msg = "NFC UID параметрээр ирвэл автоматаар бөглөгдөнө.";
  if (checkData?.message) {
    msg = checkData.message;
  } else if (uid) {
    msg = "Энэ NFC-г өөртэйгөө холбож бүртгүүлэх боломжтой. Бүртгэл хийсний дараа writer-аар дахин уншуул.";
  }

  const isCheckingUID = uid && !checkData && !error;

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">NFC бүртгэл</h1>
          <div className="text-base text-slate-600 dark:text-slate-400 mb-2">{msg}</div>
          {isCheckingUID && (
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
              UID шалгаж байна...
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              NFC UID <span className="text-red-500">*</span>
            </label>
            <input
              name="uid"
              value={formData.uid || ''}
              readOnly
              className="w-full py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 cursor-not-allowed"
            />
            {fieldErrors.uid && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.uid}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Бүтэн нэр <span className="text-red-500">*</span>
            </label>
            <input
              name="fullName"
              placeholder="Жишээ: Зоригт Мөнхбаатар"
              value={formData.fullName}
              onChange={handleChange}
              required
              className={`w-full py-2.5 px-4 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-[250ms] ${
                fieldErrors.fullName
                  ? 'border-red-500 dark:border-red-500 focus:ring-red-500/20 dark:focus:ring-red-500/20'
                  : 'border-slate-300 dark:border-slate-600 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 focus:border-amber-500 dark:focus:border-amber-400'
              }`}
            />
            {fieldErrors.fullName && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.fullName}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Хоч
            </label>
            <input
              name="nickname"
              placeholder="Жишээ: Zorro"
              value={formData.nickname}
              onChange={handleChange}
              className="w-full py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 focus:border-amber-500 dark:focus:border-amber-400 transition-all duration-[250ms]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Мэргэжил
            </label>
            <input
              name="profession"
              placeholder="Жишээ: Software Engineer"
              value={formData.profession}
              onChange={handleChange}
              className="w-full py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 focus:border-amber-500 dark:focus:border-amber-400 transition-all duration-[250ms]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Утас
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="Жишээ: +976 99999999"
              value={formData.phone}
              onChange={handleChange}
              className="w-full py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 focus:border-amber-500 dark:focus:border-amber-400 transition-all duration-[250ms]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Имэйл <span className="text-red-500">*</span>
            </label>
            <input
              name="gmail"
              type="email"
              placeholder="Жишээ: zorigt@gmail.com"
              value={formData.gmail}
              onChange={handleChange}
              required
              className={`w-full py-2.5 px-4 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-[250ms] ${
                fieldErrors.gmail
                  ? 'border-red-500 dark:border-red-500 focus:ring-red-500/20 dark:focus:ring-red-500/20'
                  : 'border-slate-300 dark:border-slate-600 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 focus:border-amber-500 dark:focus:border-amber-400'
              }`}
            />
            {fieldErrors.gmail && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.gmail}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Нийгмийн сүлжээ
            </label>
            <div className="space-y-2">
              <input
                name="socials.facebook"
                placeholder="Facebook URL (optional)"
                value={formData.socials.facebook}
                onChange={handleChange}
                className={`w-full py-2 px-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-[250ms] text-sm ${
                  fieldErrors.socialsFacebook
                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500/20 dark:focus:ring-red-500/20'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 focus:border-amber-500 dark:focus:border-amber-400'
                }`}
              />
              {fieldErrors.socialsFacebook && (
                <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.socialsFacebook}</p>
              )}
              <input
                name="socials.instagram"
                placeholder="Instagram URL (optional)"
                value={formData.socials.instagram}
                onChange={handleChange}
                className={`w-full py-2 px-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-[250ms] text-sm ${
                  fieldErrors.socialsInstagram
                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500/20 dark:focus:ring-red-500/20'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 focus:border-amber-500 dark:focus:border-amber-400'
                }`}
              />
              {fieldErrors.socialsInstagram && (
                <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.socialsInstagram}</p>
              )}
              <input
                name="socials.twitter"
                placeholder="Twitter URL (optional)"
                value={formData.socials.twitter}
                onChange={handleChange}
                className={`w-full py-2 px-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-[250ms] text-sm ${
                  fieldErrors.socialsTwitter
                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500/20 dark:focus:ring-red-500/20'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 focus:border-amber-500 dark:focus:border-amber-400'
                }`}
              />
              {fieldErrors.socialsTwitter && (
                <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.socialsTwitter}</p>
              )}
              <input
                name="socials.github"
                placeholder="GitHub URL (optional)"
                value={formData.socials.github}
                onChange={handleChange}
                className={`w-full py-2 px-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-[250ms] text-sm ${
                  fieldErrors.socialsGithub
                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500/20 dark:focus:ring-red-500/20'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 focus:border-amber-500 dark:focus:border-amber-400'
                }`}
              />
              {fieldErrors.socialsGithub && (
                <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.socialsGithub}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Био
            </label>
            <textarea
              name="bio"
              placeholder="Таны тухай товч тайлбар..."
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 focus:border-amber-500 dark:focus:border-amber-400 transition-all duration-[250ms] resize-y"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Аватар зураг URL
            </label>
            <input
              name="avatarUrl"
              type="url"
              placeholder="Жишээ: https://example.com/avatar.jpg"
              value={formData.avatarUrl}
              onChange={handleChange}
              className={`w-full py-2.5 px-4 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-[250ms] ${
                fieldErrors.avatarUrl
                  ? 'border-red-500 dark:border-red-500 focus:ring-red-500/20 dark:focus:ring-red-500/20'
                  : 'border-slate-300 dark:border-slate-600 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 focus:border-amber-500 dark:focus:border-amber-400'
              }`}
            />
            {fieldErrors.avatarUrl && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.avatarUrl}</p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full py-2.5 px-4 rounded-lg bg-amber-500 dark:bg-amber-600 text-white font-medium hover:bg-amber-600 dark:hover:bg-amber-700 transition-colors duration-[250ms] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
          Бүртгэлийн дараа NFC writer-аар UID-гаа дахин уншуулж profile линк бичүүлнэ.
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
