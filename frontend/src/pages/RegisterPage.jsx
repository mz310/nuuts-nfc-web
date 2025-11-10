import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';

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
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <a href={`/u/${userId}`} className="btn">Миний профайлыг харах</a>
          <a href="/" className="btn btn-outline">Leaderboard руу буцах</a>
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
    <div className="hero">
      <div className="hero-title">NFC бүртгэл</div>
      <div className="hero-sub">{msg}</div>
      {isCheckingUID && (
        <p className="mt-2 text-slate-400 dark:text-slate-400 text-sm">
          UID шалгаж байна...
        </p>
      )}
      <form onSubmit={handleSubmit} className="max-w-[500px] mx-auto mt-8">
        <p className="mt-4 text-sm text-slate-400 dark:text-slate-400 text-center">
          NFC UID: <strong className="text-amber-300 dark:text-amber-300">{formData.uid || "(одоогоор тодорхойгүй)"}</strong>
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
          <p className="text-red-500 dark:text-red-500 mb-2">
            {error}
          </p>
        )}
        <button 
          type="submit" 
          disabled={loading} 
          className={`btn w-full mt-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-400 dark:text-slate-400 text-center leading-relaxed">
        Бүртгэлийн дараа NFC writer-аар UID-гаа дахин уншуулж profile линк бичүүлнэ.
      </p>
    </div>
  );
}

export default RegisterPage;
