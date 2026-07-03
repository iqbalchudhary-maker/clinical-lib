import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { callGroqAI } from '@/lib/groq';

export async function POST(req: Request) {
  try {
    // 1. Request body handle karein
    const body = await req.json();
    let userMessage = "";

    // 2. Message extraction (WhatsApp vs Dashboard)
    if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body) {
      userMessage = body.entry[0].changes[0].value.messages[0].text.body;
    } else if (body.message) {
      userMessage = body.message;
    } else {
      return NextResponse.json({ reply: "No message detected." }, { status: 400 });
    }

    // 3. Database Search (Prisma)
    // Note: 'prisma.faq' use karein agar schema mein model ka naam 'faq' hai
   // TRY 1: Agar schema mein 'model FAQ' hai (uppercase)
const faq = await (prisma as any).FAQ.findFirst({
  where: {
    OR: [
      { question: { contains: userMessage.trim(), mode: 'insensitive' } },
      { keywords: { contains: userMessage.trim(), mode: 'insensitive' } }
    ]
  }
});
    let aiResponse = "";

    // 4. Logic Execution
    if (faq) {
      aiResponse = faq.answer;
    } else {
      // Groq AI call - Try-catch block handle karein
      try {
        const aiAnswer = await callGroqAI(userMessage);
        aiResponse = aiAnswer || "As an expert at Glow Aesthetic Clinic, I recommend a consultation. Shall I book one?";
      } catch (aiError) {
        console.error("Groq AI API Error:", aiError);
        aiResponse = "I am currently having trouble reasoning, but our specialists are available for a consultation. Would you like to book one?";
      }
    }

    // 5. Success Response
    return NextResponse.json({ 
      reply: aiResponse, 
      status: "success" 
    });

  } catch (error) {
    // 6. Global Error Handling
    console.error("[WEBHOOK_ERROR]:", error);
    return NextResponse.json({ 
      reply: "Sorry, I am having trouble connecting to our systems right now.", 
      status: "error" 
    }, { status: 500 });
  }
}