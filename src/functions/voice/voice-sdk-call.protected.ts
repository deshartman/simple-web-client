// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

import { MyContext } from "../../types/twilio";
import { VoiceSDKEvent } from "../../types/events";
import twilio from "twilio";

// Extend MyContext with Voice SDK-specific environment variables
type VoiceSDKContext = MyContext & {
  VOICE_SDK_DESTINATION_TYPE?: string; // "assistant" | "phone" | "flex" | "custom"
  VOICE_SDK_PHONE_NUMBER?: string; // For phone destination
  VOICE_SDK_ASSISTANT_SID?: string; // For AI Assistant destination
  VOICE_SDK_GREETING?: string; // Greeting for AI Assistant
  VOICE_SDK_VOICE_ID?: string; // Voice ID for AI Assistant
};

export const handler: ServerlessFunctionSignature<VoiceSDKContext, VoiceSDKEvent> =
  async function (
    context: Context<VoiceSDKContext>,
    event: VoiceSDKEvent,
    callback: ServerlessCallback
  ) {
    const response = new Twilio.Response();
    response.appendHeader("Content-Type", "text/xml");

    try {
      const {
        VOICE_SDK_DESTINATION_TYPE,
        VOICE_SDK_PHONE_NUMBER,
        VOICE_SDK_ASSISTANT_SID,
        ASSISTANT_SID,
        VOICE_SDK_GREETING,
        VOICE_SDK_VOICE_ID,
        TWILIO_MOBILE_NUMBER,
      } = context;

      const voiceResponse = new twilio.twiml.VoiceResponse();

      // Prioritize URL parameters over environment variables for routing
      // This allows per-call customization via URL parameters
      const destinationType = event.destinationType || VOICE_SDK_DESTINATION_TYPE || "assistant";

      console.log(`Voice SDK call from ${event.From}, routing type: ${destinationType}`);
      console.log(`Call parameters:`, JSON.stringify(event, null, 2));
      console.log(`Custom parameters: destinationType=${event.destinationType}, phoneNumber=${event.phoneNumber}, assistantSid=${event.assistantSid}`);

      switch (destinationType) {
        case "assistant": {
          // Connect to AI Assistant
          // Prioritize URL parameter, then env vars
          const assistantSid = event.assistantSid || VOICE_SDK_ASSISTANT_SID || ASSISTANT_SID;

          if (!assistantSid) {
            throw new Error(
              "Missing assistantSid. Pass as URL parameter or set VOICE_SDK_ASSISTANT_SID/ASSISTANT_SID in environment"
            );
          }

          // Use custom greeting or default (prioritize URL parameter)
          let greeting = event.greeting || VOICE_SDK_GREETING;
          if (!greeting) {
            greeting = "Hello! How can I help you today?";
          }

          // Use custom voice or default (prioritize URL parameter)
          let voiceId = event.voiceId || VOICE_SDK_VOICE_ID;
          if (!voiceId) {
            voiceId = "en-US-Journey-O";
          }

          const connect = voiceResponse.connect();
          connect.assistant({
            id: assistantSid,
            welcomeGreeting: greeting,
            voice: voiceId,
          });

          console.log(`Connecting to AI Assistant: ${assistantSid} with greeting: "${greeting}" and voice: ${voiceId}`);
          break;
        }

        case "phone": {
          // Dial a phone number
          // Prioritize URL parameter, then env var
          let phoneNumber = event.phoneNumber || VOICE_SDK_PHONE_NUMBER;

          // Handle URL encoding: + is decoded as space in URL parameters
          if (phoneNumber && phoneNumber.startsWith(' ')) {
            phoneNumber = '+' + phoneNumber.trim();
            console.log(`Fixed phone number encoding: ${phoneNumber}`);
          }

          if (!phoneNumber) {
            throw new Error(
              "Missing phoneNumber. Pass as URL parameter or set VOICE_SDK_PHONE_NUMBER in environment"
            );
          }

          if (!TWILIO_MOBILE_NUMBER) {
            throw new Error(
              "Missing TWILIO_MOBILE_NUMBER in environment. A Twilio phone number is required as caller ID for outbound calls."
            );
          }

          console.log(`Dialing phone number: ${phoneNumber} with caller ID: ${TWILIO_MOBILE_NUMBER}`);

          const dial = voiceResponse.dial({
            callerId: TWILIO_MOBILE_NUMBER,
          });
          dial.number(phoneNumber);
          break;
        }

        case "flex": {
          // Route to Flex
          const { FLEX_WORKFLOW_SID, FLEX_WORKSPACE_SID } = context;

          if (!FLEX_WORKFLOW_SID || !FLEX_WORKSPACE_SID) {
            throw new Error(
              "Missing FLEX_WORKFLOW_SID or FLEX_WORKSPACE_SID in environment variables"
            );
          }

          const enqueue = voiceResponse.enqueue({
            workflowSid: FLEX_WORKFLOW_SID,
          });

          // Build task attributes with custom parameters from URL
          const taskAttributes: Record<string, any> = {
            from: event.From,
            channel: "voice",
            source: "voice-sdk-web-client",
          };

          // Include any custom URL parameters in task attributes
          // Filter out Twilio-specific parameters
          const reservedParams = ['From', 'To', 'CallSid', 'AccountSid', 'ApiVersion', 'Direction', 'CallerName'];
          Object.keys(event).forEach((key) => {
            if (!reservedParams.includes(key) && event[key]) {
              taskAttributes[key] = event[key];
            }
          });

          enqueue.task(JSON.stringify(taskAttributes));

          console.log(`Routing to Flex workflow: ${FLEX_WORKFLOW_SID} with attributes:`, taskAttributes);
          break;
        }

        case "custom": {
          // For custom TwiML - you can extend this section
          // This is a placeholder for custom routing logic
          voiceResponse.say(
            "This is a custom routing configuration. Please configure your destination."
          );
          break;
        }

        default: {
          throw new Error(`Unknown destination type: ${destinationType}`);
        }
      }

      const twiml = voiceResponse.toString();
      response.setBody(twiml);

      return callback(null, response);
    } catch (error) {
      console.error("Error handling Voice SDK call:", error);
      console.error("Error details - event parameters:", JSON.stringify(event, null, 2));
      console.error("Error details - destinationType:", event.destinationType);
      console.error("Error details - phoneNumber:", event.phoneNumber);
      console.error("Error details - assistantSid:", event.assistantSid);

      // Return error TwiML
      const voiceResponse = new twilio.twiml.VoiceResponse();
      voiceResponse.say(
        "We're sorry, but we're unable to connect your call at this time. Please try again later."
      );
      response.setBody(voiceResponse.toString());

      return callback(null, response);
    }
  };
