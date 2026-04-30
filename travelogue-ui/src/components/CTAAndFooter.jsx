// ─── CTABanner ──────────────────────────────────────────────────────
export function CTABanner({ onOpenModal }) {
  return (
    <>
      <style>{`
        .cta-section {
          background: linear-gradient(135deg, var(--terracotta) 0%, #9E3E1E 100%);
          text-align: center; padding: 80px 5%; position: relative; overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .cta-section .cta-inner { position: relative; max-width: 700px; margin: 0 auto; }
        .cta-section h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem); color: white;
          margin-bottom: 14px; line-height: 1.2;
        }
        .cta-section h2 em { font-style: italic; }
        .cta-section p { font-size: 1.05rem; color: rgba(255,255,255,0.75); margin-bottom: 36px; font-weight: 300; }
        .btn-cta-white {
          background: white; color: var(--terracotta);
          padding: 18px 44px; border-radius: 50px;
          font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 700;
          border: none; cursor: pointer; text-decoration: none; display: inline-block;
          box-shadow: 0 8px 30px rgba(0,0,0,0.2); transition: all 0.25s;
        }
        .btn-cta-white:hover { transform: translateY(-3px); box-shadow: 0 14px 40px rgba(0,0,0,0.3); }
        .cta-trust-row {
          display: flex; align-items: center; justify-content: center;
          gap: 28px; flex-wrap: wrap; margin-top: 28px;
        }
        .cta-trust-item { display: flex; align-items: center; gap: 7px; font-size: 0.82rem; color: rgba(255,255,255,0.65); }
      `}</style>

      <section className="cta-section" id="cta">
        <div className="cta-inner">
          <h2>The best trips start<br /><em>before you leave.</em></h2>
          <p>Create your free account, start a notebook, and invite your group in seconds.</p>
          <button className="btn-cta-white" onClick={() => onOpenModal?.("signup")}>
            ✈ Create Your Free Account
          </button>
          <div className="cta-trust-row">
            {[
              { icon:" ", text:"No credit card needed" },
              { icon:" ", text:"Ready in under 60 seconds" },
              { icon:" ", text:"Invite your group instantly" },
              { icon:" ", text:"Used in 90+ countries" },
            ].map(item => (
              <div className="cta-trust-item" key={item.text}>
                <span>{item.icon}</span> {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}


// ─── Social icons ────────────────────────────────────────────────────
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const GmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.909 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
  </svg>
);

const SOCIALS = [
  { icon: <InstagramIcon />, href: "https://www.instagram.com/the_travelogue.official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==", label: "Instagram" },
  { icon: <FacebookIcon />, href: "#", label: "Facebook" },
  { icon: <XIcon />,        href: "#", label: "X / Twitter" },
  { icon: <GmailIcon />,    href: "#", label: "Gmail" },
];

// ─── Footer ─────────────────────────────────────────────────────────
const FOOTER_COLS = [
  { title: "Product",  links: ["About","Features","Live Demo","How It Works","Pricing","Changelog"] },
  { title: "Company",  links: ["Our Story","Blog","Careers","Press Kit","Partners","Contact"] },
  { title: "Support",  links: ["Help Center","Getting Started","API Docs","Community","Privacy Policy","Terms of Service"] },
];

export function Footer() {
  return (
    <>
      <style>{`
        .footer { background: var(--warm-dark); color: rgba(255,255,255,0.65); padding: 60px 5% 30px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-top {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px;
          padding-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 30px;
        }
        .footer-logo {
          font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700;
          color: var(--terracotta); display: block; margin-bottom: 12px; letter-spacing: -0.5px;
        }
        .footer-logo span { font-style: italic; color: var(--ocean); }
        .footer-brand p { font-size: 0.83rem; line-height: 1.7; max-width: 240px; }
        .social-row { display: flex; gap: 10px; margin-top: 20px; }
        .social-btn {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.55);
          cursor: pointer; transition: all 0.2s; text-decoration: none;
        }
        .social-btn:hover { background: var(--terracotta); color: white; transform: translateY(-2px); }
        .footer-col h4 { font-size: 0.8rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: white; margin-bottom: 16px; }
        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .footer-col ul li a { color: rgba(255,255,255,0.55); text-decoration: none; font-size: 0.85rem; transition: color 0.2s; }
        .footer-col ul li a:hover { color: var(--terracotta-light); }
        .footer-bottom { display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; flex-wrap: wrap; gap: 12px; }
        .footer-bottom-links { display: flex; gap: 20px; flex-wrap: wrap; }
        .footer-bottom-links a { color: rgba(255,255,255,0.4); text-decoration: none; font-size: 0.75rem; transition: color 0.2s; }
        .footer-bottom-links a:hover { color: rgba(255,255,255,0.7); }

        @media (max-width: 900px) { .footer-top { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .footer-top { grid-template-columns: 1fr; } }
      `}</style>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <span className="footer-logo">Travel<span>ogue</span></span>
              <p>A shared travel notebook for groups. No accounts. No chaos. Just your next adventure, planned together.</p>
              <div className="social-row">
                {SOCIALS.map(s => (
                  <a className="social-btn" href={s.href} key={s.label} aria-label={s.label}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
            {FOOTER_COLS.map(col => (
              <div className="footer-col" key={col.title}>
                <h4>{col.title}</h4>
                <ul>
                  {col.links.map(link => (
                    <li key={link}><a href="#">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="footer-bottom">
            <span>© 2026 Travelogue. Made with ❤ for travelers, by travelers. · Sharjah, UAE 🇦🇪</span>
            <div className="footer-bottom-links">
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}