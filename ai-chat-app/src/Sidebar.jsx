import React from "react";

function Sidebar({ onNewChat, chatHistory }) {
  return (
    <div style={{
      width: "260px",
      backgroundColor: "#171717",
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid #333",
    }}>
      <div style={{ padding: "15px" }}>
        <h3 style={{ color: "white", margin: "0 0 15px 0", fontSize: "16px" }}>AI Chat App</h3>
        <button
          onClick={onNewChat}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #444",
            backgroundColor: "transparent",
            color: "white",
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a2a2a")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <span style={{ fontSize: "18px", fontWeight: "bold" }}>+</span> New Chat
        </button>
      </div>

      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "0 15px",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}>
        <h4 style={{
          color: "#888",
          fontSize: "12px",
          textTransform: "uppercase",
          marginTop: "20px",
          marginBottom: "10px",
          fontWeight: "600",
        }}>
          Recent Chats
        </h4>

        {chatHistory.filter((msg) => msg.sender === "user").length === 0 ? (
          <p style={{ color: "#555", fontSize: "13px" }}>No recent chats yet.</p>
        ) : (
          chatHistory
            .filter((msg) => msg.sender === "user")
            .map((msg, index) => (
              <div
                key={index}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  color: "#ccc",
                  cursor: "pointer",
                  fontSize: "13px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginBottom: "5px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a2a2a")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {msg.text}
              </div>
            ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;