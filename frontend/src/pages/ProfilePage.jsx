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
      const data = await api.getUserProfile(id);
      setUser(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }

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
        <div className="hero-sub">{error || 'Хэрэглэгч олдсонгүй'}</div>
        <p className="mt-6">
          <Link to="/" className="btn btn-outline">← Leaderboard руу буцах</Link>
        </p>
      </div>
    );
  }

  const total = user.total ? user.total.toLocaleString("en-US") : "0";
  const label = user.label || `Player ${user.id}`;

  return (
    <div className="hero">
      <div className="hero-title">{label}</div>
      <div className="hero-sub">
        Нийт хөнгөлөлт: <strong>{total} ₮</strong>
      </div>
      <p className="hero-sub">ID: {user.id}{user.profession ? " · " + user.profession : ""}</p>
      <p className="mt-6">
        <Link to="/" className="btn btn-outline">← Leaderboard руу буцах</Link>
      </p>
    </div>
  );
}

export default ProfilePage;
