// src/components/PackingChecklist.jsx
// Shared packing checklist with live sync via Socket.IO
import React, { useState, useRef } from 'react';
import useChecklist from '../hooks/useChecklist';
import './PackingChecklist.css';

const CATEGORIES = [
  { value: 'clothing', label: '👕 Clothing' },
  { value: 'toiletries', label: '🧴 Toiletries' },
  { value: 'documents', label: '📄 Documents' },
  { value: 'electronics', label: '🔌 Electronics' },
  { value: 'medical', label: '💊 Medical' },
  { value: 'other', label: '📦 Other' },
];

// ─── Single checklist item row ────────────────────────────────────────────────
const ChecklistItemRow = ({ item, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(item.text);
  const inputRef = useRef(null);

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleEditSubmit = () => {
    if (editVal.trim() && editVal !== item.text) onEdit(item._id, editVal.trim());
    setIsEditing(false);
  };

  const catLabel = CATEGORIES.find((c) => c.value === item.category)?.label || '📦 Other';

  return (
    <div className={`checklist-item ${item.completed ? 'completed' : ''}`}>
      <button
        className={`checklist-checkbox ${item.completed ? 'checked' : ''}`}
        onClick={() => onToggle(item._id, !item.completed)}
        aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {item.completed && (
          <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
            <path d="M1 6l3.5 3.5L11 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        )}
      </button>

      <div className="checklist-item-content">
        {isEditing ? (
          <input
            ref={inputRef}
            className="checklist-edit-input"
            value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEditSubmit();
              if (e.key === 'Escape') setIsEditing(false);
            }}
          />
        ) : (
          <span className="checklist-text" onDoubleClick={handleEdit}>
            {item.text}
          </span>
        )}

        <div className="checklist-meta">
          <span className="checklist-category">{catLabel}</span>
          {item.assignedTo?.name && (
            <span className="checklist-assigned">→ {item.assignedTo.name}</span>
          )}
          {item.completed && item.completedBy && (
            <span className="checklist-done-by">✓ {item.completedBy}</span>
          )}
        </div>
      </div>

      <div className="checklist-actions">
        <button className="checklist-edit-btn" onClick={handleEdit} title="Edit">
          ✏️
        </button>
        <button className="checklist-delete-btn" onClick={() => onDelete(item._id)} title="Delete">
          🗑️
        </button>
      </div>
    </div>
  );
};

// ─── Main PackingChecklist component ─────────────────────────────────────────
const PackingChecklist = ({ socket, tripId, currentUser }) => {
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('other');
  const [filter, setFilter] = useState('all'); // all | pending | done
  const [activeCategory, setActiveCategory] = useState('all');
  const inputRef = useRef(null);

  const { items, isLoading, error, clearError, addItem, toggleItem, editItem, deleteItem } =
    useChecklist(socket, tripId, currentUser);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    addItem(newText, newCategory);
    setNewText('');
    inputRef.current?.focus();
  };

  // Filter & group items
  const filtered = items
    .filter((i) => {
      if (filter === 'pending') return !i.completed;
      if (filter === 'done') return i.completed;
      return true;
    })
    .filter((i) => activeCategory === 'all' || i.category === activeCategory);

  const completedCount = items.filter((i) => i.completed).length;
  const progress = items.length ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="packing-checklist">
      {/* Header */}
      <div className="checklist-header">
        <div className="checklist-header-left">
          <span className="checklist-icon">🧳</span>
          <div>
            <h3>Packing Checklist</h3>
            <span className="checklist-subtitle">
              {completedCount}/{items.length} packed
            </span>
          </div>
        </div>
        <div className="checklist-progress-pill">
          <div
            className="checklist-progress-fill"
            style={{ width: `${progress}%` }}
          />
          <span>{progress}%</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="checklist-error" onClick={clearError}>
          {error} <span>×</span>
        </div>
      )}

      {/* Add item form */}
      <form className="checklist-add-form" onSubmit={handleAdd}>
        <input
          ref={inputRef}
          className="checklist-add-input"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add packing item…"
          maxLength={300}
        />
        <select
          className="checklist-category-select"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <button className="checklist-add-btn" type="submit" disabled={!newText.trim()}>
          Add
        </button>
      </form>

      {/* Filter tabs */}
      <div className="checklist-filters">
        {['all', 'pending', 'done'].map((f) => (
          <button
            key={f}
            className={`checklist-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="checklist-filter-sep" />
        <select
          className="checklist-cat-filter"
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Items list */}
      <div className="checklist-list">
        {isLoading ? (
          <div className="checklist-loading">
            <div className="checklist-spinner" />
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="checklist-empty">
            {items.length === 0 ? '✈️ Add your first item above!' : '🎉 No items match this filter.'}
          </div>
        ) : (
          filtered.map((item) => (
            <ChecklistItemRow
              key={item._id}
              item={item}
              onToggle={toggleItem}
              onDelete={deleteItem}
              onEdit={editItem}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PackingChecklist;