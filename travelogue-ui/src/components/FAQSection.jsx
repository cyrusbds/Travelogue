import { useState } from "react";

const FAQS = [
  {
    q: "Do I need to create an account to start a trip?",
    a: "Creating an account is quick and free — no credit card needed. You'll be set up and planning your first trip in under a minute. An account keeps your trips saved, synced across devices, and lets you manage members and billing.",
  },
  {
    q: "How do friends join my trip notebook?",
    a: "Share the trip link or QR code. When a friend opens it, they'll be prompted to create a free account (takes 30 seconds), then land directly inside your shared notebook — no extra steps needed.",
  },
  {
    q: "Is there a limit on how many people can join a trip?",
    a: "The free plan supports up to 6 members. The Premium plan supports unlimited members — perfect for large family trips, group tours, or corporate offsites with dozens of attendees.",
  },
  {
    q: "Can I use Travelogue without internet once on my trip?",
    a: "No. Travelogue currently requires an internet connection and does not support offline downloads or offline itinerary access yet.",
  },
  {
    q: "How does the budget splitter work?",
    a: "Any member can log an expense and specify who paid and how it should be split. Travelogue automatically calculates balances in real time and generates a final settlement summary at the end of the trip — showing exactly who owes who, and how much.",
  },
  {
    q: "Is Travelogue suitable for travel agencies?",
    a: "Absolutely. Our Institutional plan offers a fully white-labeled platform with custom branding and domain, dedicated account management, API access, and SLA-backed enterprise support. Contact us for a tailored demo and pricing.",
  },
  {
    q: "What happens to my data after a trip ends?",
    a: "Your trip data stays in your account until you choose to delete it. You can archive completed trips for future reference or permanently delete them. We never sell or share your data with third parties.",
  },
  {
    q: "Can I run multiple trips at the same time?",
    a: "The free plan allows 1 active trip at a time. Premium users can run unlimited concurrent trips — useful for travel agents managing multiple client itineraries, or frequent travelers planning ahead.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState(null);

  const toggle = (i) => setOpen(open === i ? null : i);

  return (
    <>
      <style>{`
        .faq { background: var(--sand-light); padding: 80px 5%; }
        .faq-header { text-align: center; margin-bottom: 50px; }
        .faq-header .section-sub { margin: 0 auto; }
        .faq-grid {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        }
        .faq-item {
          background: white; border-radius: 18px;
          border: 1.5px solid var(--sand); overflow: hidden; transition: border-color 0.2s;
        }
        .faq-item:hover { border-color: var(--terracotta-pale); }
        .faq-item.open  { border-color: var(--terracotta-pale); }
        .faq-question {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px; cursor: pointer; gap: 12px;
        }
        .faq-question h4 { font-size: 0.9rem; font-weight: 700; color: var(--warm-dark); line-height: 1.4; }
        .faq-toggle {
          width: 28px; height: 28px; border-radius: 50%; background: var(--sand);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; color: var(--terracotta); flex-shrink: 0;
          font-weight: 700; transition: all 0.25s;
        }
        .faq-item.open .faq-toggle { background: var(--terracotta); color: white; transform: rotate(45deg); }
        .faq-answer {
          max-height: 0; overflow: hidden; transition: max-height 0.35s ease;
        }
        .faq-item.open .faq-answer { max-height: 240px; }
        .faq-answer-inner {
          padding: 0 24px 20px; font-size: 0.85rem; color: var(--text-light); line-height: 1.7;
          border-top: 1px solid var(--sand); padding-top: 16px;
        }

        @media (max-width: 768px) {
          .faq-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="faq" id="faq">
        <div className="faq-header">
          <div className="section-label">FAQ</div>
          <h2 className="section-title">Questions? We've got answers.</h2>
          <p className="section-sub">Everything you need to know before your first trip.</p>
        </div>

        <div className="faq-grid reveal">
          {FAQS.map((item, i) => (
            <div
              key={i}
              className={`faq-item${open === i ? " open" : ""}`}
            >
              <div className="faq-question" onClick={() => toggle(i)}>
                <h4>{item.q}</h4>
                <div className="faq-toggle">+</div>
              </div>
              <div className="faq-answer">
                <div className="faq-answer-inner">{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}