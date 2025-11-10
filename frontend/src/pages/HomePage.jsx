import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useScrollAnimation } from '../utils/useScrollAnimation';

function HomePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updateClock();
    const clockInterval = setInterval(updateClock, 15000);
    
    loadLeaderboard();
    const leaderboardInterval = setInterval(loadLeaderboard, 5000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(leaderboardInterval);
    };
  }, []);

  function updateClock() {
    const el = document.getElementById('timer');
    if (!el) return;
    const d = new Date();
    el.textContent = "Last update · "
      + String(d.getHours()).padStart(2, '0')
      + ":" + String(d.getMinutes()).padStart(2, '0');
  }

  async function loadLeaderboard() {
    try {
      const data = await api.getLeaderboard();
      setRows(data.rows || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLoading(false);
    }
  }

  // Use scroll animation for smooth reveal
  const [heroRef, heroVisible] = useScrollAnimation({ threshold: 0.01 });
  const [boardRef, boardVisible] = useScrollAnimation({ threshold: 0.01 });

  const heroSection = (
    <div ref={heroRef} className={`hero scroll-animated ${heroVisible ? 'visible' : ''}`}>
      <div className="hero-title">Мазаалай баатрууд</div>
      <div className="hero-sub">
        Байгаль, зэрлэг амьтны төлөө тууштай зүтгэж буй хүмүүсийн амьд жагсаалт
      </div>
      <div className="hero-sub mt-4 text-sm">
        Энэхүү систем нь <strong>Говийн эзэн Мазаалай</strong> болон Монголын байгалийг хамгаалах 
        бодит баатруудыг хүлээн зөвшөөрч, тэдний хувь нэмрийг тэмдэглэх зорилготой.
      </div>
      <div className="mt-6">
        <Link to="/about" className="btn">Мазаалай тухай дэлгэрэнгүй</Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        {heroSection}
        <div className="board">
          <div className="board-header">
            <div>
              <div className="board-title">Ranger уудийн жагсаалт</div>
              <div className="board-sub">Уншиж байна...</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!rows.length) {
    return (
      <>
        {heroSection}
        <div className="board">
          <div className="board-header">
            <div>
              <div className="board-title">Ranger уудийн жагсаалт</div>
              <div className="board-sub">Одоогоор гүйлгээ хийгдээгүй байна.</div>
            </div>
            <div className="chip">Waiting for first NFC tap</div>
          </div>
          <div className="table-wrap">
            <div className="empty">
              Эхний NFC гүйлгээг хийхэд leaderboard автоматаар гарч ирнэ.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {heroSection}
      <div ref={boardRef} className={`board scroll-animated ${boardVisible ? 'visible' : ''}`}>
        <div className="board-header">
          <div>
            <div className="board-title">LIVE SCOREBOARD</div>
            <div className="board-sub">
              Зөвхөн хэрэглэгчийн хоч (эсвэл нэр) + нийт хөнгөлөлтийн дүн.
            </div>
          </div>
          <div className="chip-total">
            <span>Players: {rows.length}</span>
          </div>
        </div>
        <div className="table-wrap">
          <div className="row head">
            <div>#</div>
            <div>Player</div>
            <div>Total (₮)</div>
          </div>
          {rows.map((r, idx) => {
            const rank = idx + 1;
            const label = r.label || `Player ${r.id}`;
            const total = r.total.toLocaleString("en-US");

            let rowClass = "row";
            if (rank === 1) {
              rowClass = "row gold";
            } else if (rank === 2) {
              rowClass = "row silver";
            } else if (rank === 3) {
              rowClass = "row bronze";
            } else if (rank === 4) {
              rowClass = "row r4";
            } else if (rank === 5) {
              rowClass = "row r5";
            }

            return (
              <Link key={r.id} to={`/u/${r.id}`} className={rowClass}>
                <div className="rank">#{rank}</div>
                <div className="name">{label}</div>
                <div className="amt">{total}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default HomePage;
