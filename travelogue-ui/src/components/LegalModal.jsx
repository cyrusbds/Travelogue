import './LegalModal.css';

const LEGAL = {
  privacy: {
    title: 'Privacy Policy', date: 'Last updated: 1 March 2026',
    body: (
      <>
        <div className="legal-highlight">Your privacy matters. Travelogue collects only what's needed, and never sells your data — ever.</div>
        <div className="legal-h2">1. Information We Collect</div>
        <p className="legal-p">When you create an account, we collect your name, email address, and a hashed password. When you create or join a trip, we store your group's itinerary, notes, expenses, votes, and any photos you upload.</p>
        <div className="legal-h2">2. How We Use Your Information</div>
        <ul className="legal-ul"><li>Authenticating your account securely</li><li>Displaying trip data to authorised group members</li><li>Sending transactional emails (invitations, password resets)</li><li>Improving features using anonymised, aggregated usage data</li></ul>
        <div className="legal-h2">3. Data Sharing</div>
        <p className="legal-p">We never sell, rent, or share your personal data with advertisers or third-party marketing platforms. We may share data with trusted service providers (e.g. cloud hosting, email delivery) strictly for the purpose of operating Travelogue, under confidentiality agreements.</p>
        <div className="legal-h2">4. Data Retention</div>
        <p className="legal-p">Your data is retained while your account is active. You can delete your account at any time from Account Settings — all data is permanently removed within 30 days.</p>
        <div className="legal-h2">5. Cookies</div>
        <p className="legal-p">We use essential session cookies and optional analytics cookies. We never use advertising cookies. See our Cookie Policy for details.</p>
        <div className="legal-h2">6. Your Rights (GDPR)</div>
        <p className="legal-p">EU/UK users have the right to access, correct, export, or delete their data. Contact <strong>privacy@travelogue.app</strong> for any requests.</p>
        <div className="legal-h2">7. Contact</div>
        <p className="legal-p">Questions? Email <strong>privacy@travelogue.app</strong> or write to: Travelogue FZ-LLC, Sharjah Media City, Sharjah, UAE.</p>
      </>
    )
  },
  terms: {
    title: 'Terms of Service', date: 'Last updated: 1 March 2026',
    body: (
      <>
        <div className="legal-highlight">By using Travelogue, you agree to these terms — written in plain English.</div>
        <div className="legal-h2">1. Who We Are</div>
        <p className="legal-p">Travelogue is operated by Travelogue FZ-LLC, registered in Sharjah Media City, UAE.</p>
        <div className="legal-h2">2. Your Account</div>
        <p className="legal-p">You must be at least 16 to create an account. You're responsible for keeping credentials secure and for all activity under your account.</p>
        <div className="legal-h2">3. Acceptable Use</div>
        <ul className="legal-ul"><li>Don't upload illegal or infringing content</li><li>Don't impersonate other users</li><li>Don't attempt to scrape or reverse-engineer the platform</li><li>Don't abuse the invitation or sharing system</li></ul>
        <div className="legal-h2">4. Your Content</div>
        <p className="legal-p">You own your content. By posting, you grant Travelogue a limited licence to store and display it to your trip's authorised members.</p>
        <div className="legal-h2">5. Paid Plans</div>
        <p className="legal-p">Premium subscriptions are billed monthly or annually. Cancel anytime; access continues until the billing period ends. Refunds are available within 14 days of first charge.</p>
        <div className="legal-h2">6. Limitation of Liability</div>
        <p className="legal-p">Travelogue is provided "as is". We're not responsible for user-generated content accuracy or travel decisions made using the platform.</p>
        <div className="legal-h2">7. Governing Law</div>
        <p className="legal-p">These terms are governed by UAE law. Disputes are resolved in the courts of Sharjah, UAE.</p>
      </>
    )
  },
  cookies: {
    title: 'Cookie Policy', date: 'Last updated: 1 March 2026',
    body: (
      <>
        <div className="legal-highlight">Minimal cookies. No advertising. No cross-site tracking.</div>
        <div className="legal-h2">Essential Cookies</div>
        <p className="legal-p">Required to keep you logged in and protect against CSRF attacks. Cannot be opted out of without logging out.</p>
        <div className="legal-h2">Preference Cookies</div>
        <p className="legal-p">Store UI settings (theme, language). Expire after 12 months.</p>
        <div className="legal-h2">Analytics Cookies</div>
        <p className="legal-p">Privacy-first analytics with no cross-site tracking, no fingerprinting, and anonymised IPs. Opt out anytime in Account → Privacy Settings.</p>
        <div className="legal-h2">What We Don't Use</div>
        <ul className="legal-ul"><li>Advertising or retargeting cookies</li><li>Social media tracking pixels</li><li>Device fingerprinting</li></ul>
      </>
    )
  },
  accessibility: {
    title: 'Accessibility Statement', date: 'Last updated: 1 March 2026',
    body: (
      <>
        <div className="legal-highlight">We're committed to making Travelogue accessible to everyone.</div>
        <div className="legal-h2">Our Commitment</div>
        <p className="legal-p">We aim to conform to WCAG 2.1 Level AA standards across all pages and features.</p>
        <div className="legal-h2">What We've Done</div>
        <ul className="legal-ul"><li>Semantic HTML with proper heading hierarchy</li><li>Full keyboard navigation support</li><li>Colour contrast ratios meeting WCAG AA</li><li>Descriptive alt text on all images and icons</li><li>Visible focus indicators throughout</li><li>Tagged PDF exports for screen readers</li></ul>
        <div className="legal-h2">Known Limitations</div>
        <p className="legal-p">The interactive map has limited screen reader support for pin labels. A list-based alternative is in progress, expected Q2 2026.</p>
        <div className="legal-h2">Feedback</div>
        <p className="legal-p">Contact us at <strong>accessibility@travelogue.app</strong> — we respond within 2 business days.</p>
      </>
    )
  }
};

export default function LegalModal({ open, page, onClose }) {
  const content = LEGAL[page];
  if (!open || !content) return null;
  return (
    <div className="legal-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="legal-box">
        <div className="legal-box-header">
          <div>
            <div className="legal-box-title">{content.title}</div>
            <div className="legal-box-date">{content.date}</div>
          </div>
          <button onClick={onClose} className="modal-close" style={{ position: 'static' }} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className="legal-box-body">{content.body}</div>
      </div>
    </div>
  );
}
