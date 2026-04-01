# Twilio Voice SDK Web Client

A browser-based voice calling client powered by the Twilio Voice SDK, designed to connect callers to AI Assistants, phone numbers, Flex agents, or custom destinations.

## Features

- **Browser-Based Calling** - Make voice calls directly from a web browser using Twilio Voice SDK
- **AI Assistant Integration** - Connect calls to Twilio AI Assistants with customizable greetings and voices
- **Flexible Routing** - Route calls to AI Assistants, phone numbers, Flex workflows, or custom TwiML
- **URL Parameter Configuration** - Customize call destinations and behavior via URL parameters
- **Built-in Usage Guide** - Interactive instructions available by scrolling down in the client interface
- **Mute/Unmute Controls** - In-call audio controls
- **Call Timer** - Track call duration in real-time
- **Mobile Optimized** - Responsive design works on desktop and mobile devices

## Prerequisites

- Node.js 22.x (see `.nvmrc`)
- Twilio account with:
  - Voice capabilities
  - Twilio API Key (for JWT token generation)
  - TwiML Application configured
  - AI Assistants access (optional, for AI Assistant routing)
  - Twilio phone number (optional, for outbound calls to phone numbers)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file with your Twilio credentials:

```bash
# Twilio Account Credentials
ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH_TOKEN=your_auth_token_here

# Domain (set after first deployment)
DOMAIN_NAME=your-app-name-XXXX-dev.twil.io

# Voice SDK Configuration
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=your_api_key_secret_here
VOICE_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Voice Client Identity (optional, defaults to "web-caller")
VOICE_CLIENT_IDENTITY=web-caller

# Default Call Routing (optional - can be overridden via URL parameters)
VOICE_SDK_DESTINATION_TYPE=assistant
VOICE_SDK_ASSISTANT_SID=
VOICE_SDK_GREETING=Hello! How can I help you today?
VOICE_SDK_VOICE_ID=en-US-Journey-O

# For phone number routing (optional)
TWILIO_MOBILE_NUMBER=+1xxxxxxxxxx
VOICE_SDK_PHONE_NUMBER=

# For Flex routing (optional)
FLEX_WORKSPACE_SID=WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FLEX_WORKFLOW_SID=WWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Create Twilio Resources

#### Create an API Key

1. Go to [Twilio API Keys](https://console.twilio.com/us1/develop/runtime/api-keys/create)
2. Create a new API Key
3. Copy the SID and Secret to your `.env` file as `TWILIO_API_KEY_SID` and `TWILIO_API_KEY_SECRET`

#### Create a TwiML Application

1. Go to [TwiML Apps](https://console.twilio.com/us1/develop/voice/manage/twiml-apps)
2. Create a new TwiML Application
3. Set the Voice URL to: `https://YOUR_DOMAIN_NAME/voice/voice-sdk-call` (you'll update this after deployment)
4. Copy the Application SID to your `.env` file as `VOICE_APP_SID`

### 4. Build the Project

```bash
npm run build
```

### 5. Run Locally

```bash
npm start
```

The application will be available at `http://localhost:3000/voice-client.html`

### 6. Deploy to Twilio

```bash
npm run deploy
```

After deployment:
1. Note the domain name from the deployment output (e.g., `your-app-XXXX-dev.twil.io`)
2. Update your `.env` file with the `DOMAIN_NAME` value
3. Update your TwiML Application's Voice URL to: `https://YOUR_DOMAIN_NAME/voice/voice-sdk-call`
4. Redeploy to ensure configuration is complete:
   ```bash
   npm run deploy
   ```

## Using the Voice Client

### Basic Usage

Open the voice client in your browser:
```
https://YOUR_DOMAIN_NAME/voice-client.html
```

By default, it will use the routing configuration from your `.env` file.

**Built-in Instructions**: The voice client includes interactive usage instructions. Simply scroll down on the client page to view detailed parameter documentation and routing examples.

### Custom Routing via URL Parameters

You can customize the call destination by adding URL parameters:

#### Connect to an AI Assistant
```
https://YOUR_DOMAIN_NAME/voice-client.html?assistantSid=ASxxxx&greeting=Hello!&voiceId=en-US-Journey-O
```

Parameters:
- `assistantSid` - Your AI Assistant SID (required)
- `greeting` (optional) - Custom greeting message
- `voiceId` (optional) - Voice ID for the assistant

#### Call a Phone Number
```
https://YOUR_DOMAIN_NAME/voice-client.html?destinationType=phone&phoneNumber=+15551234567
```

Parameters:
- `destinationType=phone` - Route to phone number
- `phoneNumber` - Phone number to call (E.164 format)

**Note:** Requires `TWILIO_MOBILE_NUMBER` configured in `.env` for caller ID

#### Route to Flex
```
https://YOUR_DOMAIN_NAME/voice-client.html?destinationType=flex
```

Parameters:
- `destinationType=flex` - Route to Flex workflow

**Note:** Requires `FLEX_WORKSPACE_SID` and `FLEX_WORKFLOW_SID` configured in `.env`

#### Custom Routing
```
https://YOUR_DOMAIN_NAME/voice-client.html?destinationType=custom
```

You can extend the `voice-sdk-call.protected.ts` function to add custom TwiML logic for the "custom" destination type.

## Architecture

### Components

#### Frontend
- **voice-client.html** - Web-based voice client interface
  - Fetches JWT access token from backend
  - Initializes Twilio Voice SDK Device
  - Makes outbound calls with URL parameters
  - Provides mute/unmute controls and call timer
  - Includes scrollable usage instructions with parameter documentation

#### Backend Functions
- **voice-token.ts** - Generates JWT access tokens for Voice SDK authentication
  - Creates Twilio Access Token with Voice Grant
  - Assigns client identity
  - Returns token to browser client

- **voice-sdk-call.protected.ts** - Routes voice calls based on parameters
  - Receives call parameters from Voice SDK
  - Generates appropriate TwiML response:
    - `<Connect><Assistant>` for AI Assistant calls
    - `<Dial><Number>` for phone calls
    - `<Enqueue>` for Flex routing
    - Custom TwiML for custom routing
  - Returns TwiML to connect the call

### Call Flow

```
Browser Client          Voice Token Endpoint       Voice SDK Call Handler
     |                           |                            |
     |-- GET /voice/voice-token->|                            |
     |<---- JWT Access Token -----|                            |
     |                           |                            |
     |- Initialize Device ------->|                            |
     |                           |                            |
     |- device.connect() ------->|                            |
     |                           |---- Call with params ----->|
     |                           |                            |
     |                           |<---- TwiML Response -------|
     |<------- Call Connected ----|                            |
```

## Regional Configuration

### Understanding Twilio Regions

Twilio operates data centers in multiple geographic regions. When you create Twilio resources (API Keys, TwiML Applications, etc.), they are associated with a specific region. For the Voice SDK to work correctly, **all components must be in the same region**.

#### Available Regions

- **US (default)** - United States (no region parameter needed)
- **au1** - Australia (Sydney)
- **ie1** - Ireland (Dublin)
- **sg1** - Singapore
- **jp1** - Japan (Tokyo)
- **de1** - Germany (Frankfurt)
- **br1** - Brazil (São Paulo)

See [Twilio Regions Documentation](https://www.twilio.com/docs/global-infrastructure/edge-locations) for the complete list.

### Regional Consistency Requirements

⚠️ **Critical**: All of the following must be in the same region:

1. **API Keys** (`TWILIO_API_KEY_SID` / `TWILIO_API_KEY_SECRET`)
   - Created at: https://console.twilio.com/[REGION]/develop/runtime/api-keys/create
   - Example for AU: https://console.twilio.com/au1/develop/runtime/api-keys/create

2. **TwiML Application** (`VOICE_APP_SID`)
   - Created at: https://console.twilio.com/[REGION]/develop/voice/manage/twiml-apps
   - Example for AU: https://console.twilio.com/au1/develop/voice/manage/twiml-apps

3. **Region Parameter** (`REGION` in `.env`)
   - Must match the region where your API Keys and TwiML App were created
   - Leave empty for US region (default)
   - Set to `au1` for Australia, `ie1` for Ireland, etc.

### Configuration Examples

#### US Region (Default)
```bash
# .env
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx    # Created in US console
TWILIO_API_KEY_SECRET=your_us_api_key_secret
VOICE_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx        # Created in US console
REGION=                                                  # Empty = US region
```

#### Australia Region
```bash
# .env
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx    # Created in AU console
TWILIO_API_KEY_SECRET=your_au_api_key_secret
VOICE_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx        # Created in AU console
REGION=au1                                               # Set to au1
```

### Troubleshooting Regional Issues

**Error: AccessTokenInvalid (20101)**
- Symptom: "Twilio was unable to validate your Access Token"
- Cause: Region mismatch between API keys and region parameter
- Solution: Ensure `REGION` matches where your API keys were created, or leave empty for US

**Error: UnknownError (31000) - No requests reaching backend**
- Symptom: Device connects but call fails immediately with no backend logs
- Cause: TwiML App in different region than API keys/region parameter
- Solution: Recreate TwiML App in the same region as your API keys

**How to identify your resource regions:**
1. Check the console URL when viewing the resource
   - US: `console.twilio.com/us1/...`
   - AU: `console.twilio.com/au1/...`
2. API Keys show region in the console list view
3. TwiML Apps show region in their properties

### Switching Regions

To switch your application to a different region:

1. Create new API Keys in the target region console
2. Create a new TwiML Application in the target region
3. Update your `.env` file:
   ```bash
   TWILIO_API_KEY_SID=SK...    # New API Key from target region
   TWILIO_API_KEY_SECRET=...   # New API Key Secret
   VOICE_APP_SID=AP...          # New TwiML App from target region
   REGION=au1                   # Set to target region (or empty for US)
   ```
4. Redeploy: `npm run deploy`
5. Update the TwiML App's Voice URL to point to your new deployment

**Note**: You cannot reuse API Keys or TwiML Apps across regions. Each region requires its own resources.

## Configuration Reference

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ACCOUNT_SID` | Yes | Twilio Account SID |
| `AUTH_TOKEN` | Yes | Twilio Auth Token |
| `DOMAIN_NAME` | Yes | Deployed serverless domain (without https://) |
| `TWILIO_API_KEY_SID` | Yes | Twilio API Key SID for JWT generation |
| `TWILIO_API_KEY_SECRET` | Yes | Twilio API Key Secret |
| `VOICE_APP_SID` | Yes | TwiML Application SID |
| `REGION` | No | Twilio region (leave empty for US, or "au1", "ie1", etc.) |
| `VOICE_CLIENT_IDENTITY` | No | Client identity (default: "web-caller") |
| `VOICE_SDK_DESTINATION_TYPE` | No | Default destination: "assistant", "phone", "flex", "custom" |
| `VOICE_SDK_ASSISTANT_SID` | No | Default AI Assistant SID |
| `VOICE_SDK_GREETING` | No | Default AI greeting |
| `VOICE_SDK_VOICE_ID` | No | Default AI voice ID |
| `TWILIO_MOBILE_NUMBER` | No | Caller ID for phone calls |
| `VOICE_SDK_PHONE_NUMBER` | No | Default phone number destination |
| `FLEX_WORKSPACE_SID` | No | Flex TaskRouter Workspace SID |
| `FLEX_WORKFLOW_SID` | No | Flex TaskRouter Workflow SID |

### Available Voice IDs

Common Twilio voice IDs for AI Assistants:
- `en-US-Journey-O` (default)
- `en-US-Neural2-A`
- `en-US-Neural2-C`
- `en-US-Neural2-D`
- `en-US-Neural2-E`
- `en-GB-Neural2-A`
- `en-AU-Neural2-A`

See [Twilio Voices Documentation](https://www.twilio.com/docs/voice/twiml/say/text-speech#available-voices-and-languages) for more options.

## Development

### Project Structure

```
simple-web-client/
├── src/
│   ├── assets/
│   │   ├── voice-client.html      # Web client interface
│   │   ├── twilio.min.js          # Twilio Voice SDK
│   │   ├── twilio.png             # Logo
│   │   └── utils.private.ts       # Shared utilities
│   ├── functions/
│   │   └── voice/
│   │       ├── voice-token.ts                # JWT token generation
│   │       └── voice-sdk-call.protected.ts   # Call routing handler
│   └── types/
│       ├── twilio.d.ts            # TypeScript type definitions
│       ├── events.d.ts
│       ├── runtime.d.ts
│       └── utils.d.ts
├── dist/                          # Built output (generated)
├── .env                           # Environment variables (not in git)
└── package.json
```

### NPM Scripts

- `npm test` - Type-check TypeScript
- `npm run build` - Build TypeScript and copy assets to dist/
- `npm start` - Build and run locally (auto-rebuild on changes)
- `npm run deploy` - Build and deploy to Twilio

### Protected Functions

Functions with `.protected.ts` extension require Twilio authentication headers. This includes:
- `voice-sdk-call.protected.ts` - Secured by TwiML App configuration

### Private Assets

Files with `.private.ts` extension (like `utils.private.ts`) are not publicly accessible and can only be imported by other functions.

## Troubleshooting

### Common Issues

**Issue: Token fetch fails**
- Verify `TWILIO_API_KEY_SID` and `TWILIO_API_KEY_SECRET` are correct
- Check that the API Key is active in the Twilio Console
- Review Function logs for errors

**Issue: Device initialization fails**
- Check browser console for errors
- Ensure you're using HTTPS (required for microphone access)
- Verify the access token is valid and not expired
- Check that `VOICE_APP_SID` is correctly configured

**Issue: Call fails to connect**
- Verify TwiML Application Voice URL points to your `/voice/voice-sdk-call` endpoint
- Check Function logs for errors in voice-sdk-call handler
- Ensure required parameters are present (e.g., `assistantSid` for assistant routing)
- For phone calls, verify `TWILIO_MOBILE_NUMBER` is configured

**Issue: No audio / microphone not working**
- Browser must be on HTTPS (except localhost)
- Grant microphone permissions when prompted
- Check browser compatibility (Chrome, Firefox, Safari, Edge supported)
- Test microphone in browser settings

**Issue: AI Assistant not responding**
- Verify `assistantSid` parameter is correct
- Check that the AI Assistant is active in the Twilio Console
- Review greeting and voiceId parameters
- Check AI Assistant logs for errors

**Issue: Flex routing not working**
- Verify `FLEX_WORKSPACE_SID` and `FLEX_WORKFLOW_SID` are correct
- Ensure Flex agents are available and online
- Check TaskRouter configuration

### Enable Debug Logging

View logs in the Twilio Console:
1. Go to [Functions Logs](https://console.twilio.com/us1/develop/functions/logs)
2. Enable Live Logs for real-time debugging
3. Look for logs from `voice-token` and `voice-sdk-call` functions

Browser console also shows detailed client-side logs including:
- Token fetch status
- Device registration
- Connection events
- Call parameters

## Security Notes

- Never commit your `.env` file to version control
- Rotate your `AUTH_TOKEN` and API keys regularly
- Use HTTPS for all production deployments
- Review Twilio [security best practices](https://www.twilio.com/docs/usage/security)

## Additional Resources

- [Twilio Voice SDK Documentation](https://www.twilio.com/docs/voice/sdks/javascript)
- [Twilio AI Assistants Documentation](https://www.twilio.com/docs/ai-assistants)
- [Twilio Functions Documentation](https://www.twilio.com/docs/serverless/functions-assets)
- [TwiML Voice Documentation](https://www.twilio.com/docs/voice/twiml)

## License

Private - Not for redistribution
