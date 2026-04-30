// components/VotingPanel.jsx
// Drop-in panel that integrates into ChatPanel.jsx as a new "🗳 Votes" tab.
// Manages all poll state, socket subscriptions, and API calls.

import React, { useState, useEffect, useCallback } from "react";
import PollCard from "./PollCard";
import CreatePollModal from "./CreatePollModal";
import { usePollSocket } from "../hooks/usePollSocket";
import {
  apiGetPolls,
  apiCreatePoll,
  apiVotePoll,
  apiClosePoll,
  apiDeletePoll,
} from "../api/polls";
import "./VotingPanel.css";

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

/**
 * Props:
 *   socket      — Socket.IO client instance (same one used by ChatPanel)
 *   tripId      — string
 *   currentUser — { userId, name }
 */
export default function VotingPanel({ socket, tripId, currentUser }) {
  const [polls,      setPolls]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating,   setCreating]   = useState(false);
  const [toast,      setToast]      = useState("");
  const toastRef = React.useRef(null);

  // ── Toast helper ───────────────────────────────────────────────────────────
  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(""), 2600);
  }

  // ── Load polls on mount ───────────────────────────────────────────────────
  useEffect(() => {
    if (!tripId) return;
    setLoading(true);
    apiGetPolls(tripId)
      .then(data => setPolls(data.polls || []))
      .catch(err  => console.error("Failed to load polls:", err))
      .finally(() => setLoading(false));
  }, [tripId]);

  // ── Merge an updated poll into state (upsert by _id) ──────────────────────
  const upsertPoll = useCallback((updated) => {
    setPolls(prev => {
      const exists = prev.find(p => p._id === updated._id);
      if (exists) return prev.map(p => p._id === updated._id ? updated : p);
      return [updated, ...prev]; // new poll from another member
    });
  }, []);

  // ── Socket subscriptions ──────────────────────────────────────────────────
  usePollSocket(socket, tripId, {
    onCreated:  upsertPoll,
    onVoteCast: upsertPoll,
    onUpdated:  upsertPoll,
    onClosed: (pollId) => {
      setPolls(prev => prev.map(p =>
        p._id === pollId ? { ...p, status: "closed" } : p
      ));
    },
    onDeleted: (pollId) => {
      setPolls(prev => prev.filter(p => p._id !== pollId));
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleCreate(payload) {
    setCreating(true);
    try {
      const data = await apiCreatePoll(tripId, payload);
      upsertPoll(data.poll);
      showToast("Poll created!");
    } finally {
      setCreating(false);
    }
  }

  async function handleVote(pollId, optionIndexes) {
    const data = await apiVotePoll(tripId, pollId, optionIndexes);
    upsertPoll(data.poll);
    showToast("Vote submitted!");
  }

  async function handleClose(pollId) {
    const data = await apiClosePoll(tripId, pollId);
    upsertPoll(data.poll);
    showToast("Poll closed.");
  }

  async function handleDelete(pollId) {
    await apiDeletePoll(tripId, pollId);
    setPolls(prev => prev.filter(p => p._id !== pollId));
    showToast("Poll deleted.");
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const activePolls   = polls.filter(p => p.status === "active");
  const inactivePolls = polls.filter(p => p.status !== "active");

  return (
    <div className="vp-root">
      {/* Top bar */}
      <div className="vp-topbar">
        <div className="vp-topbar-title">
          🗳 Group Votes
          {activePolls.length > 0 && (
            <span className="vp-badge">{activePolls.length} active</span>
          )}
        </div>
        <button className="vp-create-btn" onClick={() => setShowCreate(true)}>
          <PlusIcon /> New Poll
        </button>
      </div>

      {/* Scroll area */}
      <div className="vp-scroll">
        {loading && (
          <div className="vp-empty">
            <div className="vp-empty-icon">⏳</div>
            <div className="vp-empty-title">Loading polls…</div>
          </div>
        )}

        {!loading && polls.length === 0 && (
          <div className="vp-empty">
            <div className="vp-empty-icon">🗳️</div>
            <div className="vp-empty-title">No polls yet</div>
            <div className="vp-empty-sub">Create a poll to let the group vote on decisions</div>
            <button className="vp-empty-btn" onClick={() => setShowCreate(true)}>
              <PlusIcon /> Create First Poll
            </button>
          </div>
        )}

        {!loading && activePolls.length > 0 && (
          <section className="vp-section">
            <div className="vp-section-label">Active</div>
            {activePolls.map(poll => (
              <PollCard
                key={poll._id}
                poll={poll}
                currentUser={currentUser}
                onVote={(idxs) => handleVote(poll._id, idxs)}
                onClose={() => handleClose(poll._id)}
                onDelete={() => handleDelete(poll._id)}
                isCreator={poll.creatorId === currentUser?.userId}
              />
            ))}
          </section>
        )}

        {!loading && inactivePolls.length > 0 && (
          <section className="vp-section">
            <div className="vp-section-label">Closed / Expired</div>
            {inactivePolls.map(poll => (
              <PollCard
                key={poll._id}
                poll={poll}
                currentUser={currentUser}
                onVote={(idxs) => handleVote(poll._id, idxs)}
                onClose={() => handleClose(poll._id)}
                onDelete={() => handleDelete(poll._id)}
                isCreator={poll.creatorId === currentUser?.userId}
              />
            ))}
          </section>
        )}
      </div>

      {/* Toast */}
      {toast && <div className="vp-toast">{toast}</div>}

      {/* Create modal */}
      {showCreate && (
        <CreatePollModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreate}
          loading={creating}
        />
      )}
    </div>
  );
}