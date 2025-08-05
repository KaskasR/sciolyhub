// index.js
const express = require("express");
const cors = require("cors");
const XLSX = require("xlsx");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.send("Backend is running!");
});

// Endpoint to get random quotes for Aristocrat cipher
app.get("/api/quotes", (req, res) => {
  try {
    const workbook = XLSX.readFile(path.join(__dirname, "../codebusters_files/English_Quotes.xlsx"));
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Filter out the first 10 rows as requested (they are bad quotes)
    // Note: sheet_to_json already excludes the header row
    const goodQuotes = data.slice(10).map(row => ({
      author: Object.values(row)[0], // Column A
      quote: Object.values(row)[1]   // Column B
    })).filter(item => item.author && item.quote); // Filter out empty rows
    
    res.json({ quotes: goodQuotes });
  } catch (error) {
    console.error("Error reading quotes file:", error);
    res.status(500).json({ 
      error: "Failed to load quotes",
      fallbackQuotes: [
        { author: "Albert Einstein", quote: "Imagination is more important than knowledge." },
        { author: "Maya Angelou", quote: "You will face many defeats in life, but never let yourself be defeated." },
        { author: "Winston Churchill", quote: "Success is not final, failure is not fatal: it is the courage to continue that counts." },
        { author: "Steve Jobs", quote: "Innovation distinguishes between a leader and a follower." },
        { author: "Nelson Mandela", quote: "The greatest glory in living lies not in never falling, but in rising every time we fall." }
      ]
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
