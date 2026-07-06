import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function callGroqAI(message: string) {
  try {
    // 1. Saari 7 tables se data fetch karna
    const [staff, kb, courses, fees, results, rules, admissions] = await Promise.all([
      (prisma as any).staff.findMany(),
      (prisma as any).knowledgeBase.findMany(),
      (prisma as any).course.findMany(),
      (prisma as any).feeStructure.findMany(),
      (prisma as any).studentResult.findMany({ take: 20 }), // Results par limit taake context overflow na ho
      (prisma as any).rulesRegulation.findMany(),
      (prisma as any).admission.findMany({ take: 10 })
    ]);

    // 2. Data ko structured format mein convert karna
    const context = `
      INTERNAL COLLEGE DATA:
      - Staff Directory: ${JSON.stringify(staff)}
      - FAQs & Knowledge: ${JSON.stringify(kb)}
      - Available Courses: ${JSON.stringify(courses)}
      - Fee Structures: ${JSON.stringify(fees)}
      - Recent Student Results: ${JSON.stringify(results)}
      - College Rules & Regulations: ${JSON.stringify(rules)}
      - Recent Admissions: ${JSON.stringify(admissions)}
    `;

    // 3. Reasoning Agent (Using 70b model for high logic)
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { 
          role: "system", 
          content: `You are the lead AI Agent for Uswa College Bhowana. 
          Your goal is to provide accurate, data-backed answers using the PROVIDED CONTEXT.
          - Use Staff data to identify faculty.
          - Use Course and Fee data to answer admission queries.
          - Use Results data to answer specific student queries (if roll number matches).
          - Be professional, polite, and persuasive.
          - If the user is interested in admission, ask for their name and phone number to assist them.
          - If information is not in the data, politely suggest calling 0301-0637955.
          Context: ${context}` 
        },
        { role: "user", content: message }
      ],
      temperature: 0.2, // Reasoning ke liye low temperature
    });

    return completion.choices[0]?.message?.content;
  } catch (error) {
    console.error("Groq Reasoning Error:", error);
    return "Maazrat, system abhi data process nahi kar pa raha. Baraye meherbani office se rabta karein.";
  }
}