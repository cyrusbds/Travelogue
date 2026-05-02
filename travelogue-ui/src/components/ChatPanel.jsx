// components/ChatPanel.jsx

import React, { useState } from "react";
import GroupChat from "./GroupChat";
import PackingChecklist from "./PackingChecklist";
import VotingPanel from "./VotingPanel";
import "./ChatPanel.css";

const TABS = [
  { id: "chat", label: "💬 Chat" },
  { id: "checklist", label: "🧳 Packing" },
  { id: "votes", label: "🗳 Votes" },
];

/**
 * Props:
 *  - socket: the Socket.IO client instance from SocketContext
 *  - tripId: current trip's MongoDB _id string
 *  - currentUser: { userId, name, isGuest, guestId }
 */
const ChatPanel = ({ socket, tripId, currentUser }) => {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="chat-panel">
      {/* Tab navigation */}
      <div className="chat-panel-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`chat-panel-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="chat-panel-body">
        {activeTab === "chat" && (
          <GroupChat
            socket={socket}
            tripId={tripId}
            currentUser={currentUser}
          />
        )}
        {activeTab === "checklist" && (
          <PackingChecklist
            socket={socket}
            tripId={tripId}
            currentUser={currentUser}
          />
        )}
        {activeTab === "votes" && (
          <VotingPanel
            socket={socket}
            tripId={tripId}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
