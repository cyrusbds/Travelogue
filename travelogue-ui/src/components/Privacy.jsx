import "./Privacy.css";

const badges = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        <circle cx="12" cy="16" r="1" fill="currentColor"/>
      </svg>
    ),
    title: "End-to-End Encryption",
    text: "All trip data is encrypted in transit and at rest. Your plans are visible only to people you share with.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
      </svg>
    ),
    title: "Zero Ads. Ever.",
    text: "We will never sell your travel data to advertisers or third parties. Your itinerary is not a product.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <rect x="5" y="6" width="14" height="15" rx="2"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
      </svg>
    ),
    title: "Right to Delete",
    text: "You own your data. Delete your trip and all associated data at any time, instantly and permanently.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    title: "GDPR Compliant",
    text: "Built to meet EU data protection standards. Available and compliant for users in 90+ countries.",
  },
];

export default function SecuritySection() {
  return (
    <section className="security" id="security">
      <div className="container">
        <div className="security-inner">

          {/* Left */}
          <div className="reveal">
            <div className="section-label">Privacy &amp; Security</div>
            <h2 className="section-title">
              Your trips stay<br /><em>yours.</em>
            </h2>
            <p className="section-sub">
              We take the privacy of your travel plans seriously. Travelogue is built on a
              foundation of security and transparency — no selling your data, no ads, no nonsense.
            </p>
            <div style={{ marginTop: 28 }}>
              <a href="#" className="btn-secondary" style={{ display: "inline-flex" }}>
                Read our Privacy Policy →
              </a>
            </div>
          </div>

          {/* Right */}
          <div className="security-badges reveal">
            {badges.map((b) => (
              <div className="sec-badge" key={b.title}>
                <div className="sec-badge-icon">{b.icon}</div>
                <div>
                  <div className="sec-badge-title">{b.title}</div>
                  <div className="sec-badge-text">{b.text}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}