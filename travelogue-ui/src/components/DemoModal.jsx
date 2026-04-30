import { useState } from "react";
import "./DemoModal.css";

const SpinnerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="spin">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

const MailIcon = () => (
  <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
  </svg>
);

const UserIcon = () => (
  <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

const BuildingIcon = () => (
  <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
  </svg>
);

const UsersIcon = () => (
  <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="7" r="4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
    <circle cx="17" cy="7" r="3"/><path d="M21 20c0-2.8-1.8-5-4-5.5"/>
  </svg>
);

const USE_CASES = [
  "Travel Agency",
  "University / Student Group",
  "Corporate Travel",
  "Tour Operator",
  "Event / Wedding Planning",
  "Other",
];

const TEAM_SIZES = ["Just me", "2–10", "11–50", "51–200", "200+"];

export default function DemoModal({ open, onClose }) {
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [form, setForm]       = useState({
    name: "", email: "", org: "", useCase: "", teamSize: "", message: "",
  });

  function set(key, val) { setForm(p => ({ ...p, [key]: val })); }

  function validate() {
    const e = {};
    if (!form.name.trim())                          e.name    = "Name is required.";
    if (!/\S+@\S+\.\S+/.test(form.email))           e.email   = "Valid email required.";
    if (!form.org.trim())                           e.org     = "Organisation is required.";
    if (!form.useCase)                              e.useCase = "Please select a use case.";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(2); }, 1600);
  }

  function handleClose() {
    onClose();
    setTimeout(() => { setStep(1); setForm({ name:"", email:"", org:"", useCase:"", teamSize:"", message:"" }); setErrors({}); }, 300);
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="demo-box">

        <button className="modal-close" onClick={handleClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {step === 1 ? (
          <>
            {/* Left panel */}
            <div className="demo-panel-left">
              <div className="demo-brand">Travel<span>ogue</span></div>
              <div className="demo-tagline">Built for teams.<br />Trusted by institutions.</div>

              <div className="demo-perks">
                {[
                  { icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
                      </svg>
                    ), label: "White-labeled platform" },
                  { icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    ), label: "Setup in under 48 hours" },
                  { icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    ), label: "Unlimited members & trips" },
                  { icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                      </svg>
                    ), label: "Dedicated account manager" },
                ].map(p => (
                  <div key={p.label} className="demo-perk">
                    <div className="demo-perk-icon">{p.icon}</div>
                    <span>{p.label}</span>
                  </div>
                ))}
              </div>

              <div className="demo-quote">
                <div className="demo-quote-text">
                  "Travelogue handles all our student trip coordination. It replaced 3 different tools we were using."
                </div>
                <div className="demo-quote-author">
                  <div className="demo-quote-av">R</div>
                  <div>
                    <div className="demo-quote-name">Rania Hassan</div>
                    <div className="demo-quote-role">Program Director, AUS</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right form */}
            <div className="demo-panel-right">
              <h2 className="demo-title">Book a Demo</h2>
              <p className="demo-sub">Tell us a bit about your organisation and we'll reach out within 1 business day.</p>

              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <div className="name-row">
                  <div className="field-group">
                    <label className="field-label">Your name</label>
                    <div className="field-wrap">
                      <UserIcon />
                      <input type="text" className={`field-input${errors.name ? " error" : ""}`}
                        placeholder="Sara Al-Farsi"
                        value={form.name} onChange={e => set("name", e.target.value)} />
                    </div>
                    {errors.name && <div className="field-error">{errors.name}</div>}
                  </div>
                  <div className="field-group">
                    <label className="field-label">Work email</label>
                    <div className="field-wrap">
                      <MailIcon />
                      <input type="email" className={`field-input${errors.email ? " error" : ""}`}
                        placeholder="sara@org.com"
                        value={form.email} onChange={e => set("email", e.target.value)} />
                    </div>
                    {errors.email && <div className="field-error">{errors.email}</div>}
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Organisation</label>
                  <div className="field-wrap">
                    <BuildingIcon />
                    <input type="text" className={`field-input${errors.org ? " error" : ""}`}
                      placeholder="e.g. University of Sharjah"
                      value={form.org} onChange={e => set("org", e.target.value)} />
                  </div>
                  {errors.org && <div className="field-error">{errors.org}</div>}
                </div>

                <div className="name-row">
                  <div className="field-group">
                    <label className="field-label">Use case</label>
                    <div className="field-wrap select-wrap">
                      <select
                        className={`field-input field-select${errors.useCase ? " error" : ""}`}
                        value={form.useCase} onChange={e => set("useCase", e.target.value)}
                      >
                        <option value="">Select…</option>
                        {USE_CASES.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    {errors.useCase && <div className="field-error">{errors.useCase}</div>}
                  </div>
                  <div className="field-group">
                    <label className="field-label">Team size</label>
                    <div className="field-wrap select-wrap">
                      <select
                        className="field-input field-select"
                        value={form.teamSize} onChange={e => set("teamSize", e.target.value)}
                      >
                        <option value="">Select…</option>
                        {TEAM_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Anything you'd like us to know? <span className="field-optional">(optional)</span></label>
                  <textarea
                    className="field-input field-textarea"
                    placeholder="e.g. We manage 20+ trips per semester and need SSO support…"
                    rows={3}
                    value={form.message} onChange={e => set("message", e.target.value)}
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading
                    ? <span className="btn-loader"><SpinnerIcon /> Sending request…</span>
                    : <span className="btn-text">Request Demo</span>
                  }
                </button>

                <p className="co-cancel-note">We typically respond within 1 business day. No commitment required.</p>
              </form>
            </div>
          </>
        ) : (
          /* Success */
          <div className="demo-success">
            <div className="demo-success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
            <div className="demo-success-title">Request sent!</div>
            <div className="demo-success-sub">
              Thanks, <strong>{form.name.split(" ")[0]}</strong>. We'll reach out to <strong>{form.email}</strong> within 1 business day to schedule your demo.
            </div>
            <button className="auth-submit-btn" style={{ maxWidth: 220 }} onClick={handleClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}