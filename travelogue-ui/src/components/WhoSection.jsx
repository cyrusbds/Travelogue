import './WhoSection.css';

const USE_CASES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="4"/>
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
        <circle cx="17" cy="7" r="3"/>
        <path d="M21 20c0-2.8-1.8-5-4-5.5"/>
      </svg>
    ),
    title: "Friends & Squads",
    description: "End the group chat chaos. Everyone sees the plan, votes on activities, and knows who owes what — so you arrive as a team, not a headache.",
    tags: ["Weekend trips", "City breaks", "Festival travel"],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: "Family Travel",
    description: "Keep everyone — from grandparents to teenagers — looped in on the plan. Share the itinerary via QR code and let the whole family contribute ideas.",
    tags: ["Multi-gen trips", "School holidays", "Reunions"],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: "Weddings & Events",
    description: "Coordinate guests flying in from different cities. One shared notebook for airport logistics, hotel blocks, activities, and the big-day schedule.",
    tags: ["Destination weddings", "Bachelor/ette", "Honeymoons"],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
    title: "Corporate & Team Travel",
    description: "Organize team offsites, conference travel, or client trips without the back-and-forth emails. Centralize bookings, agendas, and expenses in one place.",
    tags: ["Team offsites", "Conferences", "Incentive trips"],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
    title: "Student & University Groups",
    description: "Perfect for study trips, graduation travel, and university expeditions. Budget tracking is essential when everyone's watching their spend.",
    tags: ["Study abroad", "Grad trips", "Society travel"],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: "Travel Agencies",
    description: "Deliver a premium client experience. Use Travelogue's Institutional plan to provide white-labeled group itineraries under your own brand.",
    tags: ["Group tours", "White-label", "Client portals"],
  },
];

function UCCard({ icon, title, description, tags }) {
  return (
    <div className="uc-card reveal">
      <span className="uc-emoji">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="uc-tag-list">
        {tags.map((tag) => (
          <span key={tag} className="uc-tag">{tag}</span>
        ))}
      </div>
    </div>
  );
}

export default function UseCases() {
  return (
    <section className="use-cases" id="usecases">
      <div className="container">
        <div className="use-cases-header">
          <div className="section-label">Who It's For</div>
          <h2 className="section-title">Built for every kind of group trip.</h2>
          <p className="section-sub">
            Whether you're planning a weekend getaway or a month-long adventure,
            Travelogue fits your crew.
          </p>
        </div>

        <div className="use-cases-grid">
          {USE_CASES.map((uc) => (
            <UCCard key={uc.title} {...uc} />
          ))}
        </div>
      </div>
    </section>
  );
}