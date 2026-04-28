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
      }}>
        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
          {isLogin ? "Login" : "Register"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#1e1e1e",
            color: "white",
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#1e1e1e",
            color: "white",
            boxSizing: "border-box",
          }}
        />

        {message && (
          <p style={{ color: "#ff4d4d", marginBottom: "10px" }}>
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
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
            marginBottom: "12px",
          }}
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
        </button>

        <p
          onClick={() => setIsLogin(!isLogin)}
          style={{
            textAlign: "center",
            cursor: "pointer",
            color: "#007bff",
          }}
        >
          {isLogin ? "No account? Register" : "Have account? Login"}
        </p>
      </div>
    </div>
  );
}

export default Auth;