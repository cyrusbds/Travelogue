// hooks/usePollSocket.js
// Manages Socket.IO subscriptions for real-time poll updates.

import { useEffect } from "react";
import socket from "../api/socket";

export function usePollSocket(
  socket,
  tripId,
  { onCreated, onVoteCast, onClosed, onDeleted, onUpdated } = {},
) {
  useEffect(() => {
    if (!socket || !tripId) return;

    socket.emit("poll:join", { tripId });

    const handleCreated = ({ poll }) => onCreated?.(poll);
    const handleVoteCast = ({ poll }) => onVoteCast?.(poll);
    const handleUpdated = ({ poll }) => onUpdated?.(poll);
    const handleClosed = ({ pollId }) => onClosed?.(pollId);
    const handleDeleted = ({ pollId }) => onDeleted?.(pollId);

    socket.on("poll:created", handleCreated);
    socket.on("poll:vote_cast", handleVoteCast);
    socket.on("poll:updated", handleUpdated);
    socket.on("poll:closed", handleClosed);
    socket.on("poll:deleted", handleDeleted);

    return () => {
      socket.off("poll:created", handleCreated);
      socket.off("poll:vote_cast", handleVoteCast);
      socket.off("poll:updated", handleUpdated);
      socket.off("poll:closed", handleClosed);
      socket.off("poll:deleted", handleDeleted);
    };
  }, [socket, tripId]);
}
