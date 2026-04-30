import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiLogin, apiSignup } from "../api/auth";
import "./AuthModal.css";

// ── Password strength helper ──────────────────────────────────────────
function getStrength(pw) {
  let score = 0;
  const hasLen   = pw.length >= 8;
  const hasUpper = /[A-Z]/.test(pw);
  const hasNum   = /[0-9]/.test(pw);
  const hasSpec  = /[^A-Za-z0-9]/.test(pw);
  if (hasLen)   score++;
  if (hasUpper) score++;
  if (hasNum)   score++;
  if (hasSpec)  score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#d94f38", "#e8a838", "#4da6e8", "#3a9b6e"];
  const widths = ["0%", "25%", "50%", "75%", "100%"];
  return { score, label: labels[score], color: colors[score], width: widths[score], hasLen, hasUpper, hasNum };
}

// ── Shared icon components ────────────────────────────────────────────
const MailIcon = () => (
  <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
  </svg>
);
const LockIcon = () => (
  <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const SpinnerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="spin">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);
const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const PlaneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 22-7z"/>
  </svg>
);
const CelebrationIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.8 11.3 2 22l10.7-3.79"/>
    <path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2l-2.24 2.24"/>
    <path d="m20 6-6.5 6.5M4.93 4.93l.01.01M17.07 6.93l.01.01"/>
    <path d="m14.5 14.5 4 4"/>
  </svg>
);
const WaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-4 0v5"/>
    <path d="M14 10V4a2 2 0 0 0-4 0v2"/>
    <path d="M10 10.5V6a2 2 0 0 0-4 0v8"/>
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
);

// ── Login form ────────────────────────────────────────────────────────
function LoginForm({ onSuccess, onSwitch, onForgot }) {
  const { loginUser } = useAuth();
  const navigate      = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  function validate() {
    const e = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = "Please enter a valid email.";
    if (!password || password.length < 6)        e.password = "Password must be at least 6 characters.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      loginUser(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setErrors({ general: err.message || "Login failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="field-group">
        <label className="field-label">Email address</label>
        <div className="field-wrap">
          <MailIcon />
          <input
            type="email"
            className="field-input"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        {errors.email && <div className="field-error">{errors.email}</div>}
      </div>

      <div className="field-group">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <label className="field-label">Password</label>
          <button type="button" className="forgot-link" onClick={onForgot}
            style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            Forgot password?
          </button>
        </div>
        <div className="field-wrap">
          <LockIcon />
          <input
            type={showPw ? "text" : "password"}
            className="field-input"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
            {showPw ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {errors.password && <div className="field-error">{errors.password}</div>}
      </div>

      <label className="checkbox-label">
        <input type="checkbox" className="checkbox-input"
          checked={remember} onChange={e => setRemember(e.target.checked)} />
        <span>Remember me for 30 days</span>
      </label>

      {errors.general && (
        <div className="field-error" style={{ textAlign:"center", marginBottom: 4 }}>
          {errors.general}
        </div>
      )}

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading
          ? <span className="btn-loader"><SpinnerIcon /> Signing in…</span>
          : <span className="btn-text">Log In</span>
        }
      </button>

      <div className="auth-switch">
        Don't have an account?{" "}
        <a href="#" onClick={e => { e.preventDefault(); onSwitch("signup"); }}>Sign up free →</a>
      </div>
    </form>
  );
}

// ── Sign-up form ──────────────────────────────────────────────────────
function SignupForm({ onSuccess, onSwitch }) {
  const { loginUser } = useAuth();
  const navigate      = useNavigate();
  const [first, setFirst]       = useState("");
  const [last, setLast]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [agreed, setAgreed]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const strength = getStrength(password);

  function validate() {
    const e = {};
    if (!first.trim())                           e.first    = "First name is required.";
    if (!last.trim())                            e.last     = "Last name is required.";
    if (!email || !/\S+@\S+\.\S+/.test(email))  e.email    = "Please enter a valid email.";
    if (!password || password.length < 8)        e.password = "Password must be at least 8 characters.";
    if (!agreed)                                 e.terms    = "Please agree to the Terms of Service.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    setLoading(true);
    try {
      const data = await apiSignup(`${first.trim()} ${last.trim()}`, email, password);
      loginUser(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setErrors({ general: err.message || "Signup failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="name-row">
        <div className="field-group">
          <label className="field-label">First name</label>
          <input type="text" className="field-input no-icon" placeholder="Sara"
            value={first} onChange={e => setFirst(e.target.value)} autoComplete="given-name" />
          {errors.first && <div className="field-error">{errors.first}</div>}
        </div>
        <div className="field-group">
          <label className="field-label">Last name</label>
          <input type="text" className="field-input no-icon" placeholder="Al-Farsi"
            value={last} onChange={e => setLast(e.target.value)} autoComplete="family-name" />
          {errors.last && <div className="field-error">{errors.last}</div>}
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Email address</label>
        <div className="field-wrap">
          <MailIcon />
          <input type="email" className="field-input" placeholder="you@email.com"
            value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
        </div>
        {errors.email && <div className="field-error">{errors.email}</div>}
      </div>

      <div className="field-group">
        <label className="field-label">Password</label>
        <div className="field-wrap">
          <LockIcon />
          <input
            type={showPw ? "text" : "password"}
            className="field-input"
            placeholder="Min. 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
            {showPw ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        {password.length > 0 && (
          <>
            <div className="pw-strength-wrap">
              <div className="pw-strength-bar">
                <div className="pw-strength-fill" style={{ width: strength.width, background: strength.color }} />
              </div>
              <span className="pw-strength-label" style={{ color: strength.color }}>{strength.label}</span>
            </div>
            <div className="pw-requirements">
              <div className={`pw-req${strength.hasLen   ? " met" : ""}`}><span className="req-dot">●</span> At least 8 characters</div>
              <div className={`pw-req${strength.hasUpper ? " met" : ""}`}><span className="req-dot">●</span> One uppercase letter</div>
              <div className={`pw-req${strength.hasNum   ? " met" : ""}`}><span className="req-dot">●</span> One number</div>
            </div>
          </>
        )}
        {errors.password && <div className="field-error">{errors.password}</div>}
      </div>

      <label className="checkbox-label" style={{ alignItems:"flex-start", gap:9 }}>
        <input type="checkbox" className="checkbox-input" style={{ marginTop:3 }}
          checked={agreed} onChange={e => setAgreed(e.target.checked)} />
        <span>
          I agree to the{" "}
          <a href="#" className="inline-link" onClick={e => e.preventDefault()}>Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="inline-link" onClick={e => e.preventDefault()}>Privacy Policy</a>
        </span>
      </label>
      {errors.terms && <div className="field-error">{errors.terms}</div>}

      {errors.general && (
        <div className="field-error" style={{ textAlign:"center", marginBottom: 4 }}>
          {errors.general}
        </div>
      )}

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading
          ? <span className="btn-loader"><SpinnerIcon /> Creating account…</span>
          : <span className="btn-text">Create Free Account</span>
        }
      </button>

      <div className="auth-switch">
        Already have an account?{" "}
        <a href="#" onClick={e => { e.preventDefault(); onSwitch("login"); }}>Log in →</a>
      </div>
    </form>
  );
}

// ── Forgot-password panel ─────────────────────────────────────────────
function ForgotForm({ onBack }) {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email."); return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1200);
  }

  return (
    <div>
      <button className="back-btn" onClick={onBack}>← Back to login</button>
      <h3 className="forgot-title">Reset your password</h3>
      <p className="forgot-sub">Enter your email and we'll send you a reset link within a minute.</p>

      {sent ? (
        <div className="forgot-success">
          <div className="success-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m2 7 10 7 10-7"/>
              <path d="m8 14 2 2 4-4"/>
            </svg>
          </div>
          <div className="success-msg">Check your inbox! A reset link is on its way.</div>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label className="field-label">Email address</label>
            <div className="field-wrap">
              <MailIcon />
              <input type="email" className="field-input" placeholder="you@email.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            {error && <div className="field-error">{error}</div>}
          </div>
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading
              ? <span className="btn-loader"><SpinnerIcon /> Sending…</span>
              : <span className="btn-text">Send Reset Link</span>
            }
          </button>
        </form>
      )}
    </div>
  );
}

// ── Success state ─────────────────────────────────────────────────────
function SuccessState({ tab, onClose }) {
  return (
    <div className="auth-success-state">
      <div className="auth-success-emoji">
        <CelebrationIcon />
      </div>
      <div className="auth-success-title">
        {tab === "signup" ? "Account created!" : "Welcome back!"}
      </div>
      <div className="auth-success-sub">
        {tab === "signup"
          ? "Your account is ready. Let's start planning your first trip together."
          : "You're signed in. Your trips are waiting."}
      </div>
      <button className="auth-submit-btn" onClick={onClose} style={{ maxWidth:240 }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
          Start Planning <PlaneIcon />
        </span>
      </button>
    </div>
  );
}

// ── Main AuthModal ────────────────────────────────────────────────────
export default function AuthModal({ mode, onClose }) {
  const [tab, setTab]         = useState(mode);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setTab(mode);
    setSuccess(null);
  }, [mode]);

  if (!mode) return null;

  function handleSuccess(which) { setSuccess(which); }

  function handleOverlay(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-overlay" onClick={handleOverlay}>
      <div className="auth-box">

        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Left branding panel */}
        <div className="auth-panel-left">
          <div className="auth-brand">
            <div className="auth-logo">
              <img src="/src/assets/logo (1).png" alt="" style={{ height: 36, width: 36, borderRadius: 9, objectFit: "cover" }} />
              <span className="auth-logo-text">Travel<span>ogue</span></span>
            </div>
            <p className="auth-tagline">Plan together.<br />Travel better.</p>
          </div>
          <div className="auth-testimonial">
            <div className="auth-testi-text">
              "Travelogue made planning our 10-person Morocco trip genuinely fun. Everyone was involved from day one."
            </div>
            <div className="auth-testi-author">
              <div className="auth-testi-av">A</div>
              <div>
                <div className="auth-testi-name">Aisha Al-Farsi</div>
                <div className="auth-testi-role">Dubai, UAE</div>
              </div>
            </div>
          </div>
          <div className="auth-left-trust">
            <div className="auth-trust-item"><GlobeIcon /> 90+ countries</div>
            <div className="auth-trust-item"><UsersIcon /> 48,000+ travelers</div>
            <div className="auth-trust-item"><StarIcon /> 4.9 / 5 rating</div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-panel-right">
          {success ? (
            <SuccessState tab={success} onClose={onClose} />
          ) : tab === "forgot" ? (
            <ForgotForm onBack={() => setTab("login")} />
          ) : (
            <>
              <div className="auth-tabs">
                {["login", "signup"].map(t => (
                  <button
                    key={t}
                    className={`auth-tab${tab === t ? " active" : ""}`}
                    onClick={() => setTab(t)}
                  >
                    {t === "login" ? "Log In" : "Sign Up"}
                  </button>
                ))}
              </div>

              {tab === "login" ? (
                <LoginForm
                  onSuccess={handleSuccess}
                  onSwitch={setTab}
                  onForgot={() => setTab("forgot")}
                />
              ) : (
                <SignupForm
                  onSuccess={handleSuccess}
                  onSwitch={setTab}
                />
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}