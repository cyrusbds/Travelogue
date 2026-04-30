import "./HowItWorks.css";

export default function HowItWorks() {
  return (
    <section className="how" id="how">
      <div className="container">
        <div className="how-header">
          <div className="section-label">How It Works</div>
          <h2 className="section-title">Up and running in under a minute.</h2>
          <p className="section-sub" style={{ margin: "0 auto" }}>
            No setup. No accounts. No friction. Just open and start planning.
          </p>
        </div>

        <div className="steps reveal">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Your Notebook</h3>
            <p>Give your trip a name, set your dates, and your digital travel notebook is instantly ready. No sign-up required.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Share via Link or QR Code</h3>
            <p>Copy the link or display the QR code in your group chat. Your friends join instantly — no friction, no apps to download.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Build the Trip Together</h3>
            <p>Everyone edits, votes, and contributes in real time. Watch your shared itinerary come to life as a team.</p>
          </div>
        </div>
      </div>
    </section>
  );
}