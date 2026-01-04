console.log("🔥 CORRECT FILE IS RUNNING");

const express = require("express");
const app = express();
const PORT = 5000;

/* ==================== DATA ==================== */
console.log("🔥 DOCTORS VERSION LOADED");
// Conversation storage
let conversations = [];

// Escalated cases
let escalatedCases = [];

// Mock doctor database
let doctors = [
  {
    id: 1,
    name: "Dr. Ananya Sen",
    specialization: "Psychiatrist",
    city: "Kolkata",
    experience: "10 years",
    contact: "ananya.sen@hospital.com",
  },
  {
    id: 2,
    name: "Dr. Rahul Mehta",
    specialization: "Clinical Psychologist",
    city: "Delhi",
    experience: "8 years",
    contact: "rahul.mehta@clinic.com",
  },
  {
    id: 3,
    name: "Dr. Priya Nair",
    specialization: "Psychiatrist",
    city: "Bangalore",
    experience: "12 years",
    contact: "priya.nair@mentalcare.com",
  },
  {
    id: 4,
    name: "Dr. Souvik Das",
    specialization: "Counselling Psychologist",
    city: "Kolkata",
    experience: "6 years",
    contact: "souvik.das@wellness.com",
  },
];

// Keywords
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

// Health check
app.get("/", (req, res) => {
  res.send("SafeSpace backend is running");
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
  let doctorSuggestion = null;

  if (riskLevel === "MEDIUM" || riskLevel === "HIGH") {
    escalation = {
      notice: "This may need more professional support.",
      options: ["Continue chatting", "Talk to a trained professional"],
    };
  }

  if (riskLevel === "HIGH") {
    doctorSuggestion = {
      message:
        "Based on your responses, we recommend consulting a mental health professional.",
      endpoint: "/doctors",
    };
  }

  res.json({
    reply: botReply,
    riskScore,
    riskLevel,
    escalation,
    doctorSuggestion,
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

/* -------------------- DOCTOR LISTING -------------------- */

// Get all doctors or filter by city/specialization
app.get("/doctors", (req, res) => {
  const { city, specialization } = req.query;

  let result = doctors;

  if (city) {
    result = result.filter((d) => d.city.toLowerCase() === city.toLowerCase());
  }

  if (specialization) {
    result = result.filter(
      (d) => d.specialization.toLowerCase() === specialization.toLowerCase()
    );
  }

  res.json({
    total: result.length,
    doctors: result,
  });
});

/* -------------------- APPOINTMENT BOOKING (MOCK) -------------------- */

app.post("/book-appointment", (req, res) => {
  const { doctorId, userName } = req.body;

  const doctor = doctors.find((d) => d.id === doctorId);

  if (!doctor) {
    return res.status(404).json({
      message: "Doctor not found",
    });
  }

  res.json({
    message: "Appointment request sent successfully",
    doctor: doctor.name,
    user: userName,
    status: "PENDING (Mock)",
  });
});

/* ==================== SERVER ==================== */

app.get("/proof", (req, res) => {
  res.send("PROOF ROUTE WORKING");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
