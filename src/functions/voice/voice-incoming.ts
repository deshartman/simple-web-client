// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

import { MyContext } from "../../types/twilio";
import twilio from "twilio";

// Extend MyContext with Voice-specific environment variables
type VoiceIncomingContext = MyContext & {
  VOICE_CLIENT_IDENTITY?: string;
};

// Voice incoming call event parameters
type VoiceIncomingEvent = {
  From?: string;
  To?: string;
  CallSid?: string;
  request: {
    cookies: {};
    headers: {};
  };
};

export const handler: ServerlessFunctionSignature<VoiceIncomingContext, VoiceIncomingEvent> =
  function (
    context: Context<VoiceIncomingContext>,
    event: VoiceIncomingEvent,
    callback: ServerlessCallback
  ) {
    const twiml = new twilio.twiml.VoiceResponse();

    try {
      // Get the client identity from environment variables
      const clientIdentity = context.VOICE_CLIENT_IDENTITY || "web-caller";

      console.log('Incoming call - routing to client:', clientIdentity);
      console.log('Call from:', event.From);
      console.log('Call to:', event.To);

      // Route the call to the web client
      const dial = twiml.dial();
      dial.client(clientIdentity);

      // Return TwiML response
      callback(null, twiml);
    } catch (error) {
      console.error("Error handling incoming call:", error);

      // Fallback - say an error message
      twiml.say("We're sorry, but we're unable to connect your call at this time.");
      callback(null, twiml);
    }
  };
