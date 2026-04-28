import { useState, useRef, useEffect } from "react";
import Auth from "./Auth";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState(localStorage.getItem("email"));
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const handleLogin = (newToken, userEmail) => {
    setToken(newToken);
    setEmail(userEmail);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setToken(null);
    setEmail(null);
    setChat([]);
  };

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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message }),
        }
      );

      if (!response.ok) throw new Error("Server error");

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

  if (!token) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      backgroundColor: "#212121",
      color: "white",
      fontFamily: "Arial, sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "900px",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px",
          borderBottom: "1px solid #333",
          flexShrink: 0,
        }}>
          <h2 style={{ margin: 0 }}>AI Chat App</h2>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#aaa" }}>{email}</span>

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
              Clear
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#555",
                color: "white",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div style={{
          flex: 1,
          height: 0,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}>
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
            <div style={{
              alignSelf: "flex-start",
              backgroundColor: "#2f2f2f",
              padding: "10px 15px",
              borderRadius: "15px",
              marginBottom: "10px",
            }}>
              AI is thinking...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Section */}
        <div style={{
          display: "flex",
          padding: "15px",
          borderTop: "1px solid #333",
          gap: "10px",
          flexShrink: 0,
        }}>
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