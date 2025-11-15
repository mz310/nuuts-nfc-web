import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useScrollAnimation } from '../utils/useScrollAnimation';
import { getIndustryImage } from '../utils/industryImages';

function getClockLabel() {
  const d = new Date();
  return `Last update · ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes()
  ).padStart(2, '0')}`;
}

function getInitial(text) {
  if (!text) return '?';
  const trimmed = text.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

function DiamondIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M7.4 3h9.2l4.3 5.4-9 12.6-9-12.6L7.4 3z" />
    </svg>
  );
}

function TrophyIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M7 4v2h10V4h2a1 1 0 0 1 1 1v2a5 5 0 0 1-4 4.9A4 4 0 0 1 13 15v1h3v2H8v-2h3v-1a4 4 0 0 1-3.98-3.1A5 5 0 0 1 4 7V5a1 1 0 0 1 1-1h2Zm11 3V6h-1v1a3 3 0 0 0 2 2.83V7ZM6 7a3 3 0 0 0 2-2.83V6H7v1Z" />
    </svg>
  );
}

function HomePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(() => getClockLabel());

  const updateClock = useCallback(() => {
    const label = getClockLabel();
    setLastUpdate(label);
    const timerEl = document.getElementById('timer');
    if (timerEl && timerEl.textContent !== label) {
      timerEl.textContent = label;
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await api.getLeaderboard();
      setRows(Array.isArray(data.rows) ? data.rows : []);
      setLoading(false);
      updateClock();
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLoading(false);
      updateClock();
    }
  }, [updateClock]);

  useEffect(() => {
    updateClock();
    const clockInterval = setInterval(updateClock, 15000);

    loadLeaderboard();
    const leaderboardInterval = setInterval(loadLeaderboard, 5000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(leaderboardInterval);
    };
  }, [loadLeaderboard, updateClock]);

  const [heroRef, heroVisible] = useScrollAnimation({ threshold: 0.1 });
  const [podiumRef, podiumVisible] = useScrollAnimation({ threshold: 0.1 });
  const [tableRef, tableVisible] = useScrollAnimation({ threshold: 0.1 });

  const formatter = useMemo(() => new Intl.NumberFormat('en-US'), []);
  const topThree = useMemo(() => rows.slice(0, 3), [rows]);
  const others = useMemo(() => rows.slice(3), [rows]);
  const totalPlayers = rows.length;
  const isEmpty = !loading && totalPlayers === 0;

  const renderAvatar = (row, size = 'lg') => {
    const baseClass = `hp-avatar ${size}`;
    const avatarImg = row?.industry ? getIndustryImage(row.industry) : null;
    
    if (row && avatarImg) {
      return (
        <div className={baseClass}>
          <img
            src={avatarImg}
            alt={row.label ? `${row.label} avatar` : 'Player avatar'}
          />
        </div>
      );
    }

    const initial = getInitial(row?.label || row?.name);
    return (
      <div className={`${baseClass} fallback`}>
        <span>{initial}</span>
      </div>
    );
  };

  const podiumSlots = [
    { key: 'second', position: 2, row: topThree[1] },
    { key: 'first', position: 1, row: topThree[0] },
    { key: 'third', position: 3, row: topThree[2] },
  ];

  const makeHandle = (row) => {
    if (!row) return '@player';
    if (row.nickname) {
      return `@${row.nickname.replace(/\s+/g, '').toLowerCase()}`;
    }
    if (row.name) {
      return `@${row.name.replace(/\s+/g, '').toLowerCase()}`;
    }
    return `@player${row.id}`;
  };

  return (
    <div className="homepage">
      <section
        ref={heroRef}
        className={`hp-hero scroll-animated ${heroVisible ? 'visible' : ''}`}
      >
          <div className="hp-hero-content">
            <h1>Мазаалай баатрууд</h1>
            <p>
              Байгаль, зэрлэг амьтны төлөө тууштай зүтгэж буй хүмүүсийн амьд
              жагсаалт. Энэхүү систем нь{' '}
              <strong>Говийн эзэн Мазаалай</strong> болон Монголын байгалийг
              хамгаалах баатруудын бодит хувь нэмрийг тэмдэглэнэ.
            </p>
          </div>
          <div className="hp-hero-cta">
            <Link to="/about" className="hp-hero-button">
              Мазаалай тухай дэлгэрэнгүй
            </Link>
          </div>
        </section>

        <section
          ref={podiumRef}
          className={`hp-podium scroll-animated ${podiumVisible ? 'visible' : ''}`}
        >
          <div className="hp-podium-grid">
            {podiumSlots.map(({ key, position, row }) => {
              const Wrapper = row ? Link : 'div';
              const wrapperProps = row ? { to: `/u/${row.id}` } : {};
              const points = row ? formatter.format(row.total || 0) : '0';
              return (
                <Wrapper
                  key={key}
                  className={`hp-podium-card ${key} ${!row ? 'empty' : ''}`}
                  {...wrapperProps}
                >
                  <div className="hp-podium-head">
                    <div className={`hp-podium-trophy ${key}`}>
                      <TrophyIcon className="hp-trophy" />
                    </div>
                    <span className="hp-podium-rank">#{position}</span>
                  </div>
                  <div className="hp-podium-avatar">
                    {renderAvatar(row, key === 'first' ? 'xl' : 'lg')}
                  </div>
                  <div className="hp-podium-name">
                    {row?.label || 'Awaiting hero'}
                  </div>
                  <div className="hp-podium-profession">
                    {row?.profession || 'Мэргэжил бүртгэгдээгүй'}
                  </div>
                  <div className="hp-podium-points">
                    <DiamondIcon className="hp-diamond" />
                    <span>{points}</span>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </section>

        <div className="hp-info-banner">
          Энд бүртгэлтэй хүмүүс бол Говийн эзэн Мазаалай болон Монголын
          байгалийг хамгаалах бодит баатрууд.
        </div>

        <section
          ref={tableRef}
          className={`hp-table-section scroll-animated ${tableVisible ? 'visible' : ''}`}
        >
          <div className="hp-table-header">
            <div>
              <div className="hp-table-title">Global leaderboard</div>
              <div className="hp-table-sub">
                Хамгийн олон оноо цуглуулсан байгаль хамгаалагчид.
              </div>
            </div>
            <div className="hp-table-meta">
              <span className="hp-table-timer">{lastUpdate}</span>
              <span className="hp-table-count">Players: {totalPlayers}</span>
            </div>
          </div>

          <div className="hp-table">
            <div className="hp-table-row head">
              <div>Rank</div>
              <div>User name</div>
              <div>Мэргэжил</div>
              <div>Point</div>
            </div>

            {loading && (
              <>
                <div className="hp-table-row skeleton">
                  <div />
                  <div />
                  <div />
                  <div />
                </div>
                <div className="hp-table-row skeleton">
                  <div />
                  <div />
                  <div />
                  <div />
                </div>
              </>
            )}

            {!loading && isEmpty && (
              <div className="hp-table-empty">
                Эхний NFC гүйлгээг хийхэд leaderboard автоматаар гарч ирнэ.
              </div>
            )}

            {!loading &&
              !isEmpty &&
              others.map((row, idx) => {
                const rank = idx + 4;
                const handle = makeHandle(row);
                return (
                  <Link
                    key={row.id}
                    to={`/u/${row.id}`}
                    className="hp-table-row"
                  >
                    <div className="hp-table-rank">#{rank}</div>
                    <div className="hp-table-user">
                      {renderAvatar(row, 'xs')}
                      <div>
                        <div className="hp-table-name">{row.label}</div>
                        <div className="hp-table-handle">{handle}</div>
                      </div>
                    </div>
                    <div className="hp-table-profession">
                      {row.profession || '—'}
                    </div>
                    <div className="hp-table-points">
                      <DiamondIcon className="hp-diamond" />
                      <span>{formatter.format(row.total || 0)}</span>
                    </div>
                  </Link>
                );
              })}

            {!loading && !isEmpty && others.length === 0 && (
              <div className="hp-table-empty subtle">
                Одоогоор эхний 3 баатар л бүртгэлтэй байна.
              </div>
            )}
          </div>
        </section>
    </div>
  );
}

export default HomePage;
