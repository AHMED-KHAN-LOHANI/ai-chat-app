import { useState, useRef, useEffect } from "react";
import Auth from "./Auth";
import Sidebar from "./Sidebar";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState(localStorage.getItem("email"));
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(Date.now().toString());
  const [sessions, setSessions] = useState([]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  // Load session history on login
  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const res = await fetch("https://ai-chat-app-ba6r.onrender.com/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
        }
      } catch (err) {
        console.log("History fetch error:", err);
      }
    };
    fetchHistory();
  }, [token]);

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
    setSessions([]);
  };

  const handleNewChat = async () => {
    const newSessionId = Date.now().toString();
    setSessionId(newSessionId);
    setChat([]);

    await fetch("https://ai-chat-app-ba6r.onrender.com/reset", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  // Load a past session when clicked in sidebar
  const handleLoadSession = async (sid) => {
    try {
      const res = await fetch(`https://ai-chat-app-ba6r.onrender.com/session/${sid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessionId(data.sessionId);
        // Convert MongoDB format to UI format
        const converted = data.messages.map((m) => ({
          text: m.content,
          sender: m.role === "user" ? "user" : "ai",
        }));
        setChat(converted);
      }
    } catch (err) {
      console.log("Load session error:", err);
    }
  };

  const sendMessage = async () => {
    if (message.trim() === "") return;

    const userMessage = { text: message, sender: "user" };
    setChat((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("https://ai-chat-app-ba6r.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message, sessionId }),
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      setChat((prev) => [...prev, { text: data.reply, sender: "ai" }]);

      // Add to sessions list if it's a new session
      setSessions((prev) => {
        const exists = prev.find((s) => s.sessionId === sessionId);
        if (!exists) {
          return [{ sessionId, title: message.slice(0, 40), messages: [] }, ...prev];
        }
        return prev;
      });

    } catch (error) {
      setChat((prev) => [...prev, { text: "Error contacting server", sender: "ai" }]);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <Auth onLogin={handleLogin} />;

  return (
    <div style={{ height: "100vh", display: "flex", backgroundColor: "#212121", color: "white", fontFamily: "Arial, sans-serif" }}>

      <Sidebar
        onNewChat={handleNewChat}
        sessions={sessions}
        onLoadSession={handleLoadSession}
        currentSessionId={sessionId}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", borderBottom: "1px solid #333", flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: "18px" }}>AI Chat App</h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#aaa" }}>{email}</span>
            <button onClick={handleLogout} style={{ padding: "6px 12px", borderRadius: "6px", border: "none", backgroundColor: "#555", color: "white", cursor: "pointer", fontSize: "13px" }}>
              Logout
            </button>
          </div>
        </div>

        <div style={{ flex: 1, height: 0, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column" }}>
          {chat.length === 0 && (
            <div style={{ textAlign: "center", color: "#555", marginTop: "100px", fontSize: "16px" }}>
              Start a conversation...
            </div>
          )}
          {chat.map((msg, index) => (
            <div key={index} style={{ alignSelf: msg.sender === "user" ? "flex-end" : "flex-start", backgroundColor: msg.sender === "user" ? "#007bff" : "#2f2f2f", padding: "10px 15px", borderRadius: "15px", marginBottom: "10px", maxWidth: "75%", wordWrap: "break-word", lineHeight: "1.5" }}>
              {msg.text}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: "flex-start", backgroundColor: "#2f2f2f", padding: "10px 15px", borderRadius: "15px", marginBottom: "10px", color: "#aaa" }}>
              AI is thinking...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div style={{ display: "flex", padding: "15px 20px", borderTop: "1px solid #333", gap: "10px", flexShrink: 0 }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
            placeholder="Type a message..."
            style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", outline: "none", backgroundColor: "#2f2f2f", color: "white", fontSize: "14px" }}
          />
          <button onClick={sendMessage} style={{ padding: "12px 18px", borderRadius: "8px", border: "none", backgroundColor: "#007bff", color: "white", cursor: "pointer", fontSize: "14px" }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;