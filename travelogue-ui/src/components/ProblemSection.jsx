const PAINS = [
  {
    icon: (
      // Apps / grid icon
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    title: "Planning spread across too many apps",
    desc:  "Google Docs, WhatsApp, Notes, Sheets — your trip lives nowhere.",
  },
  {
    icon: (
      // Single person / burnout icon
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
      </svg>
    ),
    title: "One person does everything",
    desc:  'The "designated planner" burns out and the group stays clueless.',
  },
  {
    icon: (
      // Chat bubble chaos icon
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <line x1="9" y1="10" x2="9" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="15" y1="10" x2="15" y2="10"/>
      </svg>
    ),
    title: "Group chat chaos",
    desc:  "500 messages and still no one agrees on the hotel. Decisions get lost.",
  },
  {
    icon: (
      // Wallet / budget confusion icon
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
        <circle cx="17" cy="15" r="1" fill="currentColor"/>
      </svg>
    ),
    title: "Budget confusion every time",
    desc:  "Nobody knows who paid what, how much they owe, or when to settle up.",
  },
];

const SOLUTIONS = [
  "All planning in one shared notebook",
  "Decisions made with group voting",
  "Budget split automatically, in real time",
  "Free to start. No credit card required.",
];

export default function ProblemSection() {
  return (
    <>
      <style>{`
        .problem { background: var(--sand-light); padding: 80px 5%; }
        .problem-inner {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: center;
        }
        .pain-list { display: flex; flex-direction: column; gap: 14px; margin-top: 30px; }
        .pain-item {
          display: flex; gap: 14px; align-items: flex-start;
          padding: 18px; background: white; border-radius: 16px;
          box-shadow: 0 2px 12px rgba(44,26,14,0.07);
        }
        .pain-icon {
          width: 42px; height: 42px; border-radius: 12px;
          background: var(--terracotta-pale); color: var(--terracotta);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .pain-text h4 { font-size: 0.9rem; font-weight: 700; color: var(--warm-dark); }
        .pain-text p  { font-size: 0.8rem; color: var(--text-light); margin-top: 2px; }

        .solution-card {
          background: linear-gradient(135deg, var(--terracotta) 0%, var(--terracotta-light) 100%);
          border-radius: 28px; padding: 44px; color: white;
          position: relative; overflow: hidden;
        }
        .solution-card::before {
          content: '✈'; position: absolute; font-size: 8rem;
          bottom: -20px; right: -20px; opacity: 0.08;
        }
        .solution-card h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem; margin-bottom: 16px; line-height: 1.2;
        }
        .solution-card p { font-size: 0.9rem; line-height: 1.7; opacity: 0.85; margin-bottom: 24px; }
        .solution-points { display: flex; flex-direction: column; gap: 10px; }
        .sol-point { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 500; }
        .sol-check {
          width: 22px; height: 22px; border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; flex-shrink: 0;
        }

        @media (max-width: 900px) {
          .problem-inner { grid-template-columns: 1fr; gap: 40px; }
        }
      `}</style>

      <section className="problem" id="problem">
        <div className="problem-inner">
          {/* Left — pain points */}
          <div>
            <div className="section-label">The Problem</div>
            <h2 className="section-title">Group travel planning is broken.</h2>
            <p className="section-sub" style={{ marginBottom: 0 }}>
              Sound familiar? The chaos is real — but it doesn't have to be.
            </p>
            <div className="pain-list reveal">
              {PAINS.map(p => (
                <div className="pain-item" key={p.title}>
                  <div className="pain-icon">{p.icon}</div>
                  <div className="pain-text">
                    <h4>{p.title}</h4>
                    <p>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — solution card */}
          <div className="reveal">
            <div className="solution-card">
              <h3>Enter Travelogue — one place for everything.</h3>
              <p>
                We built the tool we always wished existed: a single shared space where the whole group
                plans, decides, and travels together — with zero friction.
              </p>
              <div className="solution-points">
                {SOLUTIONS.map(s => (
                  <div className="sol-point" key={s}>
                    <div className="sol-check">✓</div>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}