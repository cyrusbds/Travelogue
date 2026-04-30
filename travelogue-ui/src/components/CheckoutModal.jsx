import { useState } from 'react';
import { apiStartTrial } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import './CheckoutModal.css';

function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function formatCard(v) {
  return v.replace(/\D/g,'').substring(0,16).replace(/(.{4})/g,'$1 ').trim();
}
function formatExpiry(v) {
  const d = v.replace(/\D/g,'');
  if (d.length >= 2) return d.substring(0,2) + ' / ' + d.substring(2,4);
  return d;
}

export default function CheckoutModal({ open, annual, onClose }) {
  const { loginUser } = useAuth();
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [card, setCard]     = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv]       = useState('');
  const [apiError, setApiError] = useState('');

  const price = annual ? '10.49' : '14.99';

  const handleSubmit = async e => {
    e.preventDefault();
    const form = e.target;
    const errs = {};
    if (!validateEmail(form.email.value))       errs.email  = 'Valid email required.';
    if (card.replace(/\s/g,'').length !== 16)   errs.card   = 'Please enter a 16-digit card number.';
    if (expiry.replace(/\D/g,'').length < 4)    errs.expiry = 'Enter MM/YY.';
    if (cvv.length < 3)                         errs.cvv    = 'Enter CVV.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setErrors({});
    setApiError('');
    setLoading(true);

    try {
      // Save trial to MongoDB
      const data = await apiStartTrial(annual);

      // Update the user in AuthContext + localStorage so the app knows immediately
      loginUser(localStorage.getItem('travelogue_token'), data.user);

      setStep(2);
    } catch (err) {
      setApiError(err.message || 'Failed to start trial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  function handleClose() {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setStep(1);
      setCard(''); setExpiry(''); setCvv('');
      setErrors({}); setApiError('');
    }, 300);
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="checkout-box">
        <button className="modal-close" onClick={handleClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {step === 1 ? (
          <>
            <div className="co-header">
              <div className="co-plan-badge">Premium Plan</div>
              <h2 className="co-title">Start your free trial</h2>
              <p className="co-sub">
                14 days free, then <strong>{price} AED/month</strong>.
                Cancel any time before trial ends — no charge.
              </p>
            </div>

            <div className="co-summary">
              <div className="co-summary-row"><span>Premium Plan</span><span>{price} AED/mo</span></div>
              <div className="co-summary-row co-summary-trial">
                <span>14-day free trial</span>
                <span style={{ color: 'var(--green)' }}>−{price} AED</span>
              </div>
              <div className="co-summary-divider" />
              <div className="co-summary-row co-summary-total"><span>Due today</span><span>0.00 AED</span></div>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="field-group">
                <label className="field-label">Email address</label>
                <div className="field-wrap">
                  <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
                  </svg>
                  <input
                    name="email"
                    type="email"
                    className={`field-input${errors.email ? ' error' : ''}`}
                    placeholder="you@email.com"
                  />
                </div>
                {errors.email && <div className="field-error">{errors.email}</div>}
              </div>

              <div className="field-group">
                <label className="field-label">Card number</label>
                <div className="field-wrap card-number-wrap">
                  <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>
                  </svg>
                  <input
                    type="text"
                    className={`field-input${errors.card ? ' error' : ''}`}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={card}
                    onChange={e => setCard(formatCard(e.target.value))}
                  />
                  <div className="card-brands">
                    <svg width="28" height="18" viewBox="0 0 38 24" fill="none"><rect width="38" height="24" rx="3" fill="#1A1F71"/><path d="M14.5 16.5h-3l1.88-9h3L14.5 16.5zm6.75-8.7c-.6-.23-1.53-.47-2.7-.47-2.98 0-5.07 1.47-5.08 3.58-.02 1.55 1.49 2.42 2.63 2.93 1.17.53 1.56.86 1.55 1.33-.01.72-.93 1.05-1.79 1.05-1.2 0-1.83-.16-2.81-.56l-.38-.17-.42 2.42c.7.3 1.99.56 3.33.57 3.15 0 5.19-1.45 5.22-3.69.01-1.23-.79-2.17-2.52-2.94-1.05-.5-1.69-.84-1.68-1.34 0-.45.54-.93 1.71-.93.98-.02 1.69.2 2.24.42l.27.12.41-2.33z" fill="white"/></svg>
                    <svg width="28" height="18" viewBox="0 0 38 24" fill="none"><circle cx="15" cy="12" r="8" fill="#EB001B"/><circle cx="23" cy="12" r="8" fill="#F79E1B"/><path d="M19 16.5c1.5-1.2 2.5-3 2.5-4.5S20.5 8.7 19 7.5C17.5 8.7 16.5 10.5 16.5 12s1 3.3 2.5 4.5z" fill="#FF5F00"/></svg>
                  </div>
                </div>
                {errors.card && <div className="field-error">{errors.card}</div>}
              </div>

              <div className="co-card-row">
                <div className="field-group">
                  <label className="field-label">Expiry</label>
                  <input
                    type="text"
                    className={`field-input${errors.expiry ? ' error' : ''}`}
                    placeholder="MM / YY"
                    maxLength={7}
                    value={expiry}
                    onChange={e => setExpiry(formatExpiry(e.target.value))}
                    style={{ paddingLeft: 14 }}
                  />
                  {errors.expiry && <div className="field-error">{errors.expiry}</div>}
                </div>
                <div className="field-group">
                  <label className="field-label">CVV</label>
                  <input
                    type="text"
                    className={`field-input${errors.cvv ? ' error' : ''}`}
                    placeholder="•••"
                    maxLength={4}
                    value={cvv}
                    onChange={e => setCvv(e.target.value.replace(/\D/g,''))}
                    style={{ paddingLeft: 14 }}
                  />
                  {errors.cvv && <div className="field-error">{errors.cvv}</div>}
                </div>
              </div>

              <div className="co-secure-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Secured by 256-bit SSL encryption. We never store card details.
              </div>

              {apiError && (
                <div className="field-error" style={{ textAlign: 'center', marginBottom: 4 }}>
                  {apiError}
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="spin">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    {' '}Processing…
                  </>
                ) : (
                  'Start Free Trial — 0.00 AED today'
                )}
              </button>

              <p className="co-cancel-note">
                Cancel before day 14 and you won't be charged. No cancellation fees.
              </p>
            </form>
          </>
        ) : (
          /* ── Success ── */
          <div style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--warm-dark)', marginBottom: 10 }}>
              Trial activated!
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: 1.7, marginBottom: 28 }}>
              You have 14 days of full Premium access. Your trial ends on{' '}
              <strong>
                {new Date(Date.now() + 14 * 864e5).toLocaleDateString('en-AE', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </strong>.
              We'll remind you 3 days before it ends.
            </div>
            <button className="auth-submit-btn" onClick={handleClose}>
              Start Planning
            </button>
          </div>
        )}
      </div>
    </div>
  );
}