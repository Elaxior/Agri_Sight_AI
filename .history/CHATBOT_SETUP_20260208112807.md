# 🤖 AI Chatbot Setup Guide

## Overview

The AgriDrone Analytics system now includes an intelligent AI chatbot powered by **LangChain** and **OpenAI GPT-3.5**. This chatbot provides real-time assistance by reading your project data and answering questions about:

- 🎯 Disease detection status
- 💰 Economic calculations and ROI
- 💊 Treatment recommendations
- 📊 Field status and configuration
- 🗺️ Spray path planning
- 📈 Historical trends

---

## 🚀 Quick Start

### 1. Install Dependencies

First, install the required Python packages:

```bash
cd drone_edge
pip install -r requirements.txt
```

This will install:
- `langchain` - LangChain framework
- `langchain-openai` - OpenAI integration
- `openai` - OpenAI API client
- `tiktoken` - Token counting
- Additional vector store libraries

### 2. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-...`)

### 3. Configure Environment

Add your OpenAI API key to `.env` file in the `drone_edge` directory:

```bash
# Copy example file if you don't have .env yet
cp .env.example .env
```

Edit `.env` and add:

```dotenv
OPENAI_API_KEY=sk-your-actual-api-key-here
```

⚠️ **Important**: Never commit your `.env` file to Git. It's already in `.gitignore`.

### 4. Start the Backend Server

```bash
cd drone_edge/src
python api_server.py
```

You should see:
```
🤖 Chatbot initialized successfully
🌐 Server: http://localhost:5000
```

### 5. Start the Frontend

```bash
cd frontend
npm start
```

The chatbot will appear as a floating button in the bottom-right corner of the Dashboard.

---

## 💬 Using the Chatbot

### Opening the Chat

1. Click the **purple circular button** with a chat icon in the bottom-right corner
2. The chat window will slide up with a welcome message

### Quick Actions

The chatbot includes quick action buttons for common queries:
- 📊 **Field Status** - Get current detection summary
- 💰 **ROI Calc** - Understand ROI calculations
- 💊 **Treatment** - Get treatment recommendations

### Sample Questions

Try asking:

**Detection Status:**
- "What is my current field status?"
- "How many disease zones are detected?"
- "Show me the latest detections"
- "What types of diseases were found?"

**Economic Analysis:**
- "Explain the ROI calculation"
- "How much money am I saving?"
- "What's the cost of treatment vs doing nothing?"
- "Is precision application worth it?"

**Treatment Recommendations:**
- "What treatment do you recommend?"
- "Should I spray the whole field or just infected zones?"
- "How urgent is treatment?"
- "What's the best spray pattern?"

**Technical Questions:**
- "How does the system work?"
- "What model is used for detection?"
- "What are the field dimensions?"
- "Explain the grid system"

---

## 🧠 How It Works

### Architecture

```
┌─────────────────┐
│  React Frontend │
│   (ChatBot.jsx) │
└────────┬────────┘
         │ HTTP POST /chat
         │
┌────────▼────────┐
│  Flask API      │
│ (api_server.py) │
└────────┬────────┘
         │
┌────────▼────────────┐
│  LangChain Service  │
│ (chatbot_service.py)│
└────────┬────────────┘
         │
    ┌────┴─────┐
    │          │
┌───▼──┐   ┌──▼───────┐
│OpenAI│   │Project   │
│GPT-3.5│   │Data:     │
└──────┘   │-Detections│
           │-Config    │
           │-Economics │
           └───────────┘
```

### Data Sources

The chatbot reads from:

1. **Real-time Detections** (Firebase or local JSON)
   - Current disease zones
   - GPS coordinates
   - Confidence scores
   
2. **Field Configuration** (config.yaml)
   - Area dimensions
   - Grid cell size
   - GPS location

3. **Economic Calculations** (calculated on-demand)
   - Treatment costs
   - Yield protection
   - ROI metrics

4. **System State**
   - Active session ID
   - Analysis status
   - Data source (Firebase/local)

### Context Window

The chatbot maintains:
- ✅ Last 10 messages in conversation
- ✅ Current project state snapshot
- ✅ System prompt with domain knowledge
- ⏳ Future: Vector store for long-term memory

---

## ⚙️ Configuration

### Model Selection

Edit `chatbot_service.py` to change the OpenAI model:

```python
self.llm = ChatOpenAI(
    model="gpt-3.5-turbo",  # or "gpt-4", "gpt-4-turbo"
    temperature=0.7,
    openai_api_key=api_key
)
```

**Models:**
- `gpt-3.5-turbo` - Fast, cost-effective (recommended)
- `gpt-4` - Most capable, slower, more expensive
- `gpt-4-turbo` - Balance of speed and capability

### Temperature

Controls randomness (0-1):
- `0.0` - Deterministic, factual responses
- `0.7` - Balanced (recommended)
- `1.0` - More creative, varied responses

### Cost Considerations

**GPT-3.5-turbo pricing** (as of 2024):
- Input: $0.0015/1K tokens
- Output: $0.002/1K tokens

Typical chat interaction:
- Question: ~100 tokens
- Project context: ~500 tokens
- Response: ~200 tokens
- **Total cost per message: ~$0.0016** (less than 0.2 cents)

---

## 🔧 Troubleshooting

### "OpenAI API Key not found"

**Symptom:** Chatbot returns error about missing API key

**Solution:**
1. Check `.env` file exists in `drone_edge/` directory
2. Verify `OPENAI_API_KEY=sk-...` is set correctly
3. Restart the Flask server
4. Check no extra spaces around the key

### "Failed to load welcome message"

**Symptom:** Chat opens but shows error

**Solution:**
1. Verify backend is running: `http://localhost:5000/chat/welcome`
2. Check browser console for CORS errors
3. Ensure Flask server started successfully
4. Try clearing browser cache

### "Connection refused"

**Symptom:** Cannot send messages

**Solution:**
1. Confirm Flask server is running (check terminal)
2. Visit `http://localhost:5000/mode` in browser
3. Check firewall isn't blocking port 5000
4. Restart both frontend and backend

### "Rate limit exceeded"

**Symptom:** OpenAI API error

**Solution:**
1. You've exceeded OpenAI API quota
2. Check usage: https://platform.openai.com/usage
3. Add payment method or wait for quota reset
4. Implement rate limiting in production

### "Invalid API key"

**Symptom:** OpenAI authentication error

**Solution:**
1. Verify key starts with `sk-`
2. Check key hasn't expired
3. Generate a new key from OpenAI dashboard
4. Update `.env` file

---

## 🚀 Advanced Features

### Custom System Prompt

Edit the system prompt in `chatbot_service.py` to customize chatbot behavior:

```python
def _build_system_prompt(self) -> str:
    return """Your custom instructions here..."""
```

### Adding Tools

Extend chatbot capabilities with LangChain tools:

```python
from langchain.agents import Tool

tools = [
    Tool(
        name="Weather",
        func=get_weather_data,
        description="Get current weather for spray planning"
    ),
    # Add more tools...
]
```

### Vector Store (Future)

For large knowledge bases, add vector storage:

```python
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings

# Create embeddings from documentation
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(docs, embeddings)
```

---

## 📊 API Endpoints

### POST /chat

Send a message to the chatbot.

**Request:**
```json
{
  "message": "What is my current field status?",
  "history": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi! How can I help?"}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "Based on current analysis, you have 24 disease zones detected covering approximately 0.48 hectares...",
  "timestamp": "2026-02-08T10:30:00Z",
  "context_data": {
    "detections_count": 24,
    "data_source": "firebase"
  }
}
```

### GET /chat/welcome

Get welcome message with system status.

**Response:**
```json
{
  "success": true,
  "message": "👋 Welcome to AgriDrone Analytics Support!\n\n📊 Current Status: 24 disease zones detected\n\nAsk me anything!",
  "timestamp": "2026-02-08T10:30:00Z"
}
```

---

## 🎨 UI Customization

### Colors

Edit `ChatBot.css` to match your brand:

```css
.chat-toggle-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Change to your colors */
}
```

### Position

Move chatbot to different corner:

```css
.chatbot-container {
  bottom: 20px;
  right: 20px;  /* Change to left: 20px; for left side */
}
```

### Size

Adjust chat window dimensions:

```css
.chat-window {
  width: 400px;   /* Increase for wider window */
  height: 600px;  /* Increase for taller window */
}
```

---

## 📝 Best Practices

### 1. Context Management
- Keep conversations focused on current session
- Clear chat when starting new analysis
- Provide specific questions for better answers

### 2. Cost Optimization
- Use GPT-3.5 for general queries
- Upgrade to GPT-4 only for complex analysis
- Implement caching for repeated questions

### 3. Privacy
- Never share API keys in code or screenshots
- Use environment variables for all secrets
- Rotate API keys regularly

### 4. User Experience
- Quick actions for common tasks
- Clear error messages
- Loading indicators during API calls
- Conversation history for context

---

## 🔮 Future Enhancements

**Planned Features:**
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Direct actions (e.g., "Start analysis")
- [ ] Report generation via chat
- [ ] Historical data queries
- [ ] Predictive recommendations
- [ ] Integration with weather APIs
- [ ] SMS/WhatsApp notifications

---

## 📚 Resources

- [LangChain Documentation](https://python.langchain.com/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [OpenAI Pricing](https://openai.com/pricing)
- [GPT Best Practices](https://platform.openai.com/docs/guides/gpt-best-practices)

---

## 🤝 Support

If you encounter issues:

1. Check this guide first
2. Review error messages in browser console
3. Check Flask server logs
4. Verify API key and environment variables
5. Test endpoints directly with curl/Postman

**Need help?** Contact the development team or open an issue on GitHub.

---

**Last Updated:** February 8, 2026  
**Version:** 1.0.0
