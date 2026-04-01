// Test token generation with current .env credentials
require('dotenv').config();
const twilio = require('twilio');

const ACCOUNT_SID = process.env.ACCOUNT_SID;
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID;
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;
const VOICE_APP_SID = process.env.VOICE_APP_SID;
const REGION = process.env.REGION;

console.log('Testing token generation with:');
console.log('ACCOUNT_SID:', ACCOUNT_SID);
console.log('TWILIO_API_KEY_SID:', TWILIO_API_KEY_SID);
console.log('VOICE_APP_SID:', VOICE_APP_SID);
console.log('REGION:', REGION || '(empty - defaults to US)');
console.log('');

try {
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  // Build token options with optional region
  const tokenOptions = {
    identity: 'test-caller',
    ttl: 3600,
  };

  // Add region if specified in environment variables
  if (REGION) {
    tokenOptions.region = REGION;
    console.log('Using region:', REGION);
  } else {
    console.log('No region specified, defaulting to US');
  }

  const accessToken = new AccessToken(
    ACCOUNT_SID,
    TWILIO_API_KEY_SID,
    TWILIO_API_KEY_SECRET,
    tokenOptions
  );

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: VOICE_APP_SID,
    incomingAllow: false,
  });

  accessToken.addGrant(voiceGrant);

  const token = accessToken.toJwt();

  console.log('✅ Token generated successfully!');
  console.log('Token length:', token.length);
  console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
  console.log('');
  console.log('Full token:');
  console.log(token);

} catch (error) {
  console.error('❌ Error generating token:', error.message);
  console.error(error);
}
