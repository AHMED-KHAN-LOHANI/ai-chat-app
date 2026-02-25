const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Chat route
app.post("/chat", (req, res) => {
  const userMessage = req.body.message;

  console.log("Message received:", userMessage);

  // Fake AI response for now
  const aiResponse = `You said: ${userMessage}`;

  res.json({ reply: aiResponse });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});