import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── SVG Icons ────────────────────────────────────────────────────────
const Icons = {
  sparkle: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  ),
  plane: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13"/>
      <path d="M22 2L15 22l-4-9-9-4 22-7z"/>
    </svg>
  ),
  key: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5"/>
      <path d="M21 2l-9.6 9.6"/>
      <path d="M15.5 7.5l3 3L22 7l-3-3"/>
    </svg>
  ),
  sunrise: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 18a5 5 0 0 0-10 0"/>
      <line x1="12" y1="2" x2="12" y2="9"/>
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
      <line x1="1" y1="18" x2="3" y2="18"/>
      <line x1="21" y1="18" x2="23" y2="18"/>
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
      <line x1="23" y1="22" x2="1" y2="22"/>
      <polyline points="8 6 12 2 16 6"/>
    </svg>
  ),
  pin: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  ),
  ballot: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <line x1="9" y1="9" x2="15" y2="9"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="15" x2="12" y2="15"/>
    </svg>
  ),
};

export default function HeroSection({ onOpenModal }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .hero {
          min-height: 100vh; padding-top: 80px;
          position: relative; display: flex; align-items: center; overflow: hidden;
          background: linear-gradient(135deg, var(--sand-light) 0%, var(--sand) 50%, #EDE0C4 100%);
        }
        .hero-bg-shapes { position: absolute; inset: 0; pointer-events: none; }
        .hero-blob {
          position: absolute; border-radius: 50%;
          filter: blur(80px); opacity: 0.35;
        }
        .blob1 { width:500px;height:500px;background:var(--terracotta-pale);top:-100px;right:-100px; }
        .blob2 { width:400px;height:400px;background:var(--ocean-pale);bottom:-80px;left:10%; }
        .blob3 { width:300px;height:300px;background:var(--green-pale);top:30%;right:20%; }

        .hero-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 5%;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 60px; align-items: center; position: relative; z-index: 1;
        }

        /* ── Left copy ── */
        .hero-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: white; border: 1px solid var(--terracotta-pale);
          color: var(--terracotta);
          font-size: 0.8rem; font-weight: 600; padding: 6px 16px;
          border-radius: 50px; margin-bottom: 24px;
          letter-spacing: 0.5px;
          animation: fadeUp 0.6s ease both;
        }
        .hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.8rem, 5vw, 4.2rem);
          line-height: 1.1; color: var(--warm-dark); margin-bottom: 20px;
          animation: fadeUp 0.6s ease 0.1s both;
        }
        .hero h1 em { font-style: italic; color: var(--terracotta); }
        .hero-sub {
          font-size: 1.1rem; line-height: 1.7; color: var(--text-light);
          margin-bottom: 36px; max-width: 480px; font-weight: 300;
          animation: fadeUp 0.6s ease 0.2s both;
        }
        .hero-buttons {
          display: flex; gap: 14px; flex-wrap: wrap;
          animation: fadeUp 0.6s ease 0.3s both;
        }

        /* ── Card stack ── */
        .hero-visual { position: relative; animation: fadeUp 0.8s ease 0.2s both; }
        .hero-card-stack { position: relative; height: 480px; }
        .trip-card {
          position: absolute; background: white; border-radius: 24px;
          box-shadow: var(--shadow); padding: 20px; transition: transform 0.3s;
        }
        .trip-card:hover { transform: scale(1.02); }

        /* Main card */
        .main-card { width: 340px; top: 30px; left: 20px; z-index: 3; }
        .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .card-flag {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, var(--terracotta), var(--terracotta-light));
          display: flex; align-items: center; justify-content: center;
          color: white;
        }
        .card-title { font-weight: 700; font-size: 1rem; color: var(--warm-dark); }
        .card-sub { font-size: 0.78rem; color: var(--text-light); }
        .itin-item {
          display: flex; gap: 12px; align-items: flex-start;
          padding: 8px 0; border-bottom: 1px solid var(--sand);
        }
        .itin-item:last-child { border-bottom: none; }
        .itin-day { font-size: 0.7rem; font-weight: 700; color: var(--terracotta); min-width: 32px; padding-top: 2px; }
        .itin-name { font-size: 0.85rem; font-weight: 600; color: var(--warm-dark); }
        .itin-loc  { font-size: 0.75rem; color: var(--text-light); display: flex; align-items: center; gap: 3px; margin-top: 1px; }
        .itin-loc svg { flex-shrink: 0; color: var(--terracotta); opacity: 0.7; }
        .itin-tag  { font-size: 0.65rem; padding: 2px 8px; border-radius: 50px; font-weight: 600; white-space: nowrap; align-self: center; }
        .tag-food    { background: var(--terracotta-pale); color: var(--terracotta); }
        .tag-explore { background: var(--ocean-pale);      color: var(--ocean); }
        .tag-stay    { background: var(--green-pale);      color: var(--green); }
        .avatar-row  { display: flex; align-items: center; margin-top: 14px; }
        .av {
          width: 28px; height: 28px; border-radius: 50%; border: 2px solid white;
          margin-left: -8px; font-size: 0.75rem;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; color: white;
        }
        .av:first-child { margin-left: 0; }
        .av1{background:var(--terracotta);}
        .av2{background:var(--ocean);}
        .av3{background:var(--green);}
        .av4{background:#C8A03A;}
        .av-text { font-size: 0.75rem; color: var(--text-light); margin-left: 10px; }

        /* Budget card */
        .budget-card {
          width: 200px; top: 20px; right: 0; z-index: 2;
          background: linear-gradient(135deg, var(--ocean), var(--ocean-light));
          color: white;
        }
        .budget-card .card-label { font-size: 0.7rem; opacity: 0.8; font-weight: 500; margin-bottom: 4px; }
        .budget-total { font-size: 1.4rem; font-weight: 700; }
        .budget-sub   { font-size: 0.72rem; opacity: 0.75; margin-bottom: 12px; }
        .budget-bar-track { background: rgba(255,255,255,0.25); border-radius: 50px; height: 6px; margin-bottom: 4px; }
        .budget-bar-fill  { height: 100%; border-radius: 50px; background: white; }
        .budget-label-sm  { font-size: 0.68rem; opacity: 0.75; }

        /* Map card */
        .map-card { width: 220px; bottom: 30px; left: 0; z-index: 2; padding: 16px; }
        .map-preview {
          width: 100%; height: 100px; border-radius: 12px;
          background: linear-gradient(135deg, #D4E8D4, #C4DCF0);
          position: relative; overflow: hidden; margin-bottom: 10px;
        }
        .map-dot {
          position: absolute; width: 12px; height: 12px; border-radius: 50%;
          border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .map-dot1{background:var(--terracotta);top:30%;left:25%;}
        .map-dot2{background:var(--ocean);top:55%;left:60%;}
        .map-dot3{background:var(--green);top:20%;left:70%;}
        .map-card-text { font-size: 0.8rem; font-weight: 600; color: var(--warm-dark); }
        .map-card-sub  { font-size: 0.7rem; color: var(--text-light); }

        /* Vote card */
        .vote-card { width: 190px; bottom: 60px; right: 10px; z-index: 4; padding: 16px; }
        .vote-title {
          font-size: 0.8rem; font-weight: 700; color: var(--warm-dark);
          margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
        }
        .vote-title svg { color: var(--terracotta); flex-shrink: 0; }
        .vote-option { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; font-size: 0.75rem; color: var(--text); }
        .vote-bar-wrap { flex: 1; height: 6px; background: var(--sand); border-radius: 50px; }
        .vote-bar  { height: 100%; border-radius: 50px; }
        .vb1 { width: 65%; background: var(--terracotta); }
        .vb2 { width: 35%; background: var(--ocean); }
        .vote-pct { font-size: 0.68rem; font-weight: 700; color: var(--text-light); min-width: 28px; }

        /* Float animations */
        .float1{animation:float 4s ease-in-out infinite;}
        .float2{animation:float 4s ease-in-out 1s infinite;}
        .float3{animation:float 4s ease-in-out 2s infinite;}
        .float4{animation:float 4s ease-in-out 0.5s infinite;}

        @media (max-width: 900px) {
          .hero-inner { grid-template-columns: 1fr; }
          .hero-visual { display: none; }
        }
      `}</style>

      <section className="hero" id="home">
        <div className="hero-bg-shapes">
          <div className="hero-blob blob1" />
          <div className="hero-blob blob2" />
          <div className="hero-blob blob3" />
        </div>

        <div className="hero-inner">
          {/* ── Left copy ── */}
          <div className="hero-text">
            <div className="hero-pill">
              {Icons.sparkle}
              Free to start. No credit card required.
            </div>
            <h1>Plan <em>Together.</em><br />Travel Better.</h1>
            <p className="hero-sub">
              Travelogue is your group's shared digital travel notebook. One link, everyone in.
              Real-time planning, zero coordination chaos.
            </p>
            <div className="hero-buttons">
             <button
                className="btn-primary"
                onClick={() => user ? navigate("/dashboard?new=1") : onOpenModal?.("signup")}
                style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
              >
                {Icons.plane} Create Your First Trip
              </button>
              {!user && (
                <button className="btn-secondary" onClick={() => onOpenModal?.("login")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  {Icons.key} Log In to Your Account
                </button>
              )}
            </div>
          </div>

          {/* ── Card stack ── */}
          <div className="hero-visual">
            <div className="hero-card-stack">

              {/* Main itinerary card */}
              <div className="trip-card main-card float1">
                <div className="card-header">
                  <div className="card-flag">{Icons.sunrise}</div>
                  <div>
                    <div className="card-title">Morocco Road Trip</div>
                    <div className="card-sub">Mar 12 – Mar 22 · 5 members planning</div>
                  </div>
                </div>
                <div>
                  {[
                    { day:"Day 1", name:"Arrive Marrakech",   loc:"Jemaa el-Fnaa",    tag:"tag-explore", label:"Explore" },
                    { day:"Day 2", name:"Dinner at Nomad",    loc:"Medina Quarter",    tag:"tag-food",    label:"Food"    },
                    { day:"Day 3", name:"Riad La Sultana",    loc:"Ouarzazate",        tag:"tag-stay",    label:"Stay"    },
                  ].map(item => (
                    <div className="itin-item" key={item.day}>
                      <div className="itin-day">{item.day}</div>
                      <div style={{ flex: 1 }}>
                        <div className="itin-name">{item.name}</div>
                        <div className="itin-loc">
                          {Icons.pin}
                          {item.loc}
                        </div>
                      </div>
                      <span className={`itin-tag ${item.tag}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="avatar-row">
                  <div className="av av1">S</div>
                  <div className="av av2">M</div>
                  <div className="av av3">L</div>
                  <div className="av av4">R</div>
                  <span className="av-text">+1 editing now</span>
                </div>
              </div>

              {/* Budget card */}
              <div className="trip-card budget-card float2">
                <div className="card-label">GROUP BUDGET</div>
                <div className="budget-total">2,450 AED</div>
                <div className="budget-sub">of 4,000 AED total</div>
                <div className="budget-bar-track">
                  <div className="budget-bar-fill" style={{ width: "61%" }} />
                </div>
                <div className="budget-label-sm">61% used · 4 members</div>
              </div>

              {/* Map card */}
              <div className="trip-card map-card float3">
                <div className="map-preview">
                  <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
                    <polyline
                      points="38,56 90,85 150,30"
                      stroke="rgba(200,98,58,0.5)" strokeWidth="2" fill="none" strokeDasharray="4"
                    />
                  </svg>
                  <div className="map-dot map-dot1" />
                  <div className="map-dot map-dot2" />
                  <div className="map-dot map-dot3" />
                </div>
                <div className="map-card-text">3 Locations Pinned</div>
                <div className="map-card-sub">Interactive group map</div>
              </div>

              {/* Vote card */}
              <div className="trip-card vote-card float4">
                <div className="vote-title">
                  {Icons.ballot}
                  Where to eat Day 2?
                </div>
                {[
                  { label:"Nomad",     cls:"vb1", pct:"65%" },
                  { label:"Le Jardin", cls:"vb2", pct:"35%" },
                ].map(opt => (
                  <div className="vote-option" key={opt.label}>
                    <span style={{ fontSize:"0.72rem" }}>{opt.label}</span>
                    <div className="vote-bar-wrap">
                      <div className={`vote-bar ${opt.cls}`} />
                    </div>
                    <span className="vote-pct">{opt.pct}</span>
                  </div>
                ))}
                <div style={{ fontSize:"0.68rem", color:"var(--text-light)", marginTop:6 }}>
                  4 votes · closes in 2h
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}