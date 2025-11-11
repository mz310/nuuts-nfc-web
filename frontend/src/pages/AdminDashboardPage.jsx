import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [lastScan, setLastScan] = useState(null);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState(null);
  const [messageOk, setMessageOk] = useState(false);

  // Form states
  const [txForm, setTxForm] = useState({ uid: '', amount: '', user_label: '' });
  const [regForm, setRegForm] = useState({ uid: '', name: '', nickname: '', profession: '' });
  
  // Per-user loading states
  const [loadingUsers, setLoadingUsers] = useState({});

  useEffect(() => {
    loadDashboard();
    loadLastScan();
    // Poll less frequently - only every 5 seconds instead of every second
    const scanInterval = setInterval(loadLastScan, 5000);
    return () => clearInterval(scanInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function loadDashboard() {
    try {
      const data = await api.getAdminDashboard(query);
      setUsers(data.users || []);
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        navigate('/admin/login');
      }
      console.error('Failed to load dashboard:', error);
    }
  }

  async function loadLastScan() {
    try {
      const data = await api.getLastScan();
      
      // Only update if UID actually changed (avoid unnecessary updates)
      if (data.uid && data.uid !== lastScan?.uid) {
        setLastScan(data);
        
        if (data.user) {
          // User exists - show transaction form
          // Only update if UID changed (don't overwrite if user is typing amount)
          setTxForm(prev => {
            // If same UID and user is entering amount, preserve the amount
            if (prev.uid === data.uid) {
              return {
                uid: data.uid,
                user_label: `ID ${data.user.id} · ${data.user.name}`,
                amount: prev.amount // Preserve the amount user is typing
              };
            }
            // If UID changed, update everything
            return {
              uid: data.uid,
              user_label: `ID ${data.user.id} · ${data.user.name}`,
              amount: ''
            };
          });
          setRegForm({ uid: '', name: '', nickname: '', profession: '' });
        } else {
          // No user - show registration form
          // Only update if UID changed (don't overwrite if user is typing)
          setRegForm(prev => {
            if (prev.uid === data.uid && (prev.name || prev.nickname || prev.profession)) {
              return prev;
            }
            return {
              uid: data.uid,
              name: '',
              nickname: '',
              profession: ''
            };
          });
          // Only clear txForm if UID changed
          setTxForm(prev => {
            if (prev.uid === data.uid) {
              return prev;
            }
            return { uid: '', user_label: '', amount: '' };
          });
        }
      } else if (!data.uid && lastScan?.uid) {
        // UID was cleared - reset forms
        setLastScan(data);
        setTxForm({ uid: '', user_label: '', amount: '' });
        setRegForm({ uid: '', name: '', nickname: '', profession: '' });
      } else {
        // No change - just update lastScan state without triggering form updates
        setLastScan(data);
      }
    } catch (error) {
      console.error('Failed to load last scan:', error);
    }
  }

  async function handleQuickAddTx(e) {
    e.preventDefault();
    try {
      const result = await api.adminQuickAddTx(txForm);
      setMessage(result.message);
      setMessageOk(true);
      setTxForm(prev => ({ ...prev, amount: '' }));
      loadDashboard();
      
      // Clear form and message after short delay
      setTimeout(() => {
        setTxForm({ uid: '', amount: '', user_label: '' });
        setMessage(null);
      }, 2000);
    } catch (error) {
      setMessage(error.message);
      setMessageOk(false);
    }
  }

  async function handleQuickRegister(e) {
    e.preventDefault();
    try {
      // If no UID, send null - backend will generate random UID
      const result = await api.adminQuickRegister({
        ...regForm,
        uid: regForm.uid && regForm.uid.trim() ? regForm.uid.trim() : null
      });
      setMessage(result.message);
      setMessageOk(true);
      setRegForm({ uid: '', name: '', nickname: '', profession: '' });
      loadDashboard();
      loadLastScan();
    } catch (error) {
      setMessage(error.message);
      setMessageOk(false);
    }
  }

  async function handleTestScan(user) {
    if (!user.uid) {
      setMessage(`Алдаа: ${user.name} хэрэглэгчид UID байхгүй байна.`);
      setMessageOk(false);
      return;
    }

    setLoadingUsers(prev => ({ ...prev, [user.id]: true }));
    setMessage(null);

    try {
      // Simulate NFC scan by calling the scan endpoint
      const result = await api.scan({ uid: user.uid });
      setMessage(`Тест: UID ${user.uid} уншсан мэт хийлээ. ${result.linked ? 'Хэрэглэгч холбогдсон.' : 'Хэрэглэгч олдсонгүй.'}`);
      setMessageOk(true);
      
      // Refresh last scan to update the Action section
      await loadLastScan();
    } catch (error) {
      setMessage(`Алдаа (${user.name}): ${error.message}`);
      setMessageOk(false);
    } finally {
      setLoadingUsers(prev => ({ ...prev, [user.id]: false }));
    }
  }

  async function handleDeleteUser(userId) {
    if (!confirm('Устгах уу?')) return;
    try {
      const result = await api.adminDeleteUser(userId);
      setMessage(result.message);
      setMessageOk(true);
      loadDashboard();
    } catch (error) {
      setMessage(error.message);
      setMessageOk(false);
    }
  }

  async function handleLogout() {
    await api.adminLogout();
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200 dark:border-amber-200/20">
        <div className="text-xl font-semibold text-slate-900 dark:text-slate-100">Admin · Mazaalai Conservation</div>
        <div className="flex gap-4 items-center">
          <a 
            href="/admin" 
            className="text-slate-600 dark:text-slate-400 no-underline text-base px-2 py-1 rounded-md transition-all duration-250 font-medium bg-transparent border-none cursor-pointer font-sans hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-300/10"
          >
            Dashboard
          </a>
          <button 
            onClick={handleLogout} 
            className="text-slate-600 dark:text-slate-400 text-base px-2 py-1 rounded-md transition-all duration-250 font-medium bg-transparent border-none cursor-pointer font-sans hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-300/10"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-200/20 rounded-xl p-6 shadow-sm transition-shadow duration-250 hover:shadow-md">
          <h3 className="mb-4 text-slate-900 dark:text-slate-100 text-lg font-semibold">Live scan</h3>
          <p className="text-slate-900 dark:text-slate-100">
            Сүүлд ирсэн UID: <b>{lastScan?.uid || '—'}</b>
            <span className="text-slate-600 dark:text-slate-400 text-xs">
              {lastScan?.user ? ' (бүртгэлтэй)' : lastScan?.uid ? ' (бүртгэлгүй)' : ''}
            </span>
          </p>
          {lastScan?.user && (
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              ID {lastScan.user.id} · {lastScan.user.name}{lastScan.user.nickname ? ` (${lastScan.user.nickname})` : ''}
            </p>
          )}
          <p className="text-slate-600 dark:text-slate-400 text-xs">Сүүлд уншсан UID-аар доорх Action хэсэг автоматаар солигдоно.</p>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-200/20 rounded-xl p-6 shadow-sm transition-shadow duration-250 hover:shadow-md">
          <h3 className="mb-4 text-slate-900 dark:text-slate-100 text-lg font-semibold">Action</h3>
          {txForm.uid && (
            <form id="formAddTx" onSubmit={handleQuickAddTx}>
              <input 
                type="text" 
                name="uid" 
                value={txForm.uid} 
                readOnly 
                className="w-full mb-2 py-1.5 px-2 rounded-md border border-slate-300 dark:border-slate-700 text-xs bg-amber-50 dark:bg-amber-50 text-amber-900 dark:text-amber-900"
              />
              <div className="flex gap-2 flex-wrap mb-2">
                <input
                  name="user_label"
                  value={txForm.user_label}
                  readOnly
                  className="flex-[2] py-1.5 px-2 rounded-md border border-slate-300 dark:border-slate-700 mb-2 bg-amber-50 dark:bg-amber-50 text-amber-900 dark:text-amber-900 font-medium tracking-wide text-xs font-sans"
                />
                <input
                  name="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="Дүн (₮)"
                  value={txForm.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only numbers and decimal point
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setTxForm(prev => ({ ...prev, amount: value }));
                    }
                  }}
                  required
                  className="w-[120px] py-1.5 px-2 rounded-md border border-slate-300 dark:border-slate-700 mb-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-sans transition-all duration-250 focus:outline-none focus:border-amber-500 dark:focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-300/20"
                />
              </div>
              <button type="submit" className="btn mt-2">Дүн нэмэх</button>
            </form>
          )}

          {regForm.uid && (
            <form id="formQuickReg" onSubmit={handleQuickRegister}>
              <input 
                type="text" 
                name="uid" 
                value={regForm.uid} 
                readOnly 
                className="w-full mb-2 py-1.5 px-2 rounded-md border border-slate-300 dark:border-slate-700 text-xs bg-amber-50 dark:bg-amber-50 text-amber-900 dark:text-amber-900"
              />
              <div className="flex gap-2 flex-wrap mb-2">
                <input
                  name="name"
                  placeholder="Нэр"
                  value={regForm.name}
                  onChange={(e) => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="flex-1 py-1.5 px-2 rounded-md border border-slate-300 dark:border-slate-700 mb-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-sans transition-all duration-250 focus:outline-none focus:border-amber-500 dark:focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-300/20"
                />
                <input
                  name="nickname"
                  placeholder="Хоч"
                  value={regForm.nickname}
                  onChange={(e) => setRegForm(prev => ({ ...prev, nickname: e.target.value }))}
                  className="flex-1 py-1.5 px-2 rounded-md border border-slate-300 dark:border-slate-700 mb-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-sans transition-all duration-250 focus:outline-none focus:border-amber-500 dark:focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-300/20"
                />
                <input
                  name="profession"
                  placeholder="Мэргэжил"
                  value={regForm.profession}
                  onChange={(e) => setRegForm(prev => ({ ...prev, profession: e.target.value }))}
                  className="flex-1 py-1.5 px-2 rounded-md border border-slate-300 dark:border-slate-700 mb-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-sans transition-all duration-250 focus:outline-none focus:border-amber-500 dark:focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-300/20"
                />
              </div>
              <button type="submit" className="btn">Бүртгээд холбох</button>
            </form>
          )}
          
          {!txForm.uid && !regForm.uid && (
            <form id="formQuickRegManual" onSubmit={handleQuickRegister}>
              <p className="text-slate-600 dark:text-slate-400 text-xs mb-2">UID байхгүй бол автоматаар random UID үүснэ (NFC tag ID-тэй адил)</p>
              <div className="flex gap-2 flex-wrap mb-2">
                <input
                  name="name"
                  placeholder="Нэр *"
                  value={regForm.name}
                  onChange={(e) => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="flex-1 py-1.5 px-2 rounded-md border border-slate-300 dark:border-slate-700 mb-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-sans transition-all duration-250 focus:outline-none focus:border-amber-500 dark:focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-300/20"
                />
                <input
                  name="nickname"
                  placeholder="Хоч"
                  value={regForm.nickname}
                  onChange={(e) => setRegForm(prev => ({ ...prev, nickname: e.target.value }))}
                  className="flex-1 py-1.5 px-2 rounded-md border border-slate-300 dark:border-slate-700 mb-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-sans transition-all duration-250 focus:outline-none focus:border-amber-500 dark:focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-300/20"
                />
                <input
                  name="profession"
                  placeholder="Мэргэжил"
                  value={regForm.profession}
                  onChange={(e) => setRegForm(prev => ({ ...prev, profession: e.target.value }))}
                  className="flex-1 py-1.5 px-2 rounded-md border border-slate-300 dark:border-slate-700 mb-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-sans transition-all duration-250 focus:outline-none focus:border-amber-500 dark:focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-300/20"
                />
              </div>
              <button type="submit" className="btn">Хэрэглэгч үүсгэх (UID автоматаар)</button>
            </form>
          )}

          {message && (
            <p className={`mt-2 font-medium ${messageOk ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
              {message}
            </p>
          )}
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-200/20 rounded-xl p-6 shadow-sm transition-shadow duration-250 hover:shadow-md">
          <h3 className="mb-4 text-slate-900 dark:text-slate-100 text-lg font-semibold">Хэрэглэгчид</h3>
          <form onSubmit={(e) => { e.preventDefault(); loadDashboard(); }}>
            <div className="flex gap-2 flex-wrap mb-2">
              <input
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Нэр/хоч/UID/мэргэжил"
                className="flex-1 py-1.5 px-2 rounded-md border border-slate-300 dark:border-slate-700 mb-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-sans transition-all duration-250 focus:outline-none focus:border-amber-500 dark:focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-300/20"
              />
              <button type="submit" className="btn">Хайх</button>
            </div>
          </form>
          <div className="overflow-x-auto mt-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2 border-b border-slate-200 dark:border-amber-200/10 text-left font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900">ID</th>
                  <th className="p-2 border-b border-slate-200 dark:border-amber-200/10 text-left font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900">Нэр</th>
                  <th className="p-2 border-b border-slate-200 dark:border-amber-200/10 text-left font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900">Хоч</th>
                  <th className="p-2 border-b border-slate-200 dark:border-amber-200/10 text-left font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900">UID</th>
                  <th className="p-2 border-b border-slate-200 dark:border-amber-200/10 text-left font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900">Нийт</th>
                  <th className="p-2 border-b border-slate-200 dark:border-amber-200/10 text-left font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900">Тест Scan</th>
                  <th className="p-2 border-b border-slate-200 dark:border-amber-200/10 text-left font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr 
                      key={u.id} 
                      className="transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <td className="p-2 border-b border-slate-200 dark:border-amber-200/10 text-left text-slate-900 dark:text-slate-100">{u.id}</td>
                      <td className="p-2 border-b border-slate-200 dark:border-amber-200/10 text-left text-slate-900 dark:text-slate-100">{u.name}</td>
                      <td className="p-2 border-b border-slate-200 dark:border-amber-200/10 text-left text-slate-900 dark:text-slate-100">{u.nickname || ''}</td>
                      <td className="p-2 border-b border-slate-200 dark:border-amber-200/10 text-left text-slate-900 dark:text-slate-100">{u.uid || '-'}</td>
                      <td className="p-2 border-b border-slate-200 dark:border-amber-200/10 text-left text-slate-900 dark:text-slate-100">{u.total ? u.total.toLocaleString("en-US") : '0'} ₮</td>
                      <td className="p-2 border-b border-slate-200 dark:border-amber-200/10 text-left">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleTestScan(u);
                          }}
                          disabled={!u.uid || loadingUsers[u.id]}
                          className={`btn py-1 px-2 text-xs ${!u.uid ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
                          title={!u.uid ? 'UID байхгүй' : 'UID-г уншуулж байгаа мэт тест хийх'}
                        >
                          {loadingUsers[u.id] ? '...' : '📱'}
                        </button>
                      </td>
                      <td className="p-2 border-b border-slate-200 dark:border-amber-200/10 text-left">
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="btn text-xs py-1 px-2"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-2 border-b border-slate-200 dark:border-amber-200/10 text-left text-slate-600 dark:text-slate-400">
                      Одоогоор хэрэглэгч алга.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {message && (
            <div className={`mt-3 p-2 rounded-md ${messageOk ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-500' : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-500'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
