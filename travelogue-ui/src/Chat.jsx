import { useState, useEffect, useRef } from "react";
import { getMessages } from "../api/messages";
import { connectWS } from "../ws";

export default function Chat({ sessionId, memberId }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    getMessages(sessionId).then(d => setMessages(d.messages));

    wsRef.current = connectWS(sessionId, memberId, (event) => {
      if (event.type === "chat_message") {
        setMessages(prev => [...prev, event]);
      }
    });

    return () => wsRef.current?.close();
  }, [sessionId, memberId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    wsRef.current?.send(JSON.stringify({ type: "chat_message", text: inputText }));
    setInputText("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>

      {/* Message list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                width: 10, height: 10,
                borderRadius: "50%",
                backgroundColor: msg.color,
                display: "inline-block"
              }} />
              <strong style={{ fontSize: "13px" }}>{msg.display_name}</strong>
              <span style={{ fontSize: "11px", color: "#999" }}>
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
            <p style={{ margin: "4px 0 0 16px", fontSize: "15px" }}>
              {msg.text}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        display: "flex", gap: "8px",
        padding: "12px 16px",
        borderTop: "1px solid #eee"
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          style={{
            flex: 1, padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "15px"
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            backgroundColor: "#3A7CA5",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "15px"
          }}
        >
          Send
        </button>
      </div>

    </div>
  );
}