# API Documentation

## AkashChat Integration

This document explains how the AkashChat API integration works in this demo application.

The AkashChat API is an open and permissionless Llama3 API powered by the Akash Supercloud. Access is available for absolutely free to anyone.

### Authentication

The application uses Bearer token authentication with API keys from https://chatapi.akash.network/:

```javascript
const response = await fetch(`${AKASH_CHAT_BASE_URL}/chat/completions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${AKASH_CHAT_API_KEY}`,
  },
  body: JSON.stringify(payload),
});
```

### Request Format

The API expects requests in OpenAI-compatible format:

```json
{
  "model": "Meta-Llama-3-1-8B-Instruct-FP8",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello!" }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

### Available Models

- `Meta-Llama-3-1-8B-Instruct-FP8` - Fast, efficient responses
- `Meta-Llama-3-1-70B-Instruct-FP8` - Balanced performance and quality
- `Meta-Llama-3-1-405B-Instruct-FP8` - Highest quality responses

### Response Format

The API returns responses in this format:

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      }
    }
  ],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 12,
    "total_tokens": 27
  }
}
```

### Error Handling

The application handles several types of errors:

1. **Missing API Key**: Returns 400 with configuration instructions
2. **Invalid API Key**: Returns 401 with authentication error
3. **Rate Limiting**: Returns 429 with retry instructions
4. **Server Errors**: Returns 500 with generic error message

### Session Management

Sessions are managed using unique identifiers that preserve conversation context:

- Each conversation gets a unique session ID
- Session IDs are passed with conversation history in messages array
- Users can generate new sessions to start fresh conversations
- Sessions help maintain conversation continuity through message context
