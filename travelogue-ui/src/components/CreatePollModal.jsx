// components/CreatePollModal.jsx
// Follows the same modal pattern as NewTripModal in Dashboard.jsx.
// No external UI library — uses the existing CSS design system.

import React, { useState } from "react";
import "./CreatePollModal.css";

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
  </svg>
);

/**
 * Props:
 *   onClose   () => void
 *   onCreated (pollData) => Promise<void>
 *   loading   bool
 */
export default function CreatePollModal({ onClose, onCreated, loading }) {
  const [question,         setQuestion]         = useState("");
  const [description,      setDescription]      = useState("");
  const [options,          setOptions]          = useState(["", ""]);
  const [expiresAt,        setExpiresAt]        = useState("");
  const [anonymous,        setAnonymous]        = useState(false);
  const [multipleSelect,   setMultipleSelect]   = useState(false);
  const [error,            setError]            = useState("");

  function addOption() {
    if (options.length >= 8) return; // reasonable cap
    setOptions(prev => [...prev, ""]);
  }

  function removeOption(i) {
    if (options.length <= 2) return;
    setOptions(prev => prev.filter((_, idx) => idx !== i));
  }

  function updateOption(i, val) {
    setOptions(prev => prev.map((o, idx) => (idx === i ? val : o)));
  }

  async function handleSubmit() {
    setError("");
    if (!question.trim()) { setError("Poll question is required."); return; }
    const validOptions = options.map(o => o.trim()).filter(Boolean);
    if (validOptions.length < 2) { setError("Add at least 2 options."); return; }

    let parsedExpiry = undefined;
    if (expiresAt) {
      const d = new Date(expiresAt);
      if (d <= new Date()) { setError("Expiry must be in the future."); return; }
      parsedExpiry = d.toISOString();
    }

    try {
      await onCreated({
        question: question.trim(),
        description: description.trim(),
        options: validOptions,
        expiresAt: parsedExpiry,
        anonymous,
        multipleSelection: multipleSelect,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create poll.");
    }
  }

  // Min datetime for the expiry picker: now + 5 min
  const minDateTime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="cpm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cpm-modal">
        {/* Header */}
        <div className="cpm-header">
          <div>
            <h2 className="cpm-title">Create a Poll</h2>
            <p className="cpm-sub">Let the group vote on a decision</p>
          </div>
          <button className="cpm-close" onClick={onClose}><CloseIcon /></button>
        </div>

        {/* Body */}
        <div className="cpm-body">
          {/* Question */}
          <div className="cpm-field">
            <label className="cpm-label">Question *</label>
            <input
              className="cpm-input"
              type="text"
              placeholder="e.g. Which restaurant should we try?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="cpm-field">
            <label className="cpm-label">Description <span className="cpm-opt">(optional)</span></label>
            <textarea
              className="cpm-input cpm-textarea"
              rows={2}
              placeholder="Add more context…"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Options */}
          <div className="cpm-field">
            <label className="cpm-label">Options</label>
            <div className="cpm-options-list">
              {options.map((opt, i) => (
                <div key={i} className="cpm-option-row">
                  <input
                    className="cpm-input"
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={e => updateOption(i, e.target.value)}
                  />
                  {options.length > 2 && (
                    <button className="cpm-remove-opt" onClick={() => removeOption(i)} type="button">
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 8 && (
              <button className="cpm-add-opt" onClick={addOption} type="button">
                <PlusIcon /> Add option
              </button>
            )}
          </div>

          {/* Expiry */}
          <div className="cpm-field">
            <label className="cpm-label">Expires at <span className="cpm-opt">(optional)</span></label>
            <input
              className="cpm-input"
              type="datetime-local"
              min={minDateTime}
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
            />
          </div>

          {/* Toggles */}
          <div className="cpm-toggles">
            <div className="cpm-toggle-row">
              <div>
                <div className="cpm-toggle-label">Anonymous voting</div>
                <div className="cpm-toggle-sub">Hide who voted for each option</div>
              </div>
              <button
                className={`cpm-tog${anonymous ? " on" : ""}`}
                onClick={() => setAnonymous(v => !v)}
                type="button"
              />
            </div>
            <div className="cpm-toggle-row">
              <div>
                <div className="cpm-toggle-label">Allow multiple choices</div>
                <div className="cpm-toggle-sub">Members can select more than one option</div>
              </div>
              <button
                className={`cpm-tog${multipleSelect ? " on" : ""}`}
                onClick={() => setMultipleSelect(v => !v)}
                type="button"
              />
            </div>
          </div>

          {error && <div className="cpm-error">{error}</div>}
        </div>

        {/* Footer */}
        <div className="cpm-footer">
          <button className="cpm-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="cpm-btn-main" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating…" : "Create Poll"}
          </button>
        </div>
      </div>
    </div>
  );
}