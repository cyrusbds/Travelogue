import { useState } from "react";
import "./Notebookpreview.css";

// ─── SVG Icon Library ─────────────────────────────────────────────────
const Icon = {
  plane:     (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 22-7z"/></svg>,
  share:     (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  calendar:  (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  map:       (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  vote:      (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>,
  wallet:    (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/><circle cx="17" cy="13" r="1.5" fill="currentColor"/></svg>,
  check:     (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  notes:     (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  hotel:     (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  link:      (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  itinerary: (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="13" y2="18"/></svg>,
  sun:       (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  car:       (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
  camel:     (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v4M6 6c0 2 2 3 4 3s4-1 4-3M18 10v2M14 9v4a2 2 0 0 0 4 0v-1"/><path d="M6 6v12M10 6v3M14 13l-2 5M18 12l-2 5"/></svg>,
  thumb:     (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
  settlement:(s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  whatsapp:  (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  mail:      (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>,
  copy:      (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  food:      (s=11) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  transport: (s=11) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 22-7z"/></svg>,
  stay:      (s=11) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
  explore:   (s=11) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
};

// ─── Nav config ───────────────────────────────────────────────────────
const navGroups = [
  { label: "Planning",  items: ["itinerary", "calendar", "map"] },
  { label: "Group",     items: ["voting", "budget", "packing", "notes"] },
  { label: "Logistics", items: ["bookings", "share"] },
];

const panels = {
  itinerary: { iconKey:"itinerary", label:"Itinerary", title:"Trip Itinerary",          meta:"5 members · 10 days · last edited by Sara 2m ago" },
  calendar:  { iconKey:"calendar",  label:"Calendar",  title:"Trip Calendar",            meta:"Mar 12 – Mar 22 · 10 days mapped" },
  map:       { iconKey:"map",       label:"Map",        title:"Interactive Map",          meta:"7 locations pinned by group" },
  voting:    { iconKey:"vote",      label:"Voting",     title:"Group Voting",             meta:"Anonymous · Results lock into itinerary" },
  budget:    { iconKey:"wallet",    label:"Budget",     title:"Budget Splitter",          meta:"Live tracking · Auto settlement" },
  packing:   { iconKey:"check",     label:"Packing",    title:"Shared Packing List",      meta:"14/22 items checked · updated by group" },
  notes:     { iconKey:"notes",     label:"Chat",       title:"Group Chat",               meta:"Morocco Squad · 5 members · 5 online" },
  bookings:  { iconKey:"hotel",     label:"Bookings",   title:"Bookings & Accommodation", meta:"4 confirmed · 1 pending" },
  share:     { iconKey:"link",      label:"Share",      title:"Share & Invite",           meta:"Invite members — they sign up & join instantly" },
};

// ─── Panel components ─────────────────────────────────────────────────

const ItineraryPanel = () => {
  const days = [
    {
      label: "Day 1 — Mar 12", sub: "Marrakech Arrival",
      entries: [
        { time:"14:00", dot:"transport", name:"Arrive at Marrakech Menara Airport", loc:"RAK Airport · Flight EK152",    tag:"transport" },
        { time:"16:30", dot:"stay",      name:"Check-in at Riad Yasmine",           loc:"Medina, Marrakech",             tag:"stay" },
        { time:"20:00", dot:"food",      name:"Dinner at Nomad Restaurant",         loc:"Derb Aajane, Marrakech",        tag:"food" },
      ],
    },
    {
      label: "Day 2 — Mar 13", sub: "Medina & Souks",
      entries: [
        { time:"09:00", dot:"explore", name:"Explore Jemaa el-Fnaa Square",   loc:"Central Marrakech",    tag:"explore" },
        { time:"11:00", dot:"explore", name:"Souk shopping & spice market",   loc:"Marrakech Medina",     tag:"explore" },
        { time:"19:30", dot:"food",    name:"Sunset dinner — voted by group", loc:"Le Jardin, Marrakech", tag:"food" },
      ],
    },
    {
      label: "Day 3 — Mar 14", sub: "Sahara Drive",
      entries: [
        { time:"07:00", dot:"transport", name:"Road trip toward Ouarzazate",   loc:"Marrakech → Tizi n'Tichka Pass", tag:"transport" },
        { time:"14:00", dot:"explore",   name:"Ouarzazate city & Kasbah tour", loc:"Ouarzazate, Morocco",            tag:"explore" },
      ],
    },
  ];

  const tagIcon  = { transport: Icon.transport(10), explore: Icon.explore(10), food: Icon.food(10), stay: Icon.stay(10) };

  return (
    <div>
      {days.map((day, di) => (
        <div className="nbp-day-block" key={di}>
          <div className="nbp-day-header">
            <span className="nbp-day-label">{day.label} · {day.sub}</span>
            <div className="nbp-day-line" />
          </div>
          {day.entries.map((e, ei) => (
            <div className="nbp-activity-row" key={ei}>
              <span className="nbp-activity-time">{e.time}</span>
              <div className={`nbp-activity-dot nbp-dot-${e.dot}`} />
              <div className="nbp-activity-details">
                <div className="nbp-activity-name">{e.name}</div>
                <div className="nbp-activity-loc">{e.loc}</div>
              </div>
              <span className={`nbp-tag nbp-tag-${e.tag}`}>
                {tagIcon[e.tag]}{e.tag.charAt(0).toUpperCase() + e.tag.slice(1)}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const CalendarPanel = () => {
  const dayNames = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const calDays = [
    ...Array(5).fill(null),
    ...[1,2,3,4,5,6,7,8,9,10,11].map(n=>({n})),
    ...[12,13,14,15,16,17,18,19,20,21,22].map(n=>({n,trip:true,event:true})),
    ...[23,24,25,26,27,28,29,30,31].map(n=>({n})),
  ];
  const events = [
    { time:"14:00", label:"Arrive Marrakech",      color:"#C8623A" },
    { time:"16:30", label:"Check-in Riad Yasmine", color:"#3A7CA5" },
    { time:"20:00", label:"Dinner at Nomad",        color:"#5C7A5E" },
  ];
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", cursor:"pointer" }}>‹</span>
        <span style={{ fontWeight:700, color:"rgba(255,255,255,0.8)", fontSize:13 }}>March 2026</span>
        <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", cursor:"pointer" }}>›</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:16 }}>
        {dayNames.map(d=>(
          <div key={d} style={{ textAlign:"center", fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.25)", paddingBottom:4, textTransform:"uppercase" }}>{d}</div>
        ))}
        {calDays.map((d,i)=>(
          <div key={i} style={{
            textAlign:"center", padding:"5px 2px", borderRadius:7, fontSize:11, cursor:d?"pointer":"default",
            color: d?.n===12?"white": d?.trip?"#E07A52":"rgba(255,255,255,0.4)",
            background: d?.n===12?"#C8623A": d?.trip?"rgba(200,98,58,0.12)":"transparent",
            fontWeight: d?.trip?600:400, position:"relative",
          }}>
            {d?.n||""}
            {d?.event && d?.n!==12 && <div style={{ position:"absolute", bottom:1, left:"50%", transform:"translateX(-50%)", width:3, height:3, borderRadius:"50%", background:"#E07A52" }} />}
          </div>
        ))}
      </div>
      <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginBottom:8, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>Mar 12 – Events</div>
      {events.map((e,i)=>(
        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 10px", borderRadius:8, borderLeft:`3px solid ${e.color}`, background:`${e.color}18`, marginBottom:5 }}>
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", minWidth:34 }}>{e.time}</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.75)", fontWeight:600 }}>{e.label}</span>
        </div>
      ))}
    </div>
  );
};

const MapPanel = () => {
  const pins = [
    { top:"34%", left:"13%", label:"Marrakech", color:"#C8623A" },
    { top:"18%", left:"38%", label:"Atlas Pass", color:"#3A7CA5" },
    { top:"8%",  left:"57%", label:"Ouarzazate", color:"#5C7A5E" },
    { top:"40%", left:"74%", label:"Merzouga",   color:"#C8623A" },
  ];
  const locs = [
    { color:"#C8623A", name:"Marrakech Medina",           type:"Base Camp · Day 1–3" },
    { color:"#3A7CA5", name:"Tizi n'Tichka Pass",         type:"Scenic Route · Day 3" },
    { color:"#5C7A5E", name:"Ouarzazate",                 type:"Day 4–5 · 2 activities" },
    { color:"#C8A03A", name:"Erg Chebbi Dunes, Merzouga", type:"Desert Camp · Day 6" },
  ];
  return (
    <div>
      <div style={{ width:"100%", height:160, background:"linear-gradient(145deg,#1A2E1A,#0E2030)", borderRadius:14, position:"relative", overflow:"hidden", marginBottom:14 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"28px 28px" }} />
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
          <polyline points="80,90 200,65 340,50 480,100" stroke="rgba(200,98,58,0.45)" strokeWidth="2" fill="none" strokeDasharray="6,4"/>
        </svg>
        {pins.map((p,i)=>(
          <div key={i} style={{ position:"absolute", top:p.top, left:p.left, display:"flex", flexDirection:"column", alignItems:"center" }}>
            <div style={{ background:p.color, color:"white", fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:50, whiteSpace:"nowrap" }}>{p.label}</div>
            <div style={{ width:0, height:0, borderLeft:"4px solid transparent", borderRight:"4px solid transparent", borderTop:`5px solid ${p.color}` }} />
          </div>
        ))}
      </div>
      {locs.map((l,i)=>(
        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"rgba(255,255,255,0.03)", borderRadius:9, border:"1px solid rgba(255,255,255,0.05)", marginBottom:6 }}>
          <div style={{ width:9, height:9, borderRadius:"50%", background:l.color, flexShrink:0 }} />
          <div style={{ flex:1, fontSize:12, color:"rgba(255,255,255,0.75)", fontWeight:600 }}>{l.name}</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{l.type}</div>
        </div>
      ))}
    </div>
  );
};

const VotingPanel = () => {
  const votes1 = [
    { label:"Le Jardin",     pct:65, fill:"#C8623A" },
    { label:"Nomad Rooftop", pct:25, fill:"#3A7CA5" },
    { label:"Night Market",  pct:10, fill:"#5C7A5E" },
  ];
  const votes2 = [
    { label:"Camel Trek",      pct:50, fill:"#C8A03A" },
    { label:"Quad Bikes",      pct:30, fill:"#C8623A" },
    { label:"Hot Air Balloon", pct:20, fill:"#3A7CA5" },
  ];
  const VoteBlock = ({ q, opts, closed, meta, winner }) => (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:16, marginBottom:12 }}>
      <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.85)", marginBottom:12 }}>{q}</div>
      {opts.map((o,i)=>(
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.55)", minWidth:88, flexShrink:0 }}>{o.label}</span>
          <div style={{ flex:1, height:7, background:"rgba(255,255,255,0.08)", borderRadius:50, overflow:"hidden" }}>
            <div style={{ width:`${o.pct}%`, height:"100%", borderRadius:50, background:o.fill }} />
          </div>
          <span style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.45)", minWidth:28, textAlign:"right" }}>{o.pct}%</span>
        </div>
      ))}
      <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:8 }}>{meta}</div>
      {winner && (
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(200,98,58,0.2)", color:"#E07A52", fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:50, marginTop:8, border:"1px solid rgba(200,98,58,0.3)" }}>
          {Icon.thumb(11)} {winner}
        </div>
      )}
      {!closed && (
        <button style={{ marginTop:10, width:"100%", padding:9, background:"rgba(200,98,58,0.15)", border:"1px solid rgba(200,98,58,0.3)", color:"#E07A52", borderRadius:10, fontFamily:"inherit", fontSize:12, fontWeight:700, cursor:"pointer" }}>
          Cast Your Vote →
        </button>
      )}
    </div>
  );
  return (
    <>
      <VoteBlock q="Where should we eat on Day 2 evening?" opts={votes1} closed meta="5/5 voted · closed · results locked" winner="Le Jardin wins — added to Day 2" />
      <VoteBlock q="Which desert experience for Day 6?"   opts={votes2}       meta="3/5 voted · open until Mar 10" />
    </>
  );
};

const BudgetPanel = () => {
  const stats = [{ num:"2,545", label:"Total Spent" },{ num:"509", label:"Per Person" },{ num:"1,455", label:"Remaining" }];
  const expenses = [
    { icon:Icon.plane(14),  bg:"rgba(200,98,58,0.15)",  name:"Emirates EK152 — Dubai to Marrakech", who:"Sara paid",     amount:"1,250 AED" },
    { icon:Icon.hotel(14),  bg:"rgba(58,124,165,0.15)", name:"Riad Yasmine – 3 nights",             who:"Mohammed paid", amount:"680 AED" },
    { icon:Icon.car(14),    bg:"rgba(92,122,94,0.15)",  name:"Europcar SUV rental",                 who:"Layla paid",    amount:"420 AED" },
    { icon:Icon.food(14),   bg:"rgba(200,160,58,0.15)", name:"Nomad Restaurant dinner",             who:"Split equally", amount:"195 AED" },
  ];
  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:18 }}>
        {stats.map((s,i)=>(
          <div key={i} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"12px 10px", textAlign:"center" }}>
            <div style={{ fontSize:17, fontWeight:700, color:"white", lineHeight:1 }}>{s.num}</div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", marginTop:3 }}>{s.label} (AED)</div>
          </div>
        ))}
      </div>
      {expenses.map((e,i)=>(
        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", background:"rgba(255,255,255,0.03)", borderRadius:11, border:"1px solid rgba(255,255,255,0.05)", marginBottom:7 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:e.bg, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.7)", flexShrink:0 }}>{e.icon}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.name}</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>{e.who}</div>
          </div>
          <div style={{ fontSize:13, fontWeight:700, color:"white", flexShrink:0 }}>{e.amount}</div>
        </div>
      ))}
      <div style={{ background:"rgba(92,122,94,0.15)", border:"1px solid rgba(92,122,94,0.3)", borderRadius:12, padding:"12px 14px", display:"flex", alignItems:"center", gap:10, marginTop:4 }}>
        <span style={{ color:"#7A9E7C", display:"flex" }}>{Icon.settlement(14)}</span>
        <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>Settlement ready — <strong style={{ color:"#7A9E7C" }}>Reem owes Sara 124 AED</strong></span>
      </div>
    </>
  );
};

const PackingPanel = () => {
  const [checked, setChecked] = useState(new Set([0,1,3,5]));
  const toggle = i => setChecked(prev => { const n=new Set(prev); n.has(i)?n.delete(i):n.add(i); return n; });
  const items = [
    { label:"Passports & visas",           who:"Sara",            cat:"Essentials" },
    { label:"Travel insurance documents",  who:"Mohammed",        cat:"Essentials" },
    { label:"Moroccan dirhams (cash)",     who:"Everyone",        cat:"Essentials" },
    { label:"Local SIM card or eSIM",      who:"Reem",            cat:"Essentials" },
    { label:"Lightweight scarf/shawl",     who:"Everyone",        cat:"Clothing" },
    { label:"Comfortable walking sandals", who:"Layla",           cat:"Clothing" },
    { label:"Portable charger × 2",        who:"Sara & Mohammed", cat:"Group Supplies" },
    { label:"Sunscreen SPF 50+",           who:"Unassigned",      cat:"Group Supplies" },
  ];
  const cats = [...new Set(items.map(i=>i.cat))];
  return (
    <>
      {cats.map(cat=>(
        <div key={cat} style={{ marginBottom:18 }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:"rgba(255,255,255,0.3)", marginBottom:8 }}>{cat}</div>
          {items.filter(i=>i.cat===cat).map(item=>{
            const gi = items.indexOf(item);
            const done = checked.has(gi);
            return (
              <div key={gi} onClick={()=>toggle(gi)} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:9, cursor:"pointer", marginBottom:3, opacity:done?0.5:1, transition:"opacity 0.2s" }}>
                <div style={{ width:17, height:17, borderRadius:5, border:`2px solid ${done?"#5C7A5E":"rgba(255,255,255,0.2)"}`, background:done?"#5C7A5E":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
                  {done&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div style={{ flex:1, fontSize:12, color:"rgba(255,255,255,0.7)", textDecoration:done?"line-through":"none" }}>{item.label}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>{item.who}</div>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
};

const NotesPanel = () => {
  const [input, setInput] = useState("");
  const messages = [
    { av:"S", bg:"#C8623A", name:"Sara",     time:"09:14", text:"Just checked — Riad Yasmine confirmed! 3 nights, breakfast included.", me:true },
    { av:"M", bg:"#3A7CA5", name:"Mohammed", time:"09:17", text:"Amazing! Did they confirm early check-in too?",                        me:false },
    { av:"S", bg:"#C8623A", name:"Sara",     time:"09:18", text:"Yes! 11am if the room is free. Fingers crossed 🤞",                    me:true },
    { av:"L", bg:"#5C7A5E", name:"Layla",    time:"09:22", text:"Found a desert guide — Ahmed, super rated. Book him for Day 6?",        me:false },
    { av:"R", bg:"#C8A03A", name:"Reem",     time:"09:25", text:"Yes please! The camel trek looked incredible.",                         me:false },
    { av:"S", bg:"#C8623A", name:"Sara",     time:"09:26", text:"Let's put it to a vote in the Voting tab!",                             me:true },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", height:320 }}>
      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:8, paddingBottom:8 }}>
        {messages.map((m,i)=>(
          <div key={i} style={{ display:"flex", flexDirection:m.me?"row-reverse":"row", alignItems:"flex-end", gap:6 }}>
            {!m.me&&<div style={{ width:24,height:24,borderRadius:"50%",background:m.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"white",flexShrink:0 }}>{m.av}</div>}
            <div style={{ maxWidth:"72%", display:"flex", flexDirection:"column", alignItems:m.me?"flex-end":"flex-start", gap:2 }}>
              {!m.me&&<span style={{ fontSize:10, color:"rgba(255,255,255,0.35)", fontWeight:600, paddingLeft:2 }}>{m.name}</span>}
              <div style={{ padding:"8px 12px", borderRadius:m.me?"14px 14px 3px 14px":"14px 14px 14px 3px", background:m.me?"#C8623A":"rgba(255,255,255,0.07)", color:m.me?"white":"rgba(255,255,255,0.8)", fontSize:12, lineHeight:1.5 }}>
                {m.text}
              </div>
              <span style={{ fontSize:9, color:"rgba(255,255,255,0.2)" }}>{m.time}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.06)", flexShrink:0 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&setInput("")}
          placeholder="Message the group…"
          style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:50, padding:"7px 14px", fontSize:12, color:"rgba(255,255,255,0.8)", fontFamily:"inherit", outline:"none" }}
        />
        <button onClick={()=>setInput("")} style={{ width:30,height:30,borderRadius:"50%",background:"#C8623A",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
};

const BookingsPanel = () => {
  const bookings = [
    { icon:Icon.plane(15),  bg:"rgba(200,98,58,0.15)",  name:"Emirates EK152 — Dubai to Marrakech", ref:"REF: EK7K2M9",      info:"Mar 12 · 14:00 · 5 passengers",          status:"CONFIRMED", sc:"#28C840", sb:"rgba(40,200,64,0.12)" },
    { icon:Icon.hotel(15),  bg:"rgba(58,124,165,0.15)", name:"Riad Yasmine, Marrakech",             ref:"REF: RY-2026-0312", info:"Mar 12–14 · 3 nights · breakfast incl.",  status:"CONFIRMED", sc:"#28C840", sb:"rgba(40,200,64,0.12)" },
    { icon:Icon.car(15),    bg:"rgba(92,122,94,0.15)",  name:"Europcar 7-seat SUV",                 ref:"REF: ECR-88712",    info:"Mar 12–22 · 10 days · full coverage",    status:"CONFIRMED", sc:"#28C840", sb:"rgba(40,200,64,0.12)" },
    { icon:Icon.camel(15),  bg:"rgba(200,160,58,0.15)", name:"Sahara Desert Camp — Merzouga",       ref:"REF: PENDING",      info:"Mar 17 · 1 night · camel trek + dinner", status:"PENDING",   sc:"#C8A03A", sb:"rgba(200,160,58,0.12)" },
  ];
  return (
    <>
      {bookings.map((b,i)=>(
        <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"12px 14px", background:"rgba(255,255,255,0.03)", borderRadius:13, border:"1px solid rgba(255,255,255,0.05)", marginBottom:9, cursor:"pointer" }}>
          <div style={{ width:36, height:36, borderRadius:11, background:b.bg, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.7)", flexShrink:0 }}>{b.icon}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.85)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.name}</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontFamily:"monospace", letterSpacing:0.5, marginTop:2 }}>{b.ref}</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginTop:2 }}>{b.info}</div>
          </div>
          <div style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:50, background:b.sb, color:b.sc, border:`1px solid ${b.sc}40`, flexShrink:0 }}>{b.status}</div>
        </div>
      ))}
    </>
  );
};

const SharePanel = () => {
  const [copied, setCopied] = useState(false);
  const options = [
    { icon:Icon.whatsapp(14), label:"Share via WhatsApp", desc:"Send to your group chat" },
    { icon:Icon.mail(14),     label:"Send via Email",      desc:"Invite by email address" },
    { icon:Icon.copy(14),     label:"Copy Link",            desc:"Paste anywhere" },
  ];
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:18, marginBottom:16 }}>
        {/* QR */}
        <div style={{ background:"white", borderRadius:14, padding:16, display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
          <div style={{ width:90, height:90, background:"repeating-conic-gradient(#1a1a1a 0% 25%,white 0% 50%) 0 0 / 7px 7px", border:"3px solid #1a1a1a", borderRadius:6 }} />
          <div style={{ fontSize:10, color:"#6B4226", fontWeight:600 }}>Scan to join</div>
        </div>
        {/* Options */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {options.map((o,i)=>(
            <div key={i} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:11, padding:"10px 12px", display:"flex", alignItems:"center", gap:9, cursor:"pointer" }}>
              <span style={{ color:"rgba(255,255,255,0.5)", display:"flex" }}>{o.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", fontWeight:600 }}>{o.label}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{o.desc}</div>
              </div>
              <span style={{ color:"rgba(255,255,255,0.25)", fontSize:11 }}>→</span>
            </div>
          ))}
        </div>
      </div>
      {/* Link bar */}
      <div style={{ display:"flex", alignItems:"center", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, padding:"9px 12px", gap:10 }}>
        <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)", fontFamily:"monospace", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          travelogue.app/trip/morocco-road-trip-2026-x7k2m
        </span>
        <button onClick={()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); }}
          style={{ background:"#C8623A", color:"white", fontSize:11, fontWeight:700, padding:"4px 11px", borderRadius:6, border:"none", cursor:"pointer", flexShrink:0, fontFamily:"inherit" }}>
          {copied?"Copied!":"Copy"}
        </button>
      </div>
    </div>
  );
};

// ─── Panel component map ──────────────────────────────────────────────
const panelComponents = {
  itinerary: ItineraryPanel,
  calendar:  CalendarPanel,
  map:       MapPanel,
  voting:    VotingPanel,
  budget:    BudgetPanel,
  packing:   PackingPanel,
  notes:     NotesPanel,
  bookings:  BookingsPanel,
  share:     SharePanel,
};

// ─── Main export ──────────────────────────────────────────────────────
export default function NotebookPreview() {
  const [active, setActive] = useState("itinerary");
  const PanelComp = panelComponents[active];
  const panel = panels[active];

  const avatarColors = ["#C8623A","#3A7CA5","#5C7A5E","#C8A03A","#9B59B6"];
  const avatarLabels = ["S","M","L","R","+1"];

  return (
   <section className="nbp-section" id="notebook">
      {/* Background glows */}
      <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(200,98,58,0.1) 0%,transparent 70%)", top:-200, right:-200, pointerEvents:"none" }} />
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(58,124,165,0.08) 0%,transparent 70%)", bottom:-100, left:-100, pointerEvents:"none" }} />

      {/* Section header */}
      <div className="nbp-header">
        <div style={{ display:"inline-flex", alignItems:"center", gap:7, fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", color:"#E07A52", marginBottom:12 }}>
          <div style={{ width:18, height:2, background:"#E07A52", borderRadius:2 }} />
          Notebook Preview
        </div>
        <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(1.8rem,3.5vw,2.6rem)", color:"white", margin:"0 0 12px", lineHeight:1.2 }}>
          Your notebook, in action.
        </h2>
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", lineHeight:1.7, margin:0, fontWeight:300 }}>
          Click any tab to explore every feature — this is exactly what your group will see.
        </p>
      </div>

      {/* App shell */}
      <div className="nbp-shell">

        {/* Top bar */}
        <div className="nbp-topbar">
          {/* Traffic lights */}
          <div className="nbp-topbar-dots">
            {["#FF5F57","#FEBC2E","#28C840"].map((c,i)=>(
              <div key={i} className="nbp-topbar-dot" style={{ background:c }} />
            ))}
          </div>

          {/* URL bar */}
          <div className="nbp-topbar-url">
            <span style={{ color:"rgba(255,255,255,0.3)", display:"flex" }}>{Icon.plane(12)}</span>
            Morocco Road Trip — travelogue.app/trip/morocco-2026
          </div>

          {/* Share btn */}
          <button className="nbp-share-btn">
            <span style={{ display:"flex" }}>{Icon.share(11)}</span> Share
          </button>
        </div>

        {/* Body */}
        <div className="nbp-body">

          {/* Sidebar / bottom nav */}
          <aside className="nbp-sidebar">
            {/* Trip card — hidden on mobile via CSS */}
            <div className="nbp-trip-card">
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#C8623A,#E07A52)", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
                  {Icon.sun(16)}
                </div>
                <div>
                  <div className="nbp-trip-card-title">Morocco Road Trip</div>
                  <div className="nbp-trip-card-dates">Mar 12 – Mar 22, 2026</div>
                </div>
              </div>
              {/* Mini avatar row */}
              <div style={{ display:"flex" }}>
                {avatarColors.map((c,i)=>(
                  <div key={i} style={{ width:20,height:20,borderRadius:"50%",background:c,border:"2px solid #160E09",marginLeft:i===0?0:-5,fontSize:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"white" }}>
                    {avatarLabels[i]}
                  </div>
                ))}
              </div>
            </div>

            {/* Nav items — rendered flat (no group wrappers) for proper row on mobile */}
            {navGroups.map(group => (
              <div key={group.label} style={{ display:"contents" }}>
                {/* Group label hidden on mobile via CSS */}
                <div className="nbp-section-label">{group.label}</div>
                {group.items.map(id => (
                  <div
                    key={id}
                    className={`nbp-sidebar-item${active===id?" nbp-sidebar-item--active":""}`}
                    onClick={() => setActive(id)}
                  >
                    <span className="nbp-sidebar-icon" style={{ color:active===id?"#E07A52":"rgba(255,255,255,0.4)", display:"flex" }}>
                      {Icon[panels[id].iconKey](14)}
                    </span>
                    <span className="nbp-sidebar-label">{panels[id].label}</span>
                   
                  </div>
                ))}
              </div>
            ))}
          </aside>

          {/* Main content */}
          <main className="nbp-main">
            <div className="nbp-panel-header">
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:9, background:"rgba(200,98,58,0.15)", display:"flex", alignItems:"center", justifyContent:"center", color:"#E07A52", flexShrink:0 }}>
                  {Icon[panel.iconKey](16)}
                </div>
                <div style={{ minWidth:0 }}>
                  <div className="nbp-panel-title">{panel.title}</div>
                  <div className="nbp-panel-meta">{panel.meta}</div>
                </div>
              </div>
              <button className="nbp-panel-add-btn">+ Add</button>
            </div>

            <div className="nbp-panel-body">
              <PanelComp />
            </div>
          </main>

        </div>
      </div>
    </section>
  );
}