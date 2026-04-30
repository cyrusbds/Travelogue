import './Comparison.css';

const FEATURES = [
  {
    category: "Core Planning",
    rows: [
      { label: "Group itinerary planning", travelogue: "yes", gdocs: "partial:Manual", whatsapp: "no" },
      { label: "Account required to join", travelogue: "yes", gdocs: "yes", whatsapp: "yes" },
      { label: "Real-time collaboration", travelogue: "yes", gdocs: "yes", whatsapp: "no"},
      { label: "QR code sharing", travelogue: "yes", gdocs: "no", whatsapp: "no"},
    ],
  },
  {
    category: "Group-Specific Features",
    rows: [
      { label: "Group voting system", travelogue: "yes", gdocs: "no", whatsapp: "no"},
      { label: "Budget splitter & settlement", travelogue: "yes", gdocs: "no", whatsapp: "no"},
      { label: "Shared packing list", travelogue: "yes", gdocs: "partial:Manual", whatsapp: "no"},
    ],
  },
  {
    category: "Logistics",
    rows: [
      { label: "Interactive group map", travelogue: "yes", gdocs: "no", whatsapp: "no"},
    ],
  },
];

function Cell({ value }) {
  if (value === "yes") return <span className="comp-yes">✓</span>;
  if (value === "no") return <span className="comp-no">✗</span>;
  if (value?.startsWith("partial:")) return <span className="comp-partial">{value.slice(8)}</span>;
  return null;
}

export default function ComparisonTable() {
  return (
    <section className="comparison" id="comparison">
      <div className="container">
        <div className="comparison-header">
          <div className="section-label">How We Compare</div>
          <h2 className="section-title">Why Travelogue beats the alternatives.</h2>
          <p className="section-sub">
            Other tools were built for solo travelers or corporate enterprise.
            Travelogue was built for groups, from the start.
          </p>
        </div>

        <div className="comp-table-wrap reveal">
          <table className="comp-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Feature</th>
                <th>Travelogue</th>
                <th>Google Docs</th>
                <th>WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map(({ category, rows }) => (
                <>
                  <tr key={category} className="comp-category">
                    <td colSpan={5}>{category}</td>
                  </tr>
                  {rows.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td><Cell value={row.travelogue} /></td>
                      <td><Cell value={row.gdocs} /></td>
                      <td><Cell value={row.whatsapp} /></td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}