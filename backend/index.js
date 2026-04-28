if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const Groq = require("groq-sdk");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB error:", err));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
}));
app.use(express.json());

// Auth routes
app.use("/auth", authRoutes);

let conversationHistory = [
  { role: "system", content: "You are a helpful assistant." }
];

// Chat route
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage || userMessage.trim() === "") {
    return res.status(400).json({ reply: "Message cannot be empty" });
  }

  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: conversationHistory,
    });

    const aiReply = response.choices[0].message.content;

    conversationHistory.push({
      role: "assistant",
      content: aiReply,
    });

    res.json({ reply: aiReply });

  } catch (error) {
    console.error("Groq error:", error);
    res.status(500).json({ reply: "Error generating AI response" });
  }
});

// Reset route
app.post("/reset", (req, res) => {
  conversationHistory = [
    { role: "system", content: "You are a helpful assistant." }
  ];
  res.json({ message: "Conversation reset successfully" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});