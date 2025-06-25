# Stream Chat Integration Setup

This project integrates Stream Chat to enable communication between hosts and guests when bookings are confirmed.

## Setup Instructions

### 1. Get Stream Chat Credentials

1. Go to [https://getstream.io/chat/](https://getstream.io/chat/)
2. Sign up for a free account
3. Create a new app
4. Copy your API Key and API Secret from the dashboard

### 2. Configure Backend

1. Update your `.env` file in the Backend folder:
```bash
STREAM_API_KEY=your_actual_api_key_here
STREAM_API_SECRET=your_actual_api_secret_here
```

### 3. How It Works

#### Automatic Channel Creation
- When a host accepts a booking (status changes to "confirmed"), a chat channel is automatically created
- The channel includes both the host and the guest
- A welcome message is sent to initiate the conversation

#### Chat Features
- Real-time messaging between host and guest
- Message history and persistence
- User presence indicators
- Message delivery receipts

#### Access Points
1. **Messages Tab**: View all chat conversations
2. **Booking Details**: Direct access to chat from confirmed bookings

### 4. User Flow

1. Guest makes a booking request
2. Host accepts the booking
3. Chat channel is automatically created
4. Both parties can now communicate through:
   - The "Messages" tab in the main navigation
   - The "Chat" button in booking details

### 5. Technical Implementation

#### Backend Components
- `streamChatService.js`: Core Stream Chat functionality
- `chatController.js`: API endpoints for chat operations
- `chatRoutes.js`: Route definitions
- Modified `bookingController.js`: Auto-creates channels on booking confirmation

#### Frontend Components
- `ChatContext.tsx`: React context for chat state management
- `messages.tsx`: Main chat list screen
- `chatDetailSreen.tsx`: Individual chat conversation screen

#### API Endpoints
- `GET /api/chat/token`: Generate user authentication token
- `GET /api/chat/channels`: Get user's chat channels
- `POST /api/chat/booking/:bookingId/channel`: Create channel for specific booking

### 6. Demo Mode

If you haven't set up Stream Chat credentials yet, the app will run in demo mode with placeholder credentials. To fully test the chat functionality, you'll need to set up your own Stream Chat app.

### 7. Dependencies

The following packages are already installed:
- Backend: `stream-chat`
- Frontend: `stream-chat-react-native`

### 8. Security Notes

- Chat tokens are generated server-side for security
- Users can only access channels they are members of
- Booking verification ensures only hosts and guests can chat about their bookings
