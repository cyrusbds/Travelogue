import './AboutSection.css';

export default function AboutSection() {
  return (
    <section className="about" id="about">
      <div className="container">
        <div className="about-inner">

          {/* Left column */}
          <div>
            <div className="section-label">About Travelogue</div>
            <h2 className="section-title">Your trip, shared equally — start to finish.</h2>
            <p className="section-sub">
              Travelogue is a shared digital travel notebook where every member of your group
              has full, equal access. No more "ask the planner" — everyone sees everything,
              edits together, and owns the journey.
            </p>
            <div className="about-stats">
              <div className="stat-card">
                <div className="stat-num">Free</div>
                <div className="stat-desc">Plan to start with no card needed</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">∞</div>
                <div className="stat-desc">Members in premium</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">Live</div>
                <div className="stat-desc">Real-time collaboration</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">Link</div>
                <div className="stat-desc">Instant join via code</div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="about-features-list reveal">

            <div className="about-feat">
              <div className="about-icon">
                {/* Notebook / book icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <div className="about-feat-text">
                <h4>Shared Digital Notebook</h4>
                <p>One living document your whole group can see, edit, and build in real time.</p>
              </div>
            </div>

            <div className="about-feat">
              <div className="about-icon" style={{ background: "var(--ocean)" }}>
                {/* People / users icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="about-feat-text">
                <h4>Equal Access for Everyone</h4>
                <p>No admin gate-keeping. Every member can add, update, and contribute equally.</p>
              </div>
            </div>

            <div className="about-feat">
              <div className="about-icon" style={{ background: "var(--green)" }}>
                {/* Globe / world icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div className="about-feat-text">
                <h4>Built for Group Travel</h4>
                <p>Designed from day one for the messy, beautiful reality of planning with people.</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}