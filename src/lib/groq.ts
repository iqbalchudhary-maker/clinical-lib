import Groq from "groq-sdk";

// Client ko initialize karein (API Key .env file se uthayega)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function callGroqAI(message: string) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are an expert Clinical Agent for Glow Aesthetic Clinic. Be professional." },
        { role: "user", content: message }
      ],
    });

    return completion.choices[0]?.message?.content;
  } catch (error) {
    console.error("Groq API Error:", error);
    return null;
  }
}