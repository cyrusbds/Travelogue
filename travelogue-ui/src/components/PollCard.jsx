// components/PollCard.jsx
// Renders a single poll with animated progress bars, vote controls,
// countdown timer, and creator management actions.

import React, { useState, useEffect, useCallback } from "react";
import "./PollCard.css";

// ── Icons (inline SVG — no external dep) ─────────────────────────────────────
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const LockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
      setRemaining(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

function formatCountdown(secs) {
  if (secs === null) return null;
  if (secs <= 0) return "Expired";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0)  return `${h}h ${m}m`;
  if (m > 0)  return `${m}m ${s}s`;
  return `${s}s`;
}

// ── PollCard ──────────────────────────────────────────────────────────────────
/**
 * Props:
 *   poll        — serialised poll object from backend
 *   currentUser — { userId, name }  (from AuthContext / socket context)
 *   onVote      — async (optionIndexes: number[]) => void
 *   onClose     — async () => void
 *   onDelete    — async () => void
 *   isCreator   — bool (poll.creatorId === currentUser.userId)
 */
export default function PollCard({ poll, currentUser, onVote, onClose, onDelete }) {
  const [selected,   setSelected]   = useState(poll.myVotes || []);
  const [voting,     setVoting]     = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);

  const countdown = useCountdown(poll.expiresAt);
  const isExpired = (countdown !== null && countdown <= 0) || poll.status === "expired";
  const isClosed  = poll.status === "closed";
  const isInactive = isExpired || isClosed;

  const isCreator  = poll.creatorId === currentUser?.userId;
  const hasVoted   = poll.hasVoted;
  const totalVotes = poll.totalVotes || 0;

  // Show results if: voted, inactive, or no options left to pick
  const showResults = hasVoted || isInactive;

  // ── Sync selected when poll updates via socket ──
  useEffect(() => {
    setSelected(poll.myVotes || []);
  }, [poll._id, (poll.myVotes || []).join(",")]);

  // ── Selection logic ───────────────────────────────────────────────────────
  function toggleOption(idx) {
    if (isInactive || voting) return;
    if (poll.multipleSelection) {
      setSelected(prev =>
        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
      );
    } else {
      setSelected([idx]);
    }
  }

  async function submitVote() {
    if (selected.length === 0 || voting) return;
    setVoting(true);
    try {
      await onVote(selected);
    } finally {
      setVoting(false);
    }
  }

  // ── Winning option(s): highest vote count ─────────────────────────────────
  const maxVotes = Math.max(...poll.options.map(o => o.voteCount || 0));
  const isWinner = (opt) => showResults && maxVotes > 0 && (opt.voteCount || 0) === maxVotes;

  // ── Status badge ──────────────────────────────────────────────────────────
  const statusBadge = isClosed
    ? { label: "Closed", cls: "pc-badge--closed" }
    : isExpired
    ? { label: "Expired", cls: "pc-badge--expired" }
    : { label: "Live", cls: "pc-badge--live" };

  return (
    <div className={`pc-card ${isInactive ? "pc-card--inactive" : ""}`}>
      {/* Header */}
      <div className="pc-header">
        <div className="pc-header-left">
          <span className={`pc-badge ${statusBadge.cls}`}>{statusBadge.label}</span>
          {poll.anonymous && (
            <span className="pc-badge pc-badge--anon"><LockIcon /> Anonymous</span>
          )}
          {poll.multipleSelection && (
            <span className="pc-badge pc-badge--multi">Multi-choice</span>
          )}
        </div>
        {/* Creator actions */}
        {isCreator && !delConfirm && (
          <div className="pc-actions">
            {!isInactive && (
              <button className="pc-action-btn" onClick={onClose} title="Close poll">
                <CloseIcon />
              </button>
            )}
            <button className="pc-action-btn pc-action-btn--del" onClick={() => setDelConfirm(true)} title="Delete poll">
              <TrashIcon />
            </button>
          </div>
        )}
        {delConfirm && (
          <div className="pc-del-confirm">
            <span>Delete this poll?</span>
            <button className="pc-del-yes" onClick={onDelete}>Yes</button>
            <button className="pc-del-no"  onClick={() => setDelConfirm(false)}>No</button>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="pc-question">{poll.question}</div>
      {poll.description && <div className="pc-desc">{poll.description}</div>}

      {/* Countdown */}
      {poll.expiresAt && !isInactive && countdown !== null && (
        <div className={`pc-countdown ${countdown < 60 ? "pc-countdown--urgent" : ""}`}>
          ⏱ {formatCountdown(countdown)}
        </div>
      )}

      {/* Options */}
      <div className="pc-options">
        {poll.options.map((opt, idx) => {
          const pct = totalVotes > 0 ? Math.round(((opt.voteCount || 0) / totalVotes) * 100) : 0;
          const isSelected = selected.includes(idx);
          const myVote = (poll.myVotes || []).includes(idx);
          const winner = isWinner(opt);

          return (
            <div
              key={opt._id || idx}
              className={[
                "pc-option",
                showResults    ? "pc-option--result" : "pc-option--vote",
                isSelected && !showResults ? "pc-option--selected" : "",
                myVote && showResults      ? "pc-option--my-vote"  : "",
                winner                     ? "pc-option--winner"   : "",
                isInactive                 ? "pc-option--disabled" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => !showResults && toggleOption(idx)}
            >
              {/* Option label row */}
              <div className="pc-option-row">
                {/* Checkbox / radio indicator */}
                {!showResults && (
                  <div className={`pc-selector ${isSelected ? "pc-selector--on" : ""} ${poll.multipleSelection ? "pc-selector--check" : "pc-selector--radio"}`}>
                    {isSelected && <CheckIcon />}
                  </div>
                )}

                <span className="pc-option-label">{opt.label}</span>

                {showResults && (
                  <span className="pc-option-pct">{pct}%</span>
                )}

                {myVote && showResults && (
                  <span className="pc-my-vote-tag"><CheckIcon /> Your vote</span>
                )}
              </div>

              {/* Animated progress bar */}
              {showResults && (
                <div className="pc-bar-track">
                  <div
                    className={`pc-bar-fill ${winner ? "pc-bar-fill--winner" : ""}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}

              {/* Vote count */}
              {showResults && (
                <div className="pc-vote-count">
                  {opt.voteCount || 0} vote{(opt.voteCount || 0) !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pc-footer">
        <span className="pc-total">{totalVotes} vote{totalVotes !== 1 ? "s" : ""} total</span>

        {!showResults && !isInactive && (
          <button
            className="pc-vote-btn"
            onClick={submitVote}
            disabled={selected.length === 0 || voting}
          >
            {voting ? "Voting…" : "Submit Vote"}
          </button>
        )}

        {hasVoted && !isInactive && (
          <span className="pc-change-hint">Tap an option to change your vote</span>
        )}
      </div>
    </div>
  );
}