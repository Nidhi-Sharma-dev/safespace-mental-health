import express from "express";
import { getTherapyResponse } from "./aiRiskClassifier.js";

console.log("🚀 SERVER LOGIC LOADED");

const app = express();
const PORT = 5000;

/* ==================== DATA ==================== */

let conversations = [];
let escalatedCases = [];

/* ==================== MIDDLEWARE ==================== */

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

/* ==================== ROUTES ==================== */

app.get("/", (req, res) => {
  res.send("SafeSpace backend is running");
});

/* -------------------- CHAT (AI ONLY) -------------------- */

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.json({
      reply: "I’m here with you. What’s on your mind?",
      riskLevel: "LOW",
    });
  }

  const conversationHistory = conversations.slice(-8).map((m) => ({
    role: m.sender === "user" ? "user" : "assistant",
    content: m.text,
  }));

  let aiResult;
  try {
    aiResult = await getTherapyResponse(userMessage, conversationHistory);
  } catch (err) {
    console.error("❌ AI ERROR:", err);
    return res.json({
      reply: "I’m here with you. Take your time.",
      riskLevel: "LOW",
    });
  }

  const { reply, risk } = aiResult;

  conversations.push(
    { sender: "user", text: userMessage, timestamp: new Date() },
    { sender: "bot", text: reply, timestamp: new Date() }
  );

  let escalation = null;

  if (risk === "HIGH") {
    escalation = {
      notice:
        "It sounds like you’re going through something really serious. You don’t have to face this alone.",
      options: ["Continue chatting", "Talk to a professional"],
    };
  }

  res.json({
    reply,
    riskLevel: risk,
    escalation,
  });
});

/* ==================== SERVER ==================== */

app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
