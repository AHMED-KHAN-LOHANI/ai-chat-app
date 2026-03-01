require("dotenv").config();
const Groq = require("groq-sdk");
const express = require("express");
const cors = require("cors");

const app = express();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.use(cors());
app.use(express.json());
let conversationHistory = [
  { role: "system", content: "You are a helpful assistant." }
];

// Chat route
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  // Add user message to history
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

    // Add AI reply to history
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
app.post("/reset", (req, res) => {
  conversationHistory = [
    { role: "system", content: "You are a helpful assistant." }
  ];

  res.json({ message: "Conversation reset successfully" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});