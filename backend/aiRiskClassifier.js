import OpenAI from "openai";

console.log("🔑 OPENAI KEY:", process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getTherapyResponse(message, conversationHistory = []) {
  const systemPrompt = `
You are a warm, calm, supportive mental health companion.
You speak like a real human therapist, not a robot.

How you speak:
- Natural, conversational, gentle
- Reflect feelings in your own words
- Ask ONE thoughtful question at a time
- Avoid repeating phrases like "I hear you"
- Avoid generic therapy clichés

Your role:
- Offer emotional support and grounding
- Encourage hope without dismissing pain
- Never give medical advice
- Never encourage self-harm

You must ALSO assess risk privately.

Return ONLY valid JSON in this exact format:
{
  "reply": "natural, human response",
  "risk": "LOW | MEDIUM | HIGH"
}

No extra text. No explanations. No markdown.
`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: message },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.8,

      // 🔒 THIS IS THE KEY FIX
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0].message.content;

    console.log("🧠 RAW CHATGPT JSON:", raw);

    return JSON.parse(raw);
  } catch (error) {
    console.error("❌ AI therapy error:", error);

    return {
      reply: "I’m here with you. Take your time — what’s been going on lately?",
      risk: "LOW",
    };
  }
}
