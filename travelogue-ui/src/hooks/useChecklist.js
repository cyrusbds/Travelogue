// src/hooks/useChat.js
// Manages chat state: message history, socket events, typing indicators
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchMessages, deleteMessage as apiDeleteMessage } from '../api/chat';

const TYPING_TIMEOUT = 2500; // ms before typing indicator auto-clears

const useChat = (socket, tripId, currentUser) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]); // names of who's typing
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Cursor for pagination (oldest message timestamp)
  const oldestRef = useRef(null);
  // Local typing debounce timer
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  // ─── Load initial messages ────────────────────────────────────────────────
  useEffect(() => {
    if (!tripId) return;
    setIsLoading(true);
    fetchMessages(tripId)
      .then(({ data }) => {
        setMessages(data.messages);
        if (data.messages.length > 0) {
          oldestRef.current = data.messages[0].createdAt;
        }
        setHasMore(data.messages.length === 50);
      })
      .catch(() => setError('Failed to load messages'))
      .finally(() => setIsLoading(false));
  }, [tripId]);

  // ─── Load older messages (infinite scroll) ────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!hasMore || !oldestRef.current) return;
    try {
      const { data } = await fetchMessages(tripId, oldestRef.current);
      setMessages((prev) => [...data.messages, ...prev]);
      if (data.messages.length > 0) oldestRef.current = data.messages[0].createdAt;
      setHasMore(data.messages.length === 50);
    } catch {
      setError('Failed to load more messages');
    }
  }, [tripId, hasMore]);

  // ─── Socket event listeners ───────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !tripId) return;

    // Join chat room
    socket.emit('chat:join', { tripId, user: currentUser });

    // Incoming new message
    const onMessage = (msg) => {
      setMessages((prev) => {
        // Prevent duplicates (optimistic + socket echo)
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    // Remote message deleted
    const onDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    // Typing updates
    const onTyping = ({ users }) => setTypingUsers(users);

    // System join/leave
    const onJoined = ({ name, timestamp }) => {
      setMessages((prev) => [
        ...prev,
        { _id: `sys-${Date.now()}`, type: 'system', content: `${name} joined`, createdAt: timestamp },
      ]);
    };
    const onLeft = ({ name, timestamp }) => {
      setMessages((prev) => [
        ...prev,
        { _id: `sys-${Date.now()}`, type: 'system', content: `${name} left`, createdAt: timestamp },
      ]);
    };

    socket.on('chat:message', onMessage);
    socket.on('chat:message_deleted', onDeleted);
    socket.on('chat:typing_update', onTyping);
    socket.on('chat:user_joined', onJoined);
    socket.on('chat:user_left', onLeft);

    return () => {
      socket.off('chat:message', onMessage);
      socket.off('chat:message_deleted', onDeleted);
      socket.off('chat:typing_update', onTyping);
      socket.off('chat:user_joined', onJoined);
      socket.off('chat:user_left', onLeft);
    };
  }, [socket, tripId, currentUser]);

  // ─── Send a message ───────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (content) => {
      if (!content?.trim() || !socket) return;

      // Optimistic UI: add local copy immediately
      const optimistic = {
        _id: `opt-${Date.now()}`,
        tripId,
        sender: currentUser,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        optimistic: true,
      };
      setMessages((prev) => [...prev, optimistic]);

      // Emit to socket; server persists and broadcasts real message
      socket.emit('chat:send', {
        tripId,
        content: content.trim(),
        sender: currentUser,
      });

      // Stop typing indicator
      stopTyping();
    },
    [socket, tripId, currentUser]
  );

  // ─── Delete a message ─────────────────────────────────────────────────────
  const deleteMsg = useCallback(
    async (messageId) => {
      try {
        await apiDeleteMessage(tripId, messageId);
        socket?.emit('chat:delete', { tripId, messageId });
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      } catch {
        setError('Failed to delete message');
      }
    },
    [socket, tripId]
  );

  // ─── Typing helpers ───────────────────────────────────────────────────────
  const startTyping = useCallback(() => {
    if (!socket || isTypingRef.current) return;
    isTypingRef.current = true;
    socket.emit('chat:typing_start', { tripId, name: currentUser.name });

    // Auto-stop after timeout
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(stopTyping, TYPING_TIMEOUT);
  }, [socket, tripId, currentUser]);

  const stopTyping = useCallback(() => {
    if (!socket || !isTypingRef.current) return;
    isTypingRef.current = false;
    clearTimeout(typingTimerRef.current);
    socket.emit('chat:typing_stop', { tripId });
  }, [socket, tripId]);

  return {
    messages,
    typingUsers,
    isLoading,
    error,
    hasMore,
    loadMore,
    sendMessage,
    deleteMsg,
    startTyping,
    stopTyping,
  };
};

export default useChat;