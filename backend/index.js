console.log("🔥 CORRECT FILE IS RUNNING");

const express = require("express");
const app = express();
const PORT = 5000;

/* ==================== DATA ==================== */

let conversations = [];
let escalatedCases = [];

const stressWords = ["stress", "overwhelmed", "tired", "burnt out"];
const anxietyWords = ["anxious", "anxiety", "panic", "worried"];
const lowMoodWords = ["sad", "low", "empty", "numb"];
const crisisWords = ["kill myself", "self harm", "suicide", "end it all"];

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

app.get("/test-escalate", (req, res) => {
  res.send("TEST ESCALATE ROUTE WORKING");
});

/* -------------------- CHAT -------------------- */

app.post("/chat", (req, res) => {
  const userMessage = req.body.message;

  let botReply = "I hear you. Tell me more.";
  let riskScore = 0;

  if (userMessage && typeof userMessage === "string") {
    const msg = userMessage.toLowerCase();

    conversations.push({
      text: userMessage,
      timestamp: new Date(),
    });

    if (stressWords.some((w) => msg.includes(w))) {
      riskScore += 1;
      botReply =
        "That sounds really overwhelming. What’s been causing this stress lately?";
    }

    if (anxietyWords.some((w) => msg.includes(w))) {
      riskScore += 2;
      botReply =
        "Anxiety can feel really heavy. Do you notice when it usually starts?";
    }

    if (lowMoodWords.some((w) => msg.includes(w))) {
      riskScore += 2;
      botReply =
        "I’m really sorry you’re feeling this way. Want to talk about what’s making you feel low?";
    }

    if (crisisWords.some((w) => msg.includes(w))) {
      riskScore += 5;
      botReply =
        "I’m really concerned about your safety. You don’t have to handle this alone.";
    }

    if (conversations.length >= 3) {
      riskScore += 1;
    }
  }

  let riskLevel = "LOW";
  if (riskScore >= 3 && riskScore < 6) riskLevel = "MEDIUM";
  if (riskScore >= 6) riskLevel = "HIGH";

  let escalation = null;
  if (riskLevel !== "LOW") {
    escalation = {
      notice: "This may need more support.",
      options: ["Continue chatting", "Talk to a professional"],
    };
  }

  res.json({
    reply: botReply,
    riskScore,
    riskLevel,
    escalation,
  });
});

/* -------------------- ESCALATE -------------------- */

app.post("/escalate", (req, res) => {
  escalatedCases.push({
    ...req.body,
    timestamp: new Date(),
  });

  res.json({
    status: "Escalation successful",
  });
});

/* -------------------- SERVER -------------------- */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
