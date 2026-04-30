const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    color: "terra", title: "Shared Travel Notebook",
    desc: "A living document your whole group edits together — notes, plans, ideas, all in one place.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/>
        <rect x="3" y="16" width="5" height="5"/>
        <path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/>
        <path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1a2 2 0 0 1 2 2v1"/>
      </svg>
    ),
    color: "ocean", title: "QR Code & Link Sharing",
    desc: "Create your trip and share a link or QR code. Members sign up in seconds and jump straight into planning.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
      </svg>
    ),
    color: "terra", title: "Live Collaborative Editing",
    desc: "See everyone's changes in real time as your group builds the itinerary together.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    color: "gold", title: "Trip Calendar & Itinerary",
    desc: "Plan day-by-day with a visual calendar. Add activities, transport, and timing for every stop.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
      </svg>
    ),
    color: "green", title: "Interactive Map",
    desc: "Pin every restaurant, hotel, and attraction on a shared interactive map your whole group can see.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 2 13.5 20.5 11 13 4 10.5 22 2"/><line x1="13.5" y1="13" x2="11" y2="13"/>
      </svg>
    ),
    color: "terra", title: "Group Voting System",
    desc: "Can't decide? Put it to a vote. Anonymous, fast, and the result locks directly into the itinerary.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
        <circle cx="17" cy="15" r="1" fill="currentColor"/>
      </svg>
    ),
    color: "ocean", title: "Live Budget Splitter",
    desc: "Track who paid what, split costs per member, and generate a clean final settlement summary.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
    color: "terra", title: "Notes & Shared Packing List",
    desc: "A shared checklist your group can tick off together — so nobody forgets sunscreen again.",
  },

];

export default function FeaturesGrid() {
  return (
    <>
      <style>{`
        .features { background: var(--white); padding: 80px 5%; }
        .features-header { text-align: center; margin-bottom: 60px; }
        .features-header .section-sub { margin: 0 auto; }
        .features-grid {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;
        }
        .feat-card {
          background: var(--white); border: 1.5px solid var(--sand);
          border-radius: 22px; padding: 28px;
          transition: all 0.3s; position: relative; overflow: hidden;
        }
        .feat-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, var(--sand-light), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .feat-card:hover {
          border-color: var(--terracotta-pale);
          box-shadow: var(--shadow); transform: translateY(-4px);
        }
        .feat-card:hover::before { opacity: 1; }
        .feat-icon {
          width: 50px; height: 50px; border-radius: 15px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px; position: relative;
        }
        .feat-icon-terra { background: var(--terracotta-pale); color: var(--terracotta); }
        .feat-icon-ocean { background: var(--ocean-pale);      color: var(--ocean); }
        .feat-icon-green { background: var(--green-pale);      color: var(--green); }
        .feat-icon-gold  { background: #F5EAC4;                color: #A07820; }
        .feat-card h3 { font-size: 1rem; font-weight: 700; color: var(--warm-dark); margin-bottom: 8px; position: relative; }
        .feat-card p  { font-size: 0.83rem; line-height: 1.6; color: var(--text-light); position: relative; }
      `}</style>

      <section className="features" id="features">
        <div className="features-header">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything your group needs in one notebook.</h2>
          <p className="section-sub">
            Built for how real friend groups actually travel — collaboratively, chaotically, beautifully.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map(f => (
            <div className="feat-card reveal" key={f.title}>
              <div className={`feat-icon feat-icon-${f.color}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}