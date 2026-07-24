"use server";
import { db } from "@/db";
import { chatSessions, chatMessages } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireRole } from "./auth";

export async function getOrCreateChatSession() {
  const user = await requireRole(["student", "teacher"]);
  
  // Try to find the latest active session, for simplicity just the most recent one
  const sessions = await db.select().from(chatSessions).where(eq(chatSessions.userId, user.id));
  
  if (sessions.length > 0) {
    // Return the first one or we could sort by date
    return sessions[sessions.length - 1].id;
  }
  
  const newSession = await db.insert(chatSessions).values({
    userId: user.id
  }).returning();
  
  return newSession[0].id;
}

export async function getChatHistory(sessionId: string) {
  await requireRole(["student", "teacher"]);
  return db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(asc(chatMessages.createdAt));
}

export async function sendMessage(sessionId: string, message: string) {
  const user = await requireRole(["student", "teacher"]);
  
  // 1. Save user message
  await db.insert(chatMessages).values({
    sessionId,
    sender: "user",
    messageText: message
  });
  
  // 2. Fetch history for context
  const history = await getChatHistory(sessionId);
  const formattedHistory = history.map(m => ({
    role: m.sender === "user" ? "user" : "assistant",
    content: m.messageText
  }));
  
  // System prompt
  const systemPrompt = {
    role: "system",
    content: "Anda adalah asisten AI yang ramah dan ahli dalam bidang dasar kelistrikan dan elektronika. Berikan penjelasan yang mudah dipahami oleh siswa SMK/SMA, gunakan analogi yang relevan."
  };
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-super-120b-a12b:free",
        messages: [systemPrompt, ...formattedHistory]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;
    
    // 3. Save AI message
    await db.insert(chatMessages).values({
      sessionId,
      sender: "ai",
      messageText: aiMessage
    });
    
    return { success: true, response: aiMessage };
  } catch (error) {
    console.error("Chatbot Error:", error);
    
    // Fallback error message
    const errorMsg = "Maaf, sistem AI sedang mengalami gangguan. Silakan coba beberapa saat lagi.";
    await db.insert(chatMessages).values({
      sessionId,
      sender: "ai",
      messageText: errorMsg
    });
    
    return { success: false, error: errorMsg };
  }
}
