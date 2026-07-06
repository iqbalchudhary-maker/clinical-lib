import { NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';

export async function POST(req: Request) {
  try {
    // 1. Request body handle karna
    const body = await req.json();
    let userMessage = "";

    // 2. Universal Message Extraction (WhatsApp or Dashboard)
    // WhatsApp aur Dashboard dono ka data handle hoga
    if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body) {
      userMessage = body.entry[0].changes[0].value.messages[0].text.body;
    } else if (body.message) {
      userMessage = body.message;
    } else {
      return NextResponse.json({ reply: "No message detected." }, { status: 400 });
    }

    // 3. Reasoning Agent ko call karna
    // Ab saari database searching aur logic groq.ts handle karega
    const aiResponse = await callGroqAI(userMessage);

    // 4. Response return karna
    return NextResponse.json({ 
      reply: aiResponse, 
      status: "success" 
    });

  } catch (error) {
    console.error("[WEBHOOK_ERROR]:", error);
    return NextResponse.json({ 
      reply: "System error: Unable to process request.", 
      status: "error" 
    }, { status: 500 });
  }
}