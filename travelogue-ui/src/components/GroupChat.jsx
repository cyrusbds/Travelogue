// src/components/GroupChat.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import useChat from '../hooks/useChat';
import './GroupChat.css';

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const IconDelete = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="12" height="12">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const IconEmpty = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="9" y1="10" x2="15" y2="10" />
    <line x1="12" y1="7" x2="12" y2="13" />
  </svg>
);

const IconSpinner = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="28" height="28" className="chat-spinner-svg">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
const DeleteModal = ({ onConfirm, onCancel }) => (
  <div className="delete-modal-overlay" onClick={onCancel}>
    <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
      <p>Delete this message?</p>
      <div className="delete-modal-actions">
        <button className="delete-modal-cancel" onClick={onCancel}>Cancel</button>
        <button className="delete-modal-confirm" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>
);

// ─── Sub-component: single message bubble ────────────────────────────────────
const MessageBubble = ({ msg, isMine, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (msg.type === 'system') {
    return (
      <div className="chat-system-msg">
        <span>{msg.content}</span>
      </div>
    );
  }

  const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDeleteClick = () => setConfirmDelete(true);
  const handleConfirm = () => { onDelete(msg._id); setConfirmDelete(false); };
  const handleCancel = () => setConfirmDelete(false);

  return (
    <>
      {confirmDelete && (
        <DeleteModal onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
      <div
        className={`chat-bubble-wrapper ${isMine ? 'mine' : 'theirs'}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {!isMine && (
          <div className="chat-sender-avatar" title={msg.sender?.name}>
            {msg.sender?.name?.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="chat-bubble-body">
          {!isMine && (
            <span className="chat-sender-name">
              {msg.sender?.name}
              {msg.sender?.isGuest && <em> (guest)</em>}
            </span>
          )}

          <div className="chat-bubble-row">
            {/* Delete button — left of bubble for mine, hidden for theirs */}
            {isMine && showActions && !msg.optimistic && (
              <button
                className="chat-delete-btn"
                onClick={handleDeleteClick}
                title="Delete message"
              >
                <IconDelete />
              </button>
            )}

            <div className={`chat-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
              <p>{msg.content}</p>
            </div>
          </div>

          <span className="chat-time">{timeStr}</span>
        </div>
      </div>
    </>
  );
};

// ─── Typing indicator ────────────────────────────────────────────────────────
const TypingIndicator = ({ users }) => {
  if (!users?.length) return null;
  const label =
    users.length === 1
      ? `${users[0]} is typing…`
      : `${users.slice(0, 2).join(', ')} are typing…`;

  return (
    <div className="chat-typing-indicator">
      <span className="typing-dots"><span /><span /><span /></span>
      <span className="typing-label">{label}</span>
    </div>
  );
};

// ─── Main GroupChat component ────────────────────────────────────────────────
const GroupChat = ({ socket, tripId, currentUser }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const topSentinelRef = useRef(null);
  const inputRef = useRef(null);

  const { messages, typingUsers, isLoading, error, hasMore, loadMore, sendMessage, deleteMsg, startTyping, stopTyping } =
    useChat(socket, tripId, currentUser);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!topSentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(topSentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const handleSend = useCallback(
    (e) => {
      e.preventDefault();
      if (!input.trim()) return;
      sendMessage(input);
      setInput('');
      inputRef.current?.focus();
    },
    [input, sendMessage]
  );

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (e.target.value) startTyping();
    else stopTyping();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="group-chat">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-icon"><IconChat /></div>
        <div>
          <h3>Group Chat</h3>
          <span className="chat-subtitle">Live · All members</span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages-container">
        <div ref={topSentinelRef} className="chat-top-sentinel" />

        {hasMore && (
          <button className="chat-load-more" onClick={loadMore}>
            Load earlier messages
          </button>
        )}

        {isLoading ? (
          <div className="chat-loading">
            <IconSpinner />
            <span>Loading messages…</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <span className="chat-empty-icon"><IconEmpty /></span>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              msg={msg}
              // Use the isMine flag stored on the message (set during optimistic
              // creation and preserved on server swap) — avoids ObjectId mismatch
              isMine={
                msg.isMine ||
                (msg.sender?.userId && msg.sender.userId.toString() === currentUser?.userId?.toString()) ||
                (msg.sender?.guestId && msg.sender.guestId === currentUser?.guestId)
              }
              onDelete={deleteMsg}
            />
          ))
        )}

        <TypingIndicator users={typingUsers} />
        <div ref={messagesEndRef} />
      </div>

      {error && <div className="chat-error-bar">{error}</div>}

      {/* Input */}
      <form className="chat-input-area" onSubmit={handleSend}>
        <textarea
          ref={inputRef}
          className="chat-textarea"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          maxLength={2000}
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!input.trim()}
          aria-label="Send message"
        >
          <IconSend />
        </button>
      </form>
    </div>
  );
};

export default GroupChat;