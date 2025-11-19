import { Context } from "@twilio-labs/serverless-runtime-types/types";
import { MyContext } from "./twilio";

// JWT payload structure
export interface JWTPayload {
  assistantSid: string;
}

// Conversation attributes structure
export interface ConversationAttributes {
  assistantSid?: string;
  assistantIsTyping?: boolean;
  flexAgentActive?: boolean;
  [key: string]: any;
}

// AI Assistant message body structure
export interface AssistantMessageBody {
  identity: string;
  session_id: string;
  body: string;
  webhook?: string;
}

// Utility function signatures
export function sendMessageToAssistant(
  context: Context<MyContext>,
  assistantId: string,
  body: AssistantMessageBody
): Promise<void>;

export function readConversationAttributes(
  context: Context<MyContext>,
  chatServiceSid: string,
  conversationSid: string
): Promise<ConversationAttributes>;

export function getAssistantSid(
  context: Context<MyContext>,
  event: any
): Promise<string>;

export function signRequest(
  context: Context<MyContext>,
  event: any
): Promise<string>;

export function verifyRequest(
  context: Context<MyContext>,
  event: any
): boolean;
