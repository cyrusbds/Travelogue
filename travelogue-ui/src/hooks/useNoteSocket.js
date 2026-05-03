// hooks/useNoteSocket.js
import { useEffect } from "react";
import socket from "../api/socket";

export function useNoteSocket(
  tripId,
  { onCreated, onUpdated, onDeleted } = {},
) {
  useEffect(() => {
    if (!tripId) return;

    socket.emit("join-trip", tripId);

    const handleCreated = ({ note }) => onCreated?.(note);
    const handleUpdated = ({ note }) => onUpdated?.(note);
    const handleDeleted = ({ noteId }) => onDeleted?.(noteId);

    socket.on("noteCreated", handleCreated);
    socket.on("noteUpdated", handleUpdated);
    socket.on("noteDeleted", handleDeleted);

    return () => {
      socket.off("noteCreated", handleCreated);
      socket.off("noteUpdated", handleUpdated);
      socket.off("noteDeleted", handleDeleted);
    };
  }, [tripId]);
}
