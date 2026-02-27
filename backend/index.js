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

// Chat route
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userMessage },
      ],
    });

    const aiReply = response.choices[0].message.content;

    res.json({ reply: aiReply });

  } catch (error) {
    console.error("Groq error:", error);
    res.status(500).json({ reply: "Error generating AI response" });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});