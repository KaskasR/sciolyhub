// index.js
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Your API key goes in .env
});

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.send("SciOly Hub Backend is running! 🧬");
});

// Chat endpoint for SciBot
app.post("/api/chat", async (req, res) => {
  try {
    const { message, conversation = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: "OpenAI API key not configured on server" 
      });
    }

    // Prepare messages for OpenAI
    const messages = [
      {
        role: "system",
        content: `You are SciBot, a helpful Science Olympiad study assistant. You specialize in helping students with:
        - Science Olympiad events and competitions
        - Physics, Chemistry, Biology, Earth Science concepts
        - Study strategies and test-taking tips
        - Laboratory techniques and safety
        - Scientific problem-solving
        
        Keep responses helpful, engaging, and appropriate for high school students. Use emojis occasionally to make it fun! Always encourage scientific curiosity and learning. Keep responses concise but informative.`
      },
      // Include conversation history (last 10 messages to stay within token limits)
      ...conversation.slice(-10),
      {
        role: "user",
        content: message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Most cost-effective model
      messages: messages,
      max_tokens: 800, // Reasonable response length
      temperature: 0.7,
    });

    const botResponse = completion.choices[0]?.message?.content || "Sorry, I couldn't process that request.";

    res.json({ 
      response: botResponse,
      usage: completion.usage // Optional: track token usage
    });

  } catch (error) {
    console.error("OpenAI API Error:", error);

    if (error.code === 'insufficient_quota') {
      res.status(429).json({ error: "API quota exceeded. Please try again later." });
    } else if (error.code === 'rate_limit_exceeded') {
      res.status(429).json({ error: "Rate limit exceeded. Please try again in a moment." });
    } else if (error.status === 401) {
      res.status(500).json({ error: "Server configuration error. Please contact support." });
    } else {
      res.status(500).json({ error: "An error occurred processing your request." });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`OpenAI API Key configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
});
