if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const Chat = require("./models/Chat");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Groq = require("groq-sdk");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB error:", err));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json());
app.use("/auth", authRoutes);

// Per-user memory: userId -> { sessionId, messages[] }
const userSessions = new Map();

function getSystemPrompt() {
  return [{ role: "system", content: "You are a helpful assistant." }];
}

// Chat route
app.post("/chat", async (req, res) => {
  const { message, sessionId } = req.body;
  const authHeader = req.headers.authorization;

  if (!message || message.trim() === "") {
    return res.status(400).json({ reply: "Message cannot be empty" });
  }

  let userId = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      console.log("Invalid token");
    }
  }

  // Get or create session for this user
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      sessionId: sessionId || Date.now().toString(),
      messages: getSystemPrompt(),
    });
  }

  const session = userSessions.get(userId);

  // If frontend sends a different sessionId, it's a new chat
  if (sessionId && sessionId !== session.sessionId) {
    userSessions.set(userId, {
      sessionId,
      messages: getSystemPrompt(),
    });
  }

  const currentSession = userSessions.get(userId);
  currentSession.messages.push({ role: "user", content: message });

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: currentSession.messages,
    });

    const aiReply = response.choices[0].message.content;
    currentSession.messages.push({ role: "assistant", content: aiReply });

    // Save to MongoDB
    if (userId) {
      try {
        let chat = await Chat.findOne({ userId, sessionId: currentSession.sessionId });
        if (!chat) {
          chat = new Chat({ userId, sessionId: currentSession.sessionId, messages: [] });
        }
        chat.messages.push({ role: "user", content: message });
        chat.messages.push({ role: "assistant", content: aiReply });
        await chat.save();
      } catch (dbErr) {
        console.log("DB save error:", dbErr);
      }
    }

    res.json({ reply: aiReply, sessionId: currentSession.sessionId });

  } catch (error) {
    console.error("Groq error:", error);
    res.status(500).json({ reply: "Error generating AI response" });
  }
});

// Reset — creates new session for this user
app.post("/reset", (req, res) => {
  const authHeader = req.headers.authorization;
  let userId = "guest";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {}
  }

  const newSessionId = Date.now().toString();
  userSessions.set(userId, {
    sessionId: newSessionId,
    messages: getSystemPrompt(),
  });

  res.json({ message: "New session started", sessionId: newSessionId });
});

// Get all sessions for logged-in user
app.get("/history", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const chats = await Chat.find({ userId: decoded.userId }).sort({ createdAt: -1 });

    // Return sessions with first user message as title
    const sessions = chats.map((chat) => {
      const firstUserMsg = chat.messages.find((m) => m.role === "user");
      return {
        sessionId: chat.sessionId,
        title: firstUserMsg ? firstUserMsg.content.slice(0, 40) : "New Chat",
        messages: chat.messages,
      };
    });

    res.json({ sessions });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Load a specific session
app.get("/session/:sessionId", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const chat = await Chat.findOne({
      userId: decoded.userId,
      sessionId: req.params.sessionId,
    });

    if (!chat) return res.status(404).json({ message: "Session not found" });

    // Load into memory so AI continues from this context
    userSessions.set(decoded.userId, {
      sessionId: chat.sessionId,
      messages: [
        getSystemPrompt()[0],
        ...chat.messages,
      ],
    });

    res.json({ messages: chat.messages, sessionId: chat.sessionId });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));