// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

import { MyContext } from "../../types/twilio";
import { VoiceTokenEvent } from "../../types/events";
import twilio from "twilio";

// Extend MyContext with Voice-specific environment variables
type VoiceContext = MyContext & {
  TWILIO_API_KEY_SID?: string;
  TWILIO_API_KEY_SECRET?: string;
  VOICE_APP_SID?: string;
  VOICE_CLIENT_IDENTITY?: string;
  REGION?: string;
};

export const handler: ServerlessFunctionSignature<VoiceContext, VoiceTokenEvent> =
  async function (
    context: Context<VoiceContext>,
    event: VoiceTokenEvent,
    callback: ServerlessCallback
  ) {
    const response = new Twilio.Response();
    response.appendHeader("Content-Type", "application/json");
    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");

    try {
      const {
        ACCOUNT_SID,
        TWILIO_API_KEY_SID,
        TWILIO_API_KEY_SECRET,
        VOICE_APP_SID,
        VOICE_CLIENT_IDENTITY,
      } = context;

      // Validate required environment variables
      if (!TWILIO_API_KEY_SID) {
        throw new Error("Missing TWILIO_API_KEY_SID in environment variables");
      }
      if (!TWILIO_API_KEY_SECRET) {
        throw new Error("Missing TWILIO_API_KEY_SECRET in environment variables");
      }

      // Determine TwiML App SID (prioritize URL parameter over environment variable)
      const twimlAppSid = event.twimlAppSid || VOICE_APP_SID;
      if (!twimlAppSid) {
        throw new Error("Missing TwiML App SID. Pass twimlAppSid parameter or set VOICE_APP_SID in environment variables");
      }
      console.log('Using TwiML App SID:', twimlAppSid, event.twimlAppSid ? '(from parameter)' : '(from environment)');

      // Determine identity with priority: number parameter > VOICE_CLIENT_IDENTITY > default
      let identity: string;

      if (event.number) {
        // Normalize number: ensure it starts with "+"
        identity = event.number.startsWith('+') ? event.number : `+${event.number}`;
        console.log('Using number parameter as identity:', identity);
      } else {
        identity = VOICE_CLIENT_IDENTITY || "web-caller";
      }

      // Create access token
      const AccessToken = twilio.jwt.AccessToken;
      const VoiceGrant = AccessToken.VoiceGrant;

      // Build token options with optional region
      const tokenOptions: any = {
        identity: identity,
        ttl: 3600, // 1 hour
      };

      // Add region if specified in environment variables
      if (context.REGION) {
        tokenOptions.region = context.REGION;
        console.log('Using region:', context.REGION);
      } else {
        console.log('No region specified, defaulting to US');
      }

      const accessToken = new AccessToken(
        ACCOUNT_SID,
        TWILIO_API_KEY_SID,
        TWILIO_API_KEY_SECRET,
        tokenOptions
      );

      // Create Voice grant
      const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: twimlAppSid,
        incomingAllow: false, // Only allow outgoing calls
      });

      accessToken.addGrant(voiceGrant);

      // Return token and identity
      response.setBody({
        token: accessToken.toJwt(),
        identity: identity,
      });

      return callback(null, response);
    } catch (error) {
      console.error("Error generating voice token:", error);
      response.setStatusCode(500);
      response.setBody({
        error: error instanceof Error ? error.message : "Failed to generate token",
      });
      return callback(null, response);
    }
  };
