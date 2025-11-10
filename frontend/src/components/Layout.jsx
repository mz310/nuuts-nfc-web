import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../contexts/useTheme';

function Layout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="wrap">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-[980px] mx-auto px-5 py-3 flex justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 text-inherit no-underline transition-transform duration-[250ms] hover:translate-x-0.5">
          <img
            src="https://scontent-nrt1-1.xx.fbcdn.net/v/t39.30808-6/275130473_1299560400455995_8693570699170206627_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=va6tg0kTL04Q7kNvwEffGxP&_nc_oc=AdloglaDXdNDZ8RzWHcZ010T_1gFedw0UJsp0KvM6QgKdJSebG8ka6D2owRydZ5a-PNlDrUMDwmmjV8DBrxCm0eJ&_nc_zt=23&_nc_ht=scontent-nrt1-1.xx&_nc_gid=DRvdxGFvSSGFsvzhhOio6g&oh=00_Afim9YAIhWMa3ytpxEDqaMIfYV07-2tDBpz4gMCZ6Wl8ag&oe=69153B7F"
            alt="Mazaalai logo"
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 dark:border-amber-400 shadow-[0_0_18px_rgba(255,240,1,0.16)] bg-slate-950 dark:bg-slate-950 transition-all duration-[250ms]"
          />
          <div>
              <div className="text-[11px] tracking-[0.18em] uppercase text-amber-500 dark:text-amber-400">MAZAALAI GUARDIANS</div>
              <div className="text-lg font-bold tracking-[0.06em] text-slate-900 dark:text-slate-100">Leaderboard</div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-snug">
              Байгаль, зэрлэг амьтны төлөө тууштай зүтгэж буй хүмүүсийн амьд жагсаалт<span className="pulse-dot"></span>
            </div>
          </div>
        </Link>
          <div className="flex flex-col items-end gap-1">
            <div className="text-[10px] text-slate-600 dark:text-slate-400" id="timer">Last update · --:--</div>
            <div className="flex items-center">
              <nav className="flex gap-2 items-center text-[9px]" role="navigation">
                <Link to="/" className="text-slate-600 dark:text-slate-400 no-underline py-1 px-2 rounded-full border border-transparent transition-all duration-[250ms] hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/20 dark:hover:border-amber-400/20 hover:bg-white dark:hover:bg-slate-900">Leaderboard</Link>
                <Link to="/about" className="text-slate-600 dark:text-slate-400 no-underline py-1 px-2 rounded-full border border-transparent transition-all duration-[250ms] hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/20 dark:hover:border-amber-400/20 hover:bg-white dark:hover:bg-slate-900">About Mazaalai</Link>
            </nav>
              <button 
                className="ml-2 bg-transparent border border-slate-300 dark:border-slate-700 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-slate-600 dark:text-slate-400 transition-all duration-[250ms] hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/20 dark:hover:border-amber-400/20 hover:bg-white dark:hover:bg-slate-900" 
                onClick={toggleTheme} 
                aria-label="Toggle theme"
              >
              {theme === 'dark' ? (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              ) : (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20">
      <Outlet />
      </div>

      <footer className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2.5 justify-between items-start text-[9px] text-slate-600 dark:text-slate-400">
        <div className="flex flex-col gap-0.5">
          <div>© {new Date().getFullYear()} Mazaalai Guardians</div>
          <div>Энд бүртгэлтэй хүмүүс бол Говийн эзэн Мазаалай болон Монголын байгалийг хамгаалах бодит баатрууд.</div>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <div>
            <svg className="w-[13px] h-[13px] inline-block align-[-2px] mr-1 fill-amber-500 dark:fill-amber-400" viewBox="0 0 24 24">
              <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2C5.57 4 4 5.57 4 7.5v9C4 18.99 5.01 20 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5v-9C20 5.57 18.43 4 16.5 4h-9zM17 7.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 .001 6.001A3 3 0 0 0 12 9z"/>
            </svg>
            Instagram:
            <a href="https://www.instagram.com/nyytsxaalga/" target="_blank" rel="noopener" className="text-amber-500 dark:text-amber-400 no-underline hover:underline">
              @nyytsxaalga
            </a>
          </div>
          <div>
            <svg className="w-[13px] h-[13px] inline-block align-[-2px] mr-1 fill-amber-500 dark:fill-amber-400" viewBox="0 0 24 24">
              <path d="M12 2a7 7 0 0 1 7 7c0 4.05-3.64 8.38-6.02 10.64a1.3 1.3 0 0 1-1.96 0C8.64 17.38 5 13.05 5 9a7 7 0 0 1 7-7zm0 2a5 5 0 0 0-5 5c0 2.91 2.37 6.29 5 8.97 2.63-2.68 5-6.06 5-8.97a5 5 0 0 0-5-5zm0 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
            </svg>
            "Mazaalai Hub" — хамгаалалтын бүсийн хамтын шүтээн
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
