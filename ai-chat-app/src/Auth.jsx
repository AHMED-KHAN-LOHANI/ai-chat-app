import { useState } from "react";

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setMessage("Please enter email and password");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setMessage("");

    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    try {
      const response = await fetch(
        `https://ai-chat-app-ba6r.onrender.com${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Something went wrong");
        return;
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);
        onLogin(data.token, data.email);
      } else {
        setMessage("Account created! Please login.");
        setIsLogin(true);
      }

    } catch (error) {
      setMessage("Error contacting server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#212121",
      color: "white",
      fontFamily: "Arial, sans-serif",
    }}>
      <div style={{
        backgroundColor: "#2f2f2f",
        padding: "40px",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 0 30px rgba(0,0,0,0.5)",
      }}>
        <h2 style={{ marginBottom: "8px", textAlign: "center" }}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        <p style={{
          textAlign: "center",
          color: "#aaa",
          marginBottom: "24px",
          fontSize: "14px"
        }}>
          {isLogin ? "Login to continue chatting" : "Register to get started"}
        </p>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "8px",
            border: "1px solid #444",
            backgroundColor: "#1e1e1e",
            color: "white",
            boxSizing: "border-box",
            fontSize: "14px",
          }}
        />

        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "16px",
            borderRadius: "8px",
            border: "1px solid #444",
            backgroundColor: "#1e1e1e",
            color: "white",
            boxSizing: "border-box",
            fontSize: "14px",
          }}
        />

        {message && (
          <p style={{
            color: message.includes("created") ? "#4CAF50" : "#ff4d4d",
            marginBottom: "12px",
            fontSize: "14px",
            textAlign: "center",
          }}>
            {message}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: loading ? "#555" : "#007bff",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "16px",
            fontSize: "15px",
            fontWeight: "bold",
          }}
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
        </button>

        <p
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage("");
          }}
          style={{
            textAlign: "center",
            cursor: "pointer",
            color: "#007bff",
            fontSize: "14px",
          }}
        >
          {isLogin ? "No account? Register here" : "Already have account? Login"}
        </p>
      </div>
    </div>
  );
}

export default Auth;