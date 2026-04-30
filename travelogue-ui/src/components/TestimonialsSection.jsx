const TESTIMONIALS = [
  {
    text: "We used Travelogue for a 10-person trip to Portugal. Everyone could see the plan, vote on restaurants, and track spending. No WhatsApp arguments. I'm honestly shocked how smooth it was.",
    name: "Aisha Al-Farsi", role: "Dubai, UAE · Portugal trip", av: "A", color: "var(--terracotta)", featured: false,
  },
  {
    text: "As the person who always ends up planning everything, Travelogue was a lifesaver. I shared the link, and suddenly everyone was actually contributing. The budget splitter alone is worth it.",
    name: "Khalid Mansour", role: "Riyadh, Saudi Arabia · Southeast Asia", av: "K", color: "var(--ocean)", featured: true,
  },
  {
    text: "Our family of 12 used this for a reunion trip to Morocco. My parents scanned the QR code and they were in within 30 seconds. The offline PDF for my dad who doesn't have data abroad was perfect.",
    name: "Nour Hamdan", role: "Beirut, Lebanon · Morocco trip", av: "N", color: "var(--green)", featured: false,
  },
  {
    text: "We planned our company offsite through Travelogue. Having everything — from hotel confirmations to the team dinner vote — in one place made us look incredibly organised to the leadership team.",
    name: "Sara Chen", role: "Singapore · Team Offsite Organizer", av: "S", color: "#C8A03A", featured: false,
  },
  {
    text: "The mood board feature got my whole friend group excited before the trip even started. Seeing everyone's ideas in one place made the planning feel like part of the travel experience itself.",
    name: "Lena Volkova", role: "Moscow, Russia · Bali girls trip", av: "L", color: "#9B59B6", featured: false,
  },
  {
    text: "I'm a travel agent and I've started sending Travelogue notebooks to every group client. They love having one central link instead of 15 PDF attachments. It's transformed how I deliver itineraries.",
    name: "Rania El-Sayed", role: "Cairo, Egypt · Travel Agent", av: "R", color: "var(--terracotta)", featured: false,
  },
];

export default function TestimonialsSection() {
  return (
    <>
      <style>{`
        .testimonials { background: var(--sand); padding: 80px 5%; }
        .testimonials-header { text-align: center; margin-bottom: 56px; }
        .testimonials-header .section-sub { margin: 0 auto; }
        .testi-grid {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        }
        .testi-card {
          background: white; border-radius: 22px; padding: 28px;
          border: 1.5px solid rgba(200,98,58,0.08);
          box-shadow: 0 2px 16px rgba(44,26,14,0.06);
          transition: all 0.3s; position: relative;
        }
        .testi-card:hover { box-shadow: var(--shadow); transform: translateY(-3px); }
        .testi-card.featured {
          background: linear-gradient(145deg, var(--warm-dark), #3D2210);
          border-color: rgba(200,98,58,0.3);
        }
        .testi-stars { color: #F5C842; font-size: 0.78rem; letter-spacing: 2px; margin-bottom: 12px; }
        .testi-quote {
          font-size: 2.5rem; color: var(--terracotta-pale);
          font-family: 'Playfair Display', serif; line-height: 1; margin-bottom: 8px;
        }
        .testi-card.featured .testi-quote { color: rgba(200,98,58,0.4); }
        .testi-text {
          font-size: 0.88rem; line-height: 1.7; color: var(--text);
          margin-bottom: 20px; font-style: italic;
        }
        .testi-card.featured .testi-text { color: rgba(255,255,255,0.8); }
        .testi-author { display: flex; align-items: center; gap: 12px; }
        .testi-av {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; font-weight: 700; color: white; flex-shrink: 0;
        }
        .testi-name { font-size: 0.85rem; font-weight: 700; color: var(--warm-dark); }
        .testi-card.featured .testi-name { color: white; }
        .testi-role { font-size: 0.72rem; color: var(--text-light); }
        .testi-card.featured .testi-role { color: rgba(255,255,255,0.45); }

        @media (max-width: 900px) {
          .testi-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="testimonials" id="testimonials">
        <div className="testimonials-header">
          <div className="section-label">What Travelers Say</div>
          <h2 className="section-title">Loved by groups around the world.</h2>
          <p className="section-sub">Real feedback from real trips. No embellishment, just results.</p>
        </div>

        <div className="testi-grid">
          {TESTIMONIALS.map(t => (
            <div className={`testi-card reveal${t.featured ? " featured" : ""}`} key={t.name}>
              <div className="testi-stars">★★★★★</div>
              <div className="testi-quote">"</div>
              <p className="testi-text">{t.text}</p>
              <div className="testi-author">
                <div className="testi-av" style={{ background: t.color }}>{t.av}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}