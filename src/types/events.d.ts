// Event types for Twilio Functions

// Base event structure required by Twilio serverless
interface BaseEvent {
  request: {
    cookies: Record<string, string>;
    headers: Record<string, string>;
  };
}

// Conversation webhook event (flex-webchat)
export interface ConversationWebchatEvent extends BaseEvent {
  Data?: string; // JSON string containing event data
  Body?: string;
  AssistantIdentity?: string;
  AssistantSid?: string; // AI Assistant SID passed as query parameter
  // Parsed from Data
  ChannelSid?: string;
  InstanceSid?: string;
  From?: string;
  Author?: string;
  ConversationSid?: string;
  ChatServiceSid?: string;
}

// Conversation messageAdded event
export interface ConversationMessageAddedEvent extends BaseEvent {
  ConversationSid: string;
  ChatServiceSid: string;
  Author: string;
  Body: string;
  AssistantIdentity?: string;
  AssistantSid?: string; // AI Assistant SID passed as query parameter
}

// Conversation participantRemoved event
export interface ConversationParticipantRemovedEvent extends BaseEvent {
  ConversationSid: string;
  ChatServiceSid: string;
  Identity: string;
  ParticipantSid: string;
}

// Conversation response webhook event (from AI Assistant)
export interface ConversationResponseEvent extends BaseEvent {
  _assistantIdentity?: string;
  Status?: string;
  SessionId: string; // Format: "webhook:conversations__serviceSid/conversationSid"
  Body: string;
  _token: string; // JWT token for verification
}

// Messaging webhook event (SMS/WhatsApp)
export interface MessagingIncomingEvent extends BaseEvent {
  From: string; // Phone number, may include "whatsapp:" prefix
  To: string; // Twilio number
  Body: string;
  AssistantSid?: string; // AI Assistant SID passed as query parameter
  request: {
    cookies: Record<string, string> & {
      SESSION_ID?: string;
    };
    headers: Record<string, string>;
  };
}

// Messaging response webhook event (from AI Assistant)
export interface MessagingResponseEvent extends BaseEvent {
  _token: string; // JWT token for verification
  Identity: string; // May include "phone:" prefix
  SessionId: string; // Format: "webhook:messaging__to/uuid"
  Body: string;
}

// Voice incoming call event
export interface VoiceIncomingEvent extends BaseEvent {
  greeting?: string; // Voice greeting, special handling for "$VOICE_GREETING"
  voiceId?: string; // Voice ID, special handling for "$VOICE_ID"
  assistantSid?: string; // AI Assistant SID passed as query parameter
}

// Flex handover event
export interface FlexHandoverEvent extends BaseEvent {
  request: {
    cookies: Record<string, string>;
    headers: Record<string, string> & {
      "x-session-id"?: string;
      "x-identity"?: string;
    };
  };
  FlexWorkflowSid?: string;
  FlexWorkspaceSid?: string;
}

// Conversation create event
export interface ConversationCreateEvent extends BaseEvent {
  From: string; // Phone number
  To: string; // Twilio number
  Body: string; // Message content
  AssistantSid?: string; // AI Assistant SID passed as query parameter
}

// Voice SDK token request event
export interface VoiceTokenEvent extends BaseEvent {
  number?: string; // Optional phone number to use as identity (with or without + prefix)
  twimlAppSid?: string; // Optional TwiML App SID to override VOICE_APP_SID from environment
}

// Voice SDK call event (from TwiML App)
export interface VoiceSDKEvent extends BaseEvent {
  From?: string; // Caller
  To?: string; // Callee
  CallSid?: string; // Call SID
  // Custom routing parameters passed from client
  assistantSid?: string; // AI Assistant SID
  greeting?: string; // Custom greeting
  voiceId?: string; // Voice ID
  destinationType?: string; // Routing type: "assistant" | "phone" | "flex" | "custom"
  phoneNumber?: string; // Phone number to dial
  // Allow any additional custom parameters
  [key: string]: string | undefined;
}

// Unified Conversation webhook event (handles all Conversations API webhook events)
export interface ConversationWebhookEvent extends BaseEvent {
  EventType?: string; // Event type: "onMessageAdded", "onParticipantRemoved", etc.
  ConversationSid?: string;
  ChatServiceSid?: string;
  // onMessageAdded fields
  Author?: string;
  Body?: string;
  // onParticipantRemoved fields
  Identity?: string;
  ParticipantSid?: string;
  // Common fields
  AssistantIdentity?: string;
  AssistantSid?: string; // AI Assistant SID passed as query parameter
}

// Verify code event
export interface VerifyCodeEvent extends BaseEvent {
  code?: string; // Verification code to check
}

// Verify send event
export interface VerifySendEvent extends BaseEvent {
  from: string; // Phone number to send verification code to
}

// Send SMS event
export interface SendSmsEvent extends BaseEvent {
  to: string; // Phone number to send SMS to
  message: string; // Message body to send
  from?: string; // Optional: Override default sender number
}

// Outbound call tool event
export interface OutboundCallToolEvent extends BaseEvent {
  number: string; // Phone number to call
  greeting: string; // Greeting to pass to the assistant
  assistantSid: string; // AI Assistant SID to use for the call
}

// Send rich message event
export interface SendRichMessageEvent extends BaseEvent {
  contentSid: string; // Content template SID to use
  to: string; // Recipient phone number
  channel?: string; // Channel to use (default: whatsapp)
  contentVariables?: string; // JSON string of variables
  sender?: string; // Optional sender to override default FROM_NUMBER
}

// Save Sync context event
export interface SaveSyncContextEvent extends BaseEvent {
  number: string; // Customer phone number (used as key)
  context: string; // Context data as text string
}

// Read Sync context event
export interface ReadSyncContextEvent extends BaseEvent {
  number: string; // Customer phone number (used as key)
}

// Send to Slack event
export interface SendToSlackEvent extends BaseEvent {
  summary: string; // Chat summary to send to Slack
}
