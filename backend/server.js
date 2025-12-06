const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- UPDATED CORS CONFIGURATION ---
// This allows your Vercel app to talk to this server
app.use(cors({
    origin: [
        "https://recovery-road.vercel.app", // Your Vercel URL
        "http://localhost:3000"        // Your local testing URL           
    ],
    methods: ["GET", "POST"],
    credentials: true
}));

// Increase limit to handle multiple high-res image chunks
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 3001;

// --- 1. ANALYSIS ENDPOINT (Timeline) ---
app.post('/api/analyze', async (req, res) => {
  try {
    const { images } = req.body;

    if (!images || images.length === 0) {
      return res.status(400).json({ error: 'No documents provided' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [
              { text: `SYSTEM_PROMPT: You are a strict Retrieval-Augmented Generation (RAG) agent for medical discharge summaries. 
              
              CONTEXT: The following images are the ONLY source of truth. 
              
              TASK: Extract a structured recovery plan.
              
              RULES:
              1. Answer ONLY using the provided document context. If information is missing, do not invent it.
              2. CITATIONS: For every task, you MUST cite the specific page or section (e.g., "Source: Page 1, Meds Table").
              3. DO NOT UNROLL LOOPS: If a medication says "daily for 5 days", return a SINGLE task object with "duration_days": 5. Do not generate Day 1, Day 2... individually.
              4. START DAY: Assume all tasks start on Day 1 unless specified otherwise.
              
              OUTPUT FORMAT: Return a JSON array with this EXACT schema:
              [
                { 
                  "day": 1, 
                  "date": "Today", 
                  "status": "Acute Phase", 
                  "tasks": [
                    { 
                      "id": "t1", 
                      "type": "med", 
                      "title": "Amoxicillin", 
                      "desc": "500mg - Morning Dose", 
                      "time": "8:00 AM",
                      "duration_days": 5, 
                      "source_ref": "Page 1, Line 12",
                      "warnings": ["Take with food"]
                    }
                  ] 
                }
              ]
              
              Rules for 'type': Use 'med', 'wound', 'warning', 'appt', or 'movement'.
              Do not include markdown formatting.` },
              
              ...images.map(img => ({ inlineData: { mimeType: img.mimeType, data: img.data } }))
            ]
          }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1 
          }
        })
      }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
        let cleanJson = JSON.parse(text);
        if (!Array.isArray(cleanJson)) cleanJson = [cleanJson]; 
        cleanJson = cleanJson.map(day => ({
            ...day,
            tasks: Array.isArray(day.tasks) ? day.tasks : [] 
        }));
        res.json(cleanJson);
    } catch (parseError) {
        console.error("JSON Parse Failed:", text);
        res.status(500).json({ error: 'AI response was not valid JSON' });
    }

  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- 2. CHAT ENDPOINT (Q&A) ---
app.post('/api/chat', async (req, res) => {
  try {
    const { message, images } = req.body;

    // Validate inputs
    if (!images || images.length === 0) {
      console.log("Chat Error: No images found in request");
      return res.status(400).json({ error: 'No context documents provided. Please upload files first.' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [
              { text: `SYSTEM: You are a helpful medical recovery assistant. 
              CONTEXT: The user has provided their hospital discharge papers as images below.
              USER QUESTION: "${message}"
              INSTRUCTION: Answer the user's question based ONLY on the provided images. Be concise, empathetic, and clear. If the answer is not in the document, state that clearly.` },
              
              // Re-inject images as context for the chat
              ...images.map(img => ({ inlineData: { mimeType: img.mimeType, data: img.data } }))
            ]
          }]
        })
      }
    );

    if (!response.ok) {
        throw new Error(`Gemini Chat API Error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate an answer.";
    
    res.json({ answer });

  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Failed to get answer from AI. Check server logs." });
  }
});

app.listen(PORT, () => {
  console.log(`RAG Proxy server running on port ${PORT}`);
});