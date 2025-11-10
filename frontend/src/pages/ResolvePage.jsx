import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

function ResolvePage() {
  const { uid } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    resolveUID();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  async function resolveUID() {
    try {
      const data = await api.resolveUID(uid);
      navigate(data.redirect);
    } catch (error) {
      console.error('Failed to resolve UID:', error);
      navigate('/');
    }
  }

  return (
    <div className="hero">
      <div className="hero-title">Уншиж байна...</div>
    </div>
  );
}

export default ResolvePage;
