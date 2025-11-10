import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function AdminLoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.adminLogin(formData.username, formData.password);
      navigate('/admin');
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-6 mb-6 shadow-lg transition-shadow duration-[250ms] hover:shadow-xl max-w-[360px] mx-auto mt-20">
        <h3 className="mb-4 text-slate-900 dark:text-slate-100 text-lg font-semibold">Admin Login</h3>
        {error && <p className="text-red-600 dark:text-red-500 font-medium mb-2">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 flex-wrap mb-2">
            <input
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full py-1.5 px-2 rounded-md border border-slate-300 dark:border-slate-700 mb-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-sans transition-all duration-[250ms] focus:outline-none focus:border-amber-500 dark:focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-300/20"
            />
          </div>
          <div className="flex gap-2 flex-wrap mb-2">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full py-1.5 px-2 rounded-md border border-slate-300 dark:border-slate-700 mb-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-sans transition-all duration-[250ms] focus:outline-none focus:border-amber-500 dark:focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-300/20"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full py-2 px-4 rounded-lg bg-amber-500 dark:bg-amber-600 text-white font-medium hover:bg-amber-600 dark:hover:bg-amber-700 transition-colors duration-[250ms] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
