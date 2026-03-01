import { useState, useRef, useEffect } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const sendMessage = async () => {
    if (message.trim() === "") return;

    const userMessage = { text: message, sender: "user" };
    setChat((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
     const response = await fetch(
  "https://ai-chat-app-ba6r.onrender.com/chat",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  }
); 
      const data = await response.json();
      setChat((prev) => [...prev, { text: data.reply, sender: "ai" }]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        { text: "Error contacting server", sender: "ai" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",        // ✅ changed from minHeight to height
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#212121",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        

        {/* Chat Area */}
        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    borderBottom: "1px solid #333",
    flexShrink: 0,
  }}
>
  <h2 style={{ margin: 0 }}>AI Chat App</h2>

  <button
    onClick={async () => {
      await fetch("https://ai-chat-app-ba6r.onrender.com/reset", {
        method: "POST",
      });
      setChat([]);
    }}
    style={{
      padding: "6px 12px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "#ff4d4d",
      color: "white",
      cursor: "pointer",
    }}
  >
    Clear Chat
  </button>
</div>
        <div
          style={{
            flex: 1,
            height: 0,         // ✅ key fix: allows flex + overflow-y to work correctly
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {chat.map((msg, index) => (
            <div
              key={index}
              style={{
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                backgroundColor: msg.sender === "user" ? "#007bff" : "#2f2f2f",
                padding: "10px 15px",
                borderRadius: "15px",
                marginBottom: "10px",
                maxWidth: "75%",
                wordWrap: "break-word",
              }}
            >
              {msg.text}
            </div>
          ))}

          {loading && (
            <div
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#2f2f2f",
                padding: "10px 15px",
                borderRadius: "15px",
                marginBottom: "10px",
              }}
            >
              AI is thinking...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Section */}
        <div
          style={{
            display: "flex",
            padding: "15px",
            borderTop: "1px solid #333",
            gap: "10px",
            flexShrink: 0,   // ✅ prevent input bar from shrinking
          }}
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              outline: "none",
              backgroundColor: "#2f2f2f",
              color: "white",
            }}
          />

          <button
            onClick={sendMessage}
            style={{
              padding: "12px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#007bff",
              color: "white",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;