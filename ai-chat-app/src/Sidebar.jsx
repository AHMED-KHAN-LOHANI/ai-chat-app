import React from "react";

function Sidebar({ onNewChat, sessions, onLoadSession, currentSessionId }) {
  return (
    <div style={{ width: "260px", backgroundColor: "#171717", display: "flex", flexDirection: "column", borderRight: "1px solid #333" }}>

      <div style={{ padding: "15px" }}>
        <h3 style={{ color: "white", margin: "0 0 12px 0", fontSize: "15px" }}>AI Chat App</h3>
        <button
          onClick={onNewChat}
          style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #444", backgroundColor: "transparent", color: "white", cursor: "pointer", textAlign: "left", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a2a2a")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          + New Chat
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 10px", scrollbarWidth: "none" }}>
        <p style={{ color: "#666", fontSize: "11px", textTransform: "uppercase", padding: "0 5px", marginBottom: "8px", letterSpacing: "0.5px" }}>
          Recent Chats
        </p>

        {sessions.length === 0 ? (
          <p style={{ color: "#555", fontSize: "13px", padding: "0 5px" }}>No chats yet.</p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.sessionId}
              onClick={() => onLoadSession(session.sessionId)}
              style={{
                padding: "10px",
                borderRadius: "6px",
                color: session.sessionId === currentSessionId ? "white" : "#ccc",
                backgroundColor: session.sessionId === currentSessionId ? "#2a2a2a" : "transparent",
                cursor: "pointer",
                fontSize: "13px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginBottom: "4px",
                borderLeft: session.sessionId === currentSessionId ? "2px solid #007bff" : "2px solid transparent",
              }}
              onMouseEnter={(e) => { if (session.sessionId !== currentSessionId) e.currentTarget.style.backgroundColor = "#222"; }}
              onMouseLeave={(e) => { if (session.sessionId !== currentSessionId) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {session.title || "New Chat"}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;