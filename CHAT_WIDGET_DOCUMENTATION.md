# EcoPilot Chat Widget Documentation

## Overview

The EcoPilot Chat Widget is an AI-powered conversational assistant that helps users understand their carbon footprint and provides personalized sustainability advice. It's built with Azure OpenAI and designed with an eco-friendly aesthetic that matches the EcoPilot brand.

## Features

### 🌱 Core Functionality
- **Real-time AI Conversations**: Powered by Azure OpenAI GPT-4o model
- **Context-Aware Responses**: Understands business context (industry, emissions, employee count)
- **Persistent Chat History**: Maintains conversation context throughout the session
- **Smooth Animations**: Beautiful entrance/exit animations and smooth scrolling

### 🎨 Design Features
- **Eco-Friendly Theme**: Green color palette with leaf icons and nature-inspired elements
- **Modern UI**: Glassmorphism effects, smooth transitions, and responsive design
- **Accessibility**: Proper ARIA labels, keyboard navigation support
- **Mobile Responsive**: Adapts to different screen sizes

### ⚡ Technical Features
- **Optimistic UI Updates**: Instant message display before server response
- **Error Handling**: Graceful error messages and retry capability
- **Auto-scroll**: Automatically scrolls to new messages
- **Loading States**: Visual feedback during AI response generation
- **Type Safety**: Full TypeScript support

## Architecture

### Components

#### 1. **EcoChatWidget** (`src/components/eco-chat-widget.tsx`)
The main chat widget component with:
- Floating action button (FAB) to open/close chat
- Animated chat window with header, messages area, and input
- Message rendering with user/assistant distinction
- Loading indicators and error handling

#### 2. **Chat API Route** (`src/app/api/chat/route.ts`)
Server-side API endpoint that:
- Receives chat messages from the client
- Builds context-aware system prompts
- Calls Azure OpenAI for response generation
- Returns formatted responses

### Data Flow

```
User Input → EcoChatWidget → /api/chat → Azure OpenAI → Response → EcoChatWidget → Display
```

1. User types a message and presses Enter or clicks Send
2. Message is added to local state (optimistic update)
3. API request sent to `/api/chat` with message history and business context
4. Server builds system prompt with business context
5. Azure OpenAI generates response
6. Response returned to client and displayed

## Usage

### Basic Integration

The chat widget is automatically integrated into the dashboard:

```tsx
import { EcoChatWidget } from "@/components/eco-chat-widget";

// In your component
<EcoChatWidget 
  userId={userId} 
  businessContext={{
    industry: "Technology",
    employeeCount: 50,
    totalEmissions: 25000
  }}
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | `string` | No | User identifier for personalization |
| `businessContext` | `object` | No | Business context for relevant advice |
| `businessContext.industry` | `string` | No | Business industry/category |
| `businessContext.employeeCount` | `number` | No | Number of employees |
| `businessContext.totalEmissions` | `number` | No | Total annual emissions in kg CO2e |

## Customization

### Styling

The widget uses Tailwind CSS and respects your theme colors. Key color variables:

- `--color-primary`: Main brand color (green)
- `--color-chart-4`: Accent color for badges
- `--color-card`: Background color for messages
- `--color-muted`: Secondary backgrounds

### System Prompt

Customize the AI's personality and expertise by editing the `buildSystemPrompt` function in `/api/chat/route.ts`:

```typescript
const basePrompt = `You are EcoPilot, a friendly sustainability assistant...`;
```

### Animations

Animations are defined using Tailwind's animation utilities:
- `animate-in`: Entrance animations
- `fade-in`: Fade effect
- `slide-in-from-bottom-*`: Slide up effect
- `animate-pulse`: Pulsing online indicator

## API Reference

### POST `/api/chat`

Request body:
```json
{
  "messages": [
    { "role": "user", "content": "How can I reduce emissions?" },
    { "role": "assistant", "content": "Here are some ways..." }
  ],
  "userId": "user_123",
  "businessContext": {
    "industry": "Retail",
    "employeeCount": 25,
    "totalEmissions": 15000
  }
}
```

Response:
```json
{
  "message": "Based on your retail business with 25 employees..."
}
```

Error response:
```json
{
  "error": "Failed to generate response",
  "details": "Error message"
}
```

## AI Behavior

### Personality Traits
- **Warm & Encouraging**: Uses positive language and celebrates progress
- **Expert**: Knowledgeable about sustainability and carbon reduction
- **Practical**: Focuses on actionable advice
- **Concise**: Keeps responses brief (2-4 sentences typically)

### Expertise Areas
- Carbon footprint calculation and analysis
- Energy efficiency strategies
- Sustainable transportation
- Waste reduction
- Green procurement
- Employee engagement
- Industry-specific best practices
- Cost-benefit analysis

### Response Guidelines
- Uses emojis occasionally (🌱, 🌍, ♻️, 💚, ⚡, 🚗, 🏢)
- References business context when available
- Provides specific, actionable advice
- Acknowledges uncertainty when appropriate
- Redirects off-topic questions back to sustainability

## Performance Considerations

### Optimization Strategies
1. **Debounced Scrolling**: Smooth scroll uses `behavior: "smooth"` for better UX
2. **Optimistic Updates**: Messages appear instantly before server confirmation
3. **Lazy Loading**: Widget only loads when opened
4. **Efficient Re-renders**: Uses React hooks properly to minimize re-renders

### Rate Limiting
Consider implementing rate limiting on the `/api/chat` endpoint to prevent abuse:

```typescript
// Example with rate limiting
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const { success } = await rateLimit(req);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  // ... rest of handler
}
```

## Accessibility

### Keyboard Navigation
- `Enter`: Send message
- `Escape`: Close chat widget (can be added)
- Tab navigation through interactive elements

### Screen Readers
- Proper ARIA labels on buttons and inputs
- Semantic HTML structure
- Role attributes for messages

### Visual Accessibility
- High contrast ratios for text
- Clear focus indicators
- Sufficient touch target sizes (44x44px minimum)

## Troubleshooting

### Common Issues

#### Chat widget not appearing
- Check that Azure OpenAI credentials are configured in `.env`
- Verify the component is imported and rendered
- Check browser console for errors

#### Responses are slow
- Azure OpenAI response time varies (typically 1-3 seconds)
- Consider implementing streaming responses for faster perceived performance
- Check your Azure OpenAI quota and limits

#### Messages not scrolling
- Verify `messagesEndRef` is properly attached
- Check for CSS conflicts with `overflow` properties
- Ensure ScrollArea component is rendering correctly

#### Context not being used
- Verify `businessContext` prop is passed correctly
- Check API logs to confirm context is received
- Ensure system prompt includes context variables

## Future Enhancements

### Potential Features
1. **Message History Persistence**: Save chat history to database
2. **Streaming Responses**: Real-time token streaming for faster UX
3. **Voice Input**: Speech-to-text integration
4. **Multi-language Support**: Internationalization
5. **Quick Actions**: Predefined question buttons
6. **File Attachments**: Upload documents for analysis
7. **Export Chat**: Download conversation history
8. **Suggested Questions**: Context-aware question suggestions
9. **Typing Indicators**: Show when AI is "typing"
10. **Read Receipts**: Mark messages as read

### Technical Improvements
1. **Caching**: Cache common responses for faster replies
2. **Websockets**: Real-time bidirectional communication
3. **Analytics**: Track chat usage and popular questions
4. **A/B Testing**: Test different prompts and personalities
5. **Feedback Loop**: Allow users to rate responses

## Security Considerations

### Best Practices
1. **Input Validation**: Sanitize user input before sending to API
2. **Rate Limiting**: Prevent abuse and excessive API calls
3. **Authentication**: Verify user identity before processing requests
4. **Content Filtering**: Filter inappropriate content
5. **Data Privacy**: Don't log sensitive business information

### Environment Variables
Required environment variables:
```bash
AZURE_OPENAI_API_KEY=your_api_key
AZURE_OPENAI_ENDPOINT=your_endpoint
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

## Testing

### Manual Testing Checklist
- [ ] Widget opens and closes smoothly
- [ ] Messages send and receive correctly
- [ ] Auto-scroll works on new messages
- [ ] Loading states display properly
- [ ] Error handling works (test with network offline)
- [ ] Business context is used in responses
- [ ] Animations are smooth
- [ ] Mobile responsive design works
- [ ] Keyboard navigation functions
- [ ] Accessibility features work with screen readers

### Automated Testing
Consider adding tests for:
- Component rendering
- Message sending/receiving
- API endpoint responses
- Error handling
- Context building

## License

This chat widget is part of the EcoPilot application and follows the same license.

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check Azure OpenAI documentation
4. Contact the development team

---

**Last Updated**: November 2024
**Version**: 1.0.0
**Maintainer**: EcoPilot Development Team

