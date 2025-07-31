# SciBot - AI ChatBot Integration 🤖

Your SciOly Hub now includes **SciBot**, an AI-powered study assistant that can help with:

## 🧪 Features
- **Science Questions**: Get explanations for physics, chemistry, biology concepts
- **Competition Strategy**: Tips for Science Olympiad events and competitions  
- **Study Help**: Personalized study recommendations and test prep
- **24/7 Availability**: Chat anytime, anywhere
- **Science Olympiad Focus**: Specialized knowledge for SO events

## 🔧 Setup Instructions

### 1. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the key (starts with `sk-...`)

### 2. Configure API Key
**Option A: In the App (Recommended)**
1. Click on the **SciBot Assistant** card on your homepage
2. Enter your API key in the setup screen
3. Click "Save Key" - it's stored securely in your browser

**Option B: Environment Variable**
1. Add to your `.env` file:
   ```bash
   VITE_OPENAI_API_KEY=your_api_key_here
   ```

### 3. Start Chatting!
- Click the **Chat Now!** button on your homepage
- Ask questions like:
  - "Explain Newton's laws for the Physics event"
  - "Tips for the Chemistry Lab competition"
  - "How to prepare for Anatomy & Physiology"

## 💰 Cost Information
- Uses GPT-4o-mini (most cost-effective model)
- Typical cost: ~$0.001-0.005 per conversation
- You control your usage and costs
- API key is stored locally in your browser

## 🔒 Privacy & Security
- API key stored only in your browser's localStorage
- No API keys sent to our servers
- Direct communication with OpenAI
- You can clear your API key anytime

## 🎯 Example Questions to Try
```
"What are the key concepts for the Disease Detectives event?"
"Help me understand chemical equilibrium"
"What's the best way to memorize the periodic table?"
"Practice questions for Astronomy event"
"Lab safety tips for Chemistry Lab"
```

## 🛠️ Troubleshooting

**"Please set your API key first"**
- Click the gear icon ⚙️ and add your OpenAI API key

**"Rate limit exceeded"**  
- You've hit OpenAI's rate limit, wait a few minutes

**"API request failed: 401"**
- Invalid API key, check your key is correct

**"Having trouble connecting"**
- Check your internet connection
- Verify API key is valid

## 🚀 Advanced Usage
- Use shift+enter for multi-line messages
- Clear chat history with 🗑️ button
- Access API settings with ⚙️ button
- Responses are tailored for Science Olympiad context

---

Happy studying! 🧬🏆
