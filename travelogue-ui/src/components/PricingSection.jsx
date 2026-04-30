import { useState } from "react";

const FREE_FEATURES    = ["Up to 6 members","1 active trip","Itinerary, map & calendar","QR code & link sharing"];
const FREE_MISSING     = ["Budget splitter","Group voting"];
const PREMIUM_FEATURES = ["Unlimited members","Unlimited active trips","All planning features","Live budget splitter","Anonymous group voting","Priority support"];
const INST_FEATURES    = ["Everything in Premium","White-labeled platform","Custom domain & branding","Dedicated account manager","API & webhook access","SLA & enterprise support"];

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

export default function PricingSection({ onOpenModal, onOpenDemo }) {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <style>{`
        .pricing { background: var(--white); padding: 80px 5%; }
        .pricing-header { text-align: center; margin-bottom: 60px; }

        /* Billing toggle */
        .billing-toggle-wrap { display: flex; align-items: center; gap: 12px; justify-content: center; margin-top: 24px; }
        .billing-lbl { font-size: 0.88rem; font-weight: 600; color: var(--text-light); transition: color 0.2s; }
        .billing-lbl.active { color: var(--terracotta); }
        .billing-btn {
          width: 48px; height: 26px; border-radius: 50px;
          background: var(--sand); border: none; cursor: pointer;
          position: relative; transition: background 0.25s;
        }
        .billing-btn.on { background: var(--terracotta); }
        .billing-knob {
          position: absolute; top: 3px; left: 3px; width: 20px; height: 20px;
          border-radius: 50%; background: white; box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          transition: transform 0.25s;
        }
        .billing-btn.on .billing-knob { transform: translateX(22px); }
        .save-pill {
          background: var(--green-pale); color: var(--green);
          font-size: 0.72rem; font-weight: 700; padding: 4px 10px; border-radius: 50px;
          opacity: 0.5; transition: opacity 0.25s;
        }
        .save-pill.active { opacity: 1; }

        /* Grid */
        .pricing-grid {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: start;
        }
        .pricing-card {
          background: white; border-radius: 24px; padding: 36px;
          border: 2px solid var(--sand); position: relative; transition: all 0.3s;
        }
        .pricing-card:hover { box-shadow: var(--shadow); transform: translateY(-4px); }
        .pricing-card.featured {
          border-color: var(--terracotta);
          background: linear-gradient(145deg, var(--warm-dark) 0%, #3D2210 100%);
          color: white; transform: scale(1.04);
        }
        .pricing-card.featured:hover { transform: scale(1.04) translateY(-4px); }

        .featured-badge {
          position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
          background: var(--terracotta); color: white;
          font-size: 0.7rem; font-weight: 700; letter-spacing: 1px;
          padding: 5px 14px; border-radius: 50px; text-transform: uppercase; white-space: nowrap;
        }
        .pricing-tier { font-size: 0.75rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--terracotta); margin-bottom: 10px; }
        .pricing-card.featured .pricing-tier { color: var(--terracotta-light); }
        .pricing-price { font-family: 'Playfair Display', serif; font-size: 2.4rem; font-weight: 700; color: var(--warm-dark); line-height: 1; margin-bottom: 4px; }
        .pricing-card.featured .pricing-price { color: white; }
        .pricing-period { font-size: 0.78rem; color: var(--text-light); margin-bottom: 24px; }
        .pricing-card.featured .pricing-period { color: rgba(255,255,255,0.55); }
        .pricing-desc { font-size: 0.83rem; color: var(--text-light); line-height: 1.6; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--sand); }
        .pricing-card.featured .pricing-desc { color: rgba(255,255,255,0.6); border-bottom-color: rgba(255,255,255,0.12); }

        .pricing-features { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
        .pricing-features li { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: var(--text); }
        .pricing-card.featured .pricing-features li { color: rgba(255,255,255,0.8); }
        .check-circle { width: 20px; height: 20px; border-radius: 50%; background: var(--green-pale); color: var(--green); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pricing-card.featured .check-circle { background: rgba(255,255,255,0.15); color: white; }
        .check-x { width: 20px; height: 20px; border-radius: 50%; background: #F5E4E4; color: #C44; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .feat-dim { opacity: 0.45; }

        .pricing-cta {
          width: 100%; padding: 14px; border-radius: 50px; border: 2px solid var(--sand);
          background: transparent; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 600;
          color: var(--warm-dark); cursor: pointer; transition: all 0.25s;
        }
        .pricing-cta:hover { border-color: var(--terracotta); color: var(--terracotta); }
        .pricing-cta.featured-cta {
          background: var(--terracotta); border-color: var(--terracotta); color: white;
          box-shadow: 0 4px 20px rgba(200,98,58,0.35);
        }
        .pricing-cta.featured-cta:hover { background: var(--terracotta-light); }
        .pricing-card-note { text-align: center; font-size: 0.73rem; color: var(--text-light); margin-top: 10px; }

        /* Guarantee */
        .pricing-guarantee {
          max-width: 1200px; margin: 32px auto 0;
          display: flex; align-items: center; gap: 16px;
          background: var(--green-pale); border: 1.5px solid rgba(92,122,94,0.25);
          border-radius: 18px; padding: 20px 24px;
        }
        .guarantee-icon { color: var(--green); flex-shrink: 0; }
        .guarantee-text { font-size: 0.84rem; color: var(--text); line-height: 1.6; }
        .pricing-note { text-align: center; margin-top: 24px; font-size: 0.8rem; color: var(--text-light); }
        .pricing-note a { color: var(--terracotta); text-decoration: none; font-weight: 600; }

        @media (max-width: 900px) {
          .pricing-grid { grid-template-columns: 1fr; }
          .pricing-card.featured { transform: none; }
          .pricing-card.featured:hover { transform: translateY(-4px); }
        }
      `}</style>

      <section className="pricing" id="pricing">
        <div className="pricing-header">
          <div className="section-label">Pricing</div>
          <h2 className="section-title">Simple, honest pricing.</h2>
          <p className="section-sub" style={{ margin: "0 auto" }}>
            Start for free. Upgrade when your group is ready for more.
          </p>

          {/* Billing toggle */}
          <div className="billing-toggle-wrap">
            <span className={`billing-lbl${!annual ? " active" : ""}`}>Monthly</span>
            <button
              className={`billing-btn${annual ? " on" : ""}`}
              onClick={() => setAnnual(v => !v)}
              aria-label="Toggle billing period"
            >
              <div className="billing-knob" />
            </button>
            <span className={`billing-lbl${annual ? " active" : ""}`}>Annual</span>
            <div className={`save-pill${annual ? " active" : ""}`}>Save 30%</div>
          </div>
        </div>

        <div className="pricing-grid reveal">

          {/* ── Free ── */}
          <div className="pricing-card">
            <div className="pricing-tier">Free</div>
            <div className="pricing-price">0 <span style={{ fontSize:"1rem", fontWeight:400 }}>AED</span></div>
            <div className="pricing-period">Forever free — no credit card</div>
            <p className="pricing-desc">For small friend groups wanting to try collaborative travel planning.</p>
            <ul className="pricing-features">
              {FREE_FEATURES.map(f => (
                <li key={f}><div className="check-circle"><CheckIcon /></div>{f}</li>
              ))}
              {FREE_MISSING.map(f => (
                <li key={f} className="feat-dim"><div className="check-x"><XIcon /></div>{f}</li>
              ))}
            </ul>
            <button className="pricing-cta" onClick={() => onOpenModal?.("signup")}>
              Get Started Free
            </button>
            <p className="pricing-card-note">No credit card required</p>
          </div>

          {/* ── Premium ── */}
          <div className="pricing-card featured">
            <div className="featured-badge">Most Popular</div>
            <div className="pricing-tier">Premium</div>
            <div className="pricing-price">
              {annual ? "10.49" : "14.99"} <span style={{ fontSize:"1rem", fontWeight:400 }}>AED</span>
            </div>
            <div className="pricing-period">
              {annual ? "per month, billed 125.88 AED annually" : "per month · cancel any time"}
            </div>
            <p className="pricing-desc">The full Travelogue experience — no limits on members, trips, or features.</p>
            <ul className="pricing-features">
              {PREMIUM_FEATURES.map((f, i) => (
                <li key={f}>
                  <div className="check-circle"><CheckIcon /></div>
                  {i < 2
                    ? <><strong>{f.split(" ")[0]}</strong> {f.split(" ").slice(1).join(" ")}</>
                    : f}
                </li>
              ))}
            </ul>
            {/* Opens CheckoutModal, passes current annual state */}
            <button className="pricing-cta featured-cta" onClick={() => onOpenModal?.("checkout", annual)}>
              Start Free 14-Day Trial
            </button>
            <p className="pricing-card-note" style={{ color:"rgba(255,255,255,0.45)" }}>No card charged until trial ends</p>
          </div>

          {/* ── Institutional ── */}
          <div className="pricing-card">
            <div className="pricing-tier">Institutional</div>
            <div className="pricing-price" style={{ fontSize:"1.8rem", lineHeight:1.2 }}>Custom</div>
            <div className="pricing-period">Tailored to your organisation</div>
            <p className="pricing-desc">For agencies, universities &amp; businesses needing a white-labeled group planning platform.</p>
            <ul className="pricing-features">
              {INST_FEATURES.map(f => (
                <li key={f}><div className="check-circle"><CheckIcon /></div>{f}</li>
              ))}
            </ul>
            <button className="pricing-cta" onClick={() => onOpenDemo?.()}>
              Book a Demo
            </button>
            <p className="pricing-card-note">Usually responds within 1 business day</p>
          </div>

        </div>

        {/* Guarantee */}
        <div className="pricing-guarantee reveal">
          <div className="guarantee-icon"><ShieldIcon /></div>
          <div className="guarantee-text">
            <strong>14-day money-back guarantee on Premium.</strong>{" "}
            If you're not happy for any reason, email us within 14 days of your first charge and we'll refund you fully — no questions asked.
          </div>
        </div>

        <p className="pricing-note">
          Need help choosing? <a href="#faq">Read the FAQ</a> or <a href="mailto:hello@travelogue.app">email us</a> — we respond within a few hours.
        </p>
      </section>
    </>
  );
}