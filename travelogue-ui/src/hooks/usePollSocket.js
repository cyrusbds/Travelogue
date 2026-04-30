// hooks/usePollSocket.js
// Manages Socket.IO subscriptions for real-time poll updates.
// Mirrors the pattern in useChat.js.

import { useEffect } from "react";

/**
 * @param {object|null} socket  - Socket.IO client instance
 * @param {string}      tripId  - current trip ID
 * @param {function}    onCreated  - (poll) => void
 * @param {function}    onVoteCast - (poll) => void
 * @param {function}    onClosed   - (pollId) => void
 * @param {function}    onDeleted  - (pollId) => void
 * @param {function}    onUpdated  - (poll) => void
 */
export function usePollSocket(socket, tripId, {
  onCreated,
  onVoteCast,
  onClosed,
  onDeleted,
  onUpdated,
} = {}) {
  useEffect(() => {
    if (!socket || !tripId) return;

    // Join the poll room for this trip
    socket.emit("poll:join", { tripId });

    const handlers = {
      "poll:created":   onCreated  ? ({ poll })   => onCreated(poll)    : null,
      "poll:vote_cast": onVoteCast ? ({ poll })   => onVoteCast(poll)   : null,
      "poll:closed":    onClosed   ? ({ pollId }) => onClosed(pollId)   : null,
      "poll:deleted":   onDeleted  ? ({ pollId }) => onDeleted(pollId)  : null,
      "poll:updated":   onUpdated  ? ({ poll })   => onUpdated(poll)    : null,
    };

    // Register only the handlers that were provided
    Object.entries(handlers).forEach(([event, handler]) => {
      if (handler) socket.on(event, handler);
    });

    return () => {
      // Cleanup on unmount / tripId change
      Object.entries(handlers).forEach(([event, handler]) => {
        if (handler) socket.off(event, handler);
      });
    };
  }, [socket, tripId]);
}