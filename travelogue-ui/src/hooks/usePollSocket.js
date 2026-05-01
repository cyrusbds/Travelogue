// hooks/usePollSocket.js
// Manages Socket.IO subscriptions for real-time poll updates.

import { useEffect } from "react";
import socket from "../api/socket";

/**
 * @param {object|null} socket  - Socket.IO client instance
 * @param {string}      tripId  - current trip ID
 * @param {function}    onCreated  - (poll) => void
 * @param {function}    onVoteCast - (poll) => void
 * @param {function}    onClosed   - (pollId) => void
 * @param {function}    onDeleted  - (pollId) => void
 * @param {function}    onUpdated  - (poll) => void
 */
export function usePollSocket(
  socket,
  tripId,
  { onCreated, onVoteCast, onClosed, onDeleted, onUpdated } = {},
) {
  useEffect(() => {
    if (!socket || !tripId) return;

    // Join the poll room for this trip
    socket.emit("poll:join", { tripId });

    const handlers = {
      "poll:created": onCreated ? ({ poll }) => onCreated(poll) : null,
      "poll:vote_cast": onVoteCast ? ({ poll }) => onVoteCast(poll) : null,
      "poll:closed": onClosed ? ({ pollId }) => onClosed(pollId) : null,
      "poll:deleted": onDeleted ? ({ pollId }) => onDeleted(pollId) : null,
      "poll:updated": onUpdated ? ({ poll }) => onUpdated(poll) : null,
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

    // Join the poll room for this trip
    socket.emit("join:poll", { tripId });

    const handleVote = ({ poll }) => onVoteCast?.(poll);
    const handleCreated = ({ poll }) => onCreated?.(poll);
    const handleUpdated = ({ poll }) => onUpdated?.(poll);
    const handleClosed = ({ pollId }) => onClosed?.(pollId);
    const handleDeleted = ({ pollId }) => onDeleted?.(pollId);

    socket.on("poll:vote_cast", handleVote);
    socket.on("poll:created", handleCreated);
    socket.on("poll:updated", handleUpdated);
    socket.on("poll:closed", handleClosed);
    socket.on("poll:deleted", handleDeleted);

    return () => {
      // Leave room and remove listeners on unmount
      socket.emit("leave:polls", { tripId });
      socket.off("poll:vote_cast", handleVote);
      socket.off("poll:created", handleCreated);
      socket.off("poll:updated", handleUpdated);
      socket.off("poll:closed", handleClosed);
      socket.off("poll:deleted", handleDeleted);
    };
  }, [socket, tripId]);
}
