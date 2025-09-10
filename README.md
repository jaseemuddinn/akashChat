# AkashChat API Demo

A polished full-stack Next.js application demonstrating how to integrate with the AkashChat API to create an AI-powered chat interface.


## 🚀 Features

### Core Functionality

- **Real-time Chat Interface**: Clean, responsive chat UI with message history
- **AkashChat API Integration**: Direct integration with AkashChat's Llama AI models
- **Session Management**: Persistent conversation context across messages
- **Multiple Llama Models**: Support for Llama 3.1 8B, 70B, and 405B Instruct models

### Customization Options

- **Temperature Control**: Adjust AI creativity from focused to creative
- **System Prompts**: Customize AI behavior with custom instructions
- **Model Selection**: Choose between different Llama models
- **Session Control**: Generate new sessions to start fresh conversations

### Technical Features

- **Next.js App Router**: Modern React framework with server-side rendering
- **Tailwind CSS**: Beautiful, responsive styling
- **Environment Configuration**: Secure API key management
- **Error Handling**: Comprehensive error messages and fallbacks
- **TypeScript Ready**: Easy to convert to TypeScript if needed

## 📋 Prerequisites

- Node.js 18+ installed
- An AkashChat API key ([Get one here](https://chatapi.akash.network/))
- Basic knowledge of React/Next.js

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/jaseemuddinn/akashChat
   cd akashChat
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   AKASH_CHAT_API_KEY=your_actual_api_key_here
   AKASH_CHAT_BASE_URL=https://chatapi.akash.network/api/v1
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)


### Customizing AI Behavior

The application provides several ways to customize the AI's behavior:

1. **Temperature**: Controls randomness (0.0 = focused, 2.0 = very creative)
2. **Model Selection**: Choose between different AI models for varying capabilities

## 🎯 How It Works

### 1. Frontend (Chat Interface)

- User types a message in the input field
- Message is added to the conversation history
- Request is sent to `/api/chat` with message, session ID, and configuration

### 2. Backend (API Route)

- Validates the request and checks for API key
- Builds conversation context with system prompt and history
- Sends request to AkashChat API with user's configuration
- Returns AI response to the frontend

### 3. AkashChat API Integration

- Sends authenticated requests to AkashChat's endpoints
- Supports multiple AI models and parameters
- Maintains conversation context through session IDs
- Handles errors gracefully with detailed messages

## 🔍 API Reference

### POST /api/chat

Send a message to the AI and get a response.

**Request Body:**

```json
{
  "message": "Hello, how are you?",
  "sessionId": "session_abc123",
  "config": {
    "model": "gpt-4",
    "temperature": 0.7,
    "systemPrompt": "You are a helpful assistant."
  },
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

**Response:**

```json
{
  "response": "Hello! I'm doing well, thank you for asking.",
  "session_id": "session_abc123",
  "model": "gpt-4",
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 12,
    "total_tokens": 27
  }
}
```

## 🎨 Customization

### Adding New Models

Add new models to the sidebar component:

```javascript
<option value="new-model">New Model Name</option>
```


### Additional Features

- Add streaming responses for real-time typing effect
- Implement conversation saving/loading
- Add voice input/output capabilities
- Create conversation export functionality

## 🐛 Troubleshooting

### Common Issues

1. **"API key not configured" error**

   - Ensure `.env.local` exists and contains your API key
   - Restart the development server after adding environment variables

2. **"Failed to get response" error**

   - Check your API key is valid and has sufficient credits
   - Verify the AkashChat API is accessible from your network

3. **Styling issues**
   - Ensure Tailwind CSS is properly configured
   - Check the browser console for CSS errors

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

- [AkashChat Documentation](https://akash.network/docs/guides/machine-learning/akash-chat-api/)
- [AkashChat Community](https://discord.gg/akash)
- [Next.js Documentation](https://nextjs.org/docs)

---

Built with ❤️ using Next.js and AkashChat API
