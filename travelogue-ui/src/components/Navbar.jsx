import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { label: "About",        href: "#about" },
  { label: "Features",     href: "#features" },
  { label: "Notebook",     href: "#notebook" },
  { label: "How It Works", href: "#how" },
  { label: "Pricing",      href: "#pricing" },
];

export default function Navbar({ onOpenModal }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
  }

  return (
    <>
      <style>{`
        .tl-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 18px 5%;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,254,249,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(200,98,58,0.1);
          font-family: 'DM Sans', sans-serif;
          transition: box-shadow 0.3s;
        }
        .tl-nav.scrolled { box-shadow: 0 4px 24px rgba(44,26,14,0.08); }

        .tl-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem; font-weight: 700;
          color: var(--terracotta); letter-spacing: -0.5px; text-decoration: none;
          display: flex; align-items: center; gap: 8px;
        }
        .tl-logo-text { font-family: 'Playfair Display', serif; line-height: 1; }
        .tl-logo-text span { font-style: italic; color: var(--ocean); }

        .tl-nav-links { display: flex; gap: 32px; list-style: none; }
        .tl-nav-links a {
          text-decoration: none; color: var(--text-light);
          font-size: 0.9rem; font-weight: 500; transition: color 0.2s;
        }
        .tl-nav-links a:hover { color: var(--terracotta); }

        .tl-nav-actions { display: flex; align-items: center; gap: 8px; }

        .tl-nav-login {
          color: var(--text-light); font-weight: 500;
          padding: 10px 18px; border-radius: 50px;
          border: 1.5px solid var(--sand); background: transparent;
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
          cursor: pointer; transition: all 0.2s;
        }
        .tl-nav-login:hover {
          border-color: var(--terracotta-pale);
          color: var(--terracotta); background: var(--sand-light);
        }
        .tl-nav-cta {
          background: var(--terracotta); color: white;
          padding: 10px 22px; border-radius: 50px; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 600;
          cursor: pointer; transition: background 0.2s, transform 0.2s;
        }
        .tl-nav-cta:hover { background: var(--terracotta-light); transform: translateY(-1px); }

        .tl-nav-user { display: flex; align-items: center; gap: 10px; }
        .tl-nav-greeting { font-size: 0.9rem; font-weight: 500; color: var(--text-light); }
        .tl-nav-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: var(--terracotta); color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem; font-weight: 700;
          font-family: 'DM Sans', sans-serif;
        }

        .tl-hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 4px;
        }
        .tl-hamburger span {
          display: block; width: 22px; height: 1.5px;
          background: var(--warm-dark); border-radius: 2px;
          transition: transform 0.25s, opacity 0.2s; transform-origin: center;
        }
        .tl-hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .tl-hamburger.open span:nth-child(2) { opacity: 0; }
        .tl-hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        .tl-drawer {
          display: none; position: fixed;
          top: 65px; left: 0; right: 0;
          background: rgba(255,254,249,0.97);
          backdrop-filter: blur(12px);
          border-top: 1px solid rgba(200,98,58,0.1);
          padding: 1rem 5% 1.5rem; z-index: 99;
          box-shadow: 0 8px 32px rgba(44,26,14,0.08);
        }
        .tl-drawer.open { display: block; }
        .tl-drawer a {
          display: block; padding: 12px 0; font-size: 1rem;
          color: var(--text); text-decoration: none;
          border-bottom: 1px solid var(--sand);
          font-family: 'DM Sans', sans-serif;
        }
        .tl-drawer-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 1rem; }
        .tl-drawer-actions button { width: 100%; text-align: center; padding: 13px; font-size: 0.95rem; }
        .tl-drawer-user {
          padding: 12px 0; border-bottom: 1px solid var(--sand);
          font-family: 'DM Sans', sans-serif; font-size: 0.95rem;
          color: var(--text-light); display: flex; align-items: center; gap: 10px;
        }

        @media (max-width: 768px) {
          .tl-nav-links, .tl-nav-actions { display: none; }
          .tl-hamburger { display: flex; }
        }
      `}</style>

      <nav className={`tl-nav${scrolled ? " scrolled" : ""}`}>
        <a href="/" className="tl-logo">
          <img src="/src/assets/logo (1).png" alt="" style={{ height: 42, width: 42, borderRadius: 10, objectFit: "cover" }} />
          <span className="tl-logo-text">Travel<span>ogue</span></span>
        </a>

        <ul className="tl-nav-links">
          {NAV_LINKS.map(l => (
            <li key={l.label}><a href={l.href}>{l.label}</a></li>
          ))}
        </ul>

        <div className="tl-nav-actions">
          {user ? (
            <div className="tl-nav-user">
              <div className="tl-nav-avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="tl-nav-greeting">
                Hi, {user.name?.split(" ")[0]}
              </span>
              <button className="tl-nav-login" onClick={() => navigate("/dashboard")}>
                My Trips
              </button>
              <button className="tl-nav-login" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          ) : (
            <>
              <button className="tl-nav-login" onClick={() => onOpenModal?.("login")}>Log In</button>
              <button className="tl-nav-cta"   onClick={() => onOpenModal?.("signup")}>Sign Up Free</button>
            </>
          )}
        </div>

        <button
          className={`tl-hamburger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      <div className={`tl-drawer${menuOpen ? " open" : ""}`}>
        {NAV_LINKS.map(l => (
          <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
        ))}

        <div className="tl-drawer-actions">
          {user ? (
            <>
              <div className="tl-drawer-user">
                <div className="tl-nav-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span>Hi, {user.name?.split(" ")[0]} 👋</span>
              </div>
              <button className="tl-nav-login" onClick={() => { setMenuOpen(false); navigate("/dashboard"); }}>
                My Trips
              </button>
              <button className="tl-nav-login" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <button className="tl-nav-login" onClick={() => { setMenuOpen(false); onOpenModal?.("login"); }}>
                Log In
              </button>
              <button className="tl-nav-cta" onClick={() => { setMenuOpen(false); onOpenModal?.("signup"); }}>
                Sign Up Free
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ height: 65 }} />
    </>
  );
}