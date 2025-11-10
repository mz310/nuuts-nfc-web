import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import './AdminDashboardPage.css';

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
  
  // Per-user amount input states
  const [userAmounts, setUserAmounts] = useState({});
  const [loadingUsers, setLoadingUsers] = useState({});

  useEffect(() => {
    loadDashboard();
    loadLastScan();
    const scanInterval = setInterval(loadLastScan, 1000);
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
      setLastScan(data);
      
      if (data.uid) {
        if (data.user) {
          // User exists - show transaction form
          setTxForm({
            uid: data.uid,
            user_label: `ID ${data.user.id} · ${data.user.name}`,
            amount: ''
          });
          setRegForm({ uid: '', name: '', nickname: '', profession: '' });
        } else {
          // No user - show registration form
          setRegForm({
            uid: data.uid,
            name: '',
            nickname: '',
            profession: ''
          });
          setTxForm({ uid: '', user_label: '', amount: '' });
        }
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

  async function handleAddAmount(user) {
    const amount = userAmounts[user.id]?.trim();
    if (!amount || parseFloat(amount) <= 0) {
      setMessage('Дүн оруулна уу (0-с их байх ёстой)');
      setMessageOk(false);
      return;
    }

    // Check if user has UID (required by backend)
    if (!user.uid) {
      setMessage(`Алдаа: ${user.name} хэрэглэгчид UID байхгүй байна. Эхлээд UID холбох хэрэгтэй.`);
      setMessageOk(false);
      return;
    }

    setLoadingUsers(prev => ({ ...prev, [user.id]: true }));
    setMessage(null);

    try {
      // Backend requires UID to find the user
      const txData = {
        uid: user.uid,
        amount: amount,
        user_label: `ID ${user.id} · ${user.name}${user.nickname ? ` (${user.nickname})` : ''}`
      };

      await api.adminQuickAddTx(txData);
      setMessage(`Амжилттай: ${user.name}-д ${parseFloat(amount).toLocaleString('en-US')} ₮ нэмлээ.`);
      setMessageOk(true);
      
      // Clear the input for this user
      setUserAmounts(prev => ({ ...prev, [user.id]: '' }));
      
      // Refresh dashboard to show updated totals
      await loadDashboard();
    } catch (error) {
      setMessage(`Алдаа (${user.name}): ${error.message}`);
      setMessageOk(false);
    } finally {
      setLoadingUsers(prev => ({ ...prev, [user.id]: false }));
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
    <div className="admin-wrap">
      <header className="admin-header">
        <div><strong>Admin · Mazaalai Conservation</strong></div>
        <div className="nav">
          <a href="/admin">Dashboard</a>
          <button onClick={handleLogout} className="btn-link">Logout</button>
        </div>
      </header>

      <div className="grid">
        <div className="admin-card">
          <h3>Live scan</h3>
          <p>Сүүлд ирсэн UID: <b>{lastScan?.uid || '—'}</b>
            <span className="muted">
              {lastScan?.user ? ' (бүртгэлтэй)' : lastScan?.uid ? ' (бүртгэлгүй)' : ''}
            </span>
          </p>
          {lastScan?.user && (
            <p className="muted">
              ID {lastScan.user.id} · {lastScan.user.name}{lastScan.user.nickname ? ` (${lastScan.user.nickname})` : ''}
            </p>
          )}
          <p className="muted">Сүүлд уншсан UID-аар доорх Action хэсэг автоматаар солигдоно.</p>
        </div>

        <div className="admin-card">
          <h3>Action</h3>
          {txForm.uid && (
            <form id="formAddTx" onSubmit={handleQuickAddTx}>
              <input type="text" name="uid" value={txForm.uid} readOnly style={{ width: '100%', marginBottom: 8, background: '#f6f4ef', color: '#664400' }} />
              <div className="row">
                <input
                  name="user_label"
                  value={txForm.user_label}
                  readOnly
                  style={{ flex: 2, background: '#f6f4ef', color: '#5c4634', fontWeight: '500', letterSpacing: '0.03em' }}
                />
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Дүн (₮)"
                  value={txForm.amount}
                  onChange={(e) => setTxForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  style={{ width: '120px' }}
                />
              </div>
              <button type="submit" style={{ marginTop: 8 }}>Дүн нэмэх</button>
            </form>
          )}

          {regForm.uid && (
            <form id="formQuickReg" onSubmit={handleQuickRegister}>
              <input type="text" name="uid" value={regForm.uid} readOnly style={{ width: '100%', marginBottom: 8, background: '#f6f4ef', color: '#664400' }} />
              <div className="row">
                <input
                  name="name"
                  placeholder="Нэр"
                  value={regForm.name}
                  onChange={(e) => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{ flex: 1 }}
                />
                <input
                  name="nickname"
                  placeholder="Хоч"
                  value={regForm.nickname}
                  onChange={(e) => setRegForm(prev => ({ ...prev, nickname: e.target.value }))}
                />
                <input
                  name="profession"
                  placeholder="Мэргэжил"
                  value={regForm.profession}
                  onChange={(e) => setRegForm(prev => ({ ...prev, profession: e.target.value }))}
                />
              </div>
              <button type="submit">Бүртгээд холбох</button>
            </form>
          )}
          
          {!txForm.uid && !regForm.uid && (
            <form id="formQuickRegManual" onSubmit={handleQuickRegister}>
              <p className="muted" style={{ marginBottom: 8 }}>UID байхгүй бол автоматаар random UID үүснэ (NFC tag ID-тэй адил)</p>
              <div className="row">
                <input
                  name="name"
                  placeholder="Нэр *"
                  value={regForm.name}
                  onChange={(e) => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{ flex: 1 }}
                />
                <input
                  name="nickname"
                  placeholder="Хоч"
                  value={regForm.nickname}
                  onChange={(e) => setRegForm(prev => ({ ...prev, nickname: e.target.value }))}
                />
                <input
                  name="profession"
                  placeholder="Мэргэжил"
                  value={regForm.profession}
                  onChange={(e) => setRegForm(prev => ({ ...prev, profession: e.target.value }))}
                />
              </div>
              <button type="submit">Хэрэглэгч үүсгэх (UID автоматаар)</button>
            </form>
          )}

          {message && (
            <p className={messageOk ? "ok" : "err"}>{message}</p>
          )}
        </div>

        <div className="admin-card">
          <h3>Хэрэглэгчид</h3>
          <form onSubmit={(e) => { e.preventDefault(); loadDashboard(); }}>
            <div className="row">
              <input
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Нэр/хоч/UID/мэргэжил"
                style={{ flex: 1 }}
              />
              <button type="submit">Хайх</button>
            </div>
          </form>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Нэр</th>
                <th>Хоч</th>
                <th>UID</th>
                <th>Нийт</th>
                <th>Дүн нэмэх</th>
                <th>Тест Scan</th>
                <th>Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.nickname || ''}</td>
                    <td>{u.uid || '-'}</td>
                    <td>{u.total ? u.total.toLocaleString("en-US") : '0'} ₮</td>
                    <td>
                      <div className="row" style={{ margin: 0, gap: '4px' }}>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="Дүн"
                          value={userAmounts[u.id] || ''}
                          onChange={(e) => setUserAmounts(prev => ({ ...prev, [u.id]: e.target.value }))}
                          style={{ width: '80px', padding: '4px 6px', fontSize: '0.75rem' }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddAmount(u);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddAmount(u);
                          }}
                          disabled={!u.uid}
                          style={{ 
                            padding: '4px 8px', 
                            fontSize: '0.75rem',
                            opacity: (!u.uid) ? 0.6 : 1,
                            cursor: (!u.uid) ? 'not-allowed' : 'pointer',
                            pointerEvents: (!u.uid) ? 'none' : 'auto'
                          }}
                          title={!u.uid ? 'UID байхгүй' : 'Дүн нэмэх'}
                        >
                          {loadingUsers[u.id] ? '...' : '+'}
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleTestScan(u);
                        }}
                        disabled={!u.uid}
                        style={{ 
                          padding: '4px 8px', 
                          fontSize: '0.75rem',
                          opacity: (!u.uid) ? 0.6 : 1,
                          cursor: (!u.uid) ? 'not-allowed' : 'pointer',
                          pointerEvents: (!u.uid) ? 'none' : 'auto'
                        }}
                        title={!u.uid ? 'UID байхгүй' : 'UID-г уншуулж байгаа мэт тест хийх'}
                      >
                        {loadingUsers[u.id] ? '...' : '📱'}
                      </button>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8">Одоогоор хэрэглэгч алга.</td></tr>
              )}
            </tbody>
          </table>
          
          {message && (
            <div style={{ marginTop: '12px', padding: '8px', borderRadius: '4px', 
                         background: messageOk ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                         color: messageOk ? 'var(--color-forest-light)' : '#dc2626' }}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;

