function Sidebar({ onNewChat }) {
  return (
    <div style={{
      width: "260px",
      backgroundColor: "#171717",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      padding: "16px",
      boxSizing: "border-box",
      flexShrink: 0,
    }}>

      {/* Title */}
      <h3 style={{
        color: "white",
        marginBottom: "20px",
        fontSize: "16px",
      }}>
        AI Chat App
      </h3>

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #444",
          backgroundColor: "transparent",
          color: "white",
          cursor: "pointer",
          marginBottom: "20px",
          textAlign: "left",
          fontSize: "14px",
        }}
      >
        + New Chat
      </button>

      {/* History placeholder */}
      <p style={{
        color: "#555",
        fontSize: "13px",
        textAlign: "center",
        marginTop: "20px",
      }}>
        Chat history coming soon
      </p>

    </div>
  );
}

export default Sidebar;