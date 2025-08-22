# Voicely DM Bot

An AI-powered Instagram DM bot that warms leads in the creator's voice, provides deterministic quotes, and handles booking requests.

## What This Is

A **B2B multi-tenant** Instagram DM bot that:
- **Supports multiple creators** with individual configurations
- **Lead-nurtures** with warm, on-brand replies in each creator's voice
- **Generates quotes** using a deterministic pricing engine (no invented prices)
- **Handles booking** requests with creator-specific CTAs
- **Hands off** complex requests to humans via Slack or logging
- **Respects Instagram limits** (24-hour window, user-initiated threads only)

## Self-Service Onboarding

### For New Creators (Self-Service)

Creators can set themselves up in **15 minutes** using our guided onboarding:

1. **Visit the onboarding page:** `https://your-domain.com/onboarding`
2. **Follow the step-by-step guide** that walks them through:
   - Creating their Meta app
   - Connecting their Instagram account
   - Generating access tokens
   - Setting up webhooks
   - Customizing their bot's voice and pricing
3. **Get their unique webhook URL** and verify token
4. **Start receiving DMs** immediately

### For Administrators

**Admin Dashboard:** `https://your-domain.com/admin`
- View all tenants and their status
- Monitor onboarding completion
- Access tenant configurations

**Manual Setup (if needed):**
```bash
# Create a new tenant
npm run create-tenant photographer_sarah

# Edit the configuration
nano config/tenants/photographer_sarah.json
```

### 2. Environment Setup

1. **Copy environment file:**
   ```bash
   cp env.example .env
   ```

2. **Fill in your values:**
   ```bash
   PORT=3000
   VERIFY_TOKEN=your_webhook_verify_token
   OPENAI_API_KEY=your_openai_api_key
   SLACK_WEBHOOK_URL=your_slack_webhook_url  # optional
   ```

3. **Create tenant configurations:**
   ```bash
   # Create a new tenant (creator)
   npm run create-tenant photographer_sarah
   
   # Edit the generated config
   nano config/tenants/photographer_sarah.json
   ```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Test with ngrok

For local development, use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Start your server
npm run dev

# In another terminal, expose your local server
ngrok http 3000

# Use tenant-specific webhook URLs in Meta:
# https://your-ngrok-url.ngrok.io/webhook/photographer_sarah
```

## B2B Multi-Tenant Architecture

### Tenant Management

Each creator (tenant) has their own configuration stored in `config/tenants/{tenantId}.json`:

```json
{
  "creator_name": "Sarah Johnson",
  "booking_url": "https://calendly.com/sarah-photography/30min",
  "pricing_config": "./config/pricing.sample.yml",
  "voice_config": "./config/voice.sample.json",
  "persona_config": "./config/persona.sample.json",
  "meta_config": {
    "page_id": "123456789012345",
    "page_access_token": "EAAG..."
  }
}
```

### Webhook URLs

Each tenant gets their own webhook endpoint:
- **Single tenant:** `/webhook`
- **Multi-tenant:** `/webhook/{tenantId}`

Example: `/webhook/photographer_sarah`

### Creating New Tenants

```bash
# Create a new tenant
npm run create-tenant photographer_mike

# Edit the configuration
nano config/tenants/photographer_mike.json

# Set up Meta app for this tenant
# Use webhook URL: https://your-domain.com/webhook/photographer_mike
```

## Configuration

The pricing engine supports:
- **Packages:** Base services with included features
- **Addons:** Optional extras (second shooter, rush edits, etc.)
- **Rules:** Conditional fees (travel fees based on distance)

```yaml
currency: USD
packages:
  mini: { label: "Mini Session (30 min)", price: 150, includes: ["20 edited photos"] }
  standard: { label: "Standard (60 min)", price: 300, includes: ["60–80 shots", "Location consult"] }
  wedding_base: { label: "Wedding Base (4 hrs)", price: 1200, hours: 4, includes: ["Lead shooter", "Online gallery"] }

addons:
  second_shooter: { label: "Second shooter", price: 300 }
  extra_hour: { label: "Extra hour", price: 250 }
  rush_edit: { label: "48-hr rush edits", price: 200 }

rules:
  travel_fee:
    trigger: { distance_miles_gt: 25 }
    formula: "2 * (miles - 25)"
```

### Voice (`config/voice.sample.json`)

Configure the bot's personality and tone:

```json
{
  "tone": "warm, upbeat, concise, never salesy",
  "emoji_policy": "sparingly, 0-1 per message; favorites: ✨🙌",
  "greetings": ["Hey hey!", "Hi there!"],
  "signoffs": ["– B", "– Baylor"],
  "no_go_phrases": ["limited time offer", "last chance"],
  "style_examples": [
    "So pumped you reached out!",
    "Love this idea — happy to help."
  ]
}
```

### Persona (`config/persona.sample.json`)

Define qualification questions and booking behavior:

```json
{
  "qualification": {
    "always_ask": ["date", "location", "hours needed", "approx headcount/budget if wedding"],
    "optional": ["indoor/outdoor", "vibe/mood"]
  },
  "booking": {
    "cta": "You can grab a time here 👉 {{BOOKING_URL}}",
    "softener": "No rush — happy to answer Qs!"
  },
  "boundaries": {
    "when_to_quote": "Only quote if the user asked for price or you have date + hours or equivalent scope.",
    "handoff_if": ["out of scope", "custom multi-day", "last-minute rush with travel"]
  }
}
```

## Testing

### Run Pricing Tests

```bash
npm test
```

### Test Quote Flows

See `test/quote-flows.md` for detailed conversation scenarios.

**Example test scenario:**
```
User: "Wedding photography for 6 hours with second shooter, venue is 40 miles away"
Expected: Quote with $2030 total
- Wedding Base (4 hrs): $1200
- 2 extra hours: $500  
- Second shooter: $300
- Travel fee: $30
```

### Seed Instagram Captions

Analyze your recent Instagram posts to improve voice configuration:

```bash
npm run seed
# or with merge flag to update voice config
npm run seed -- --merge
```

## Production Notes

### Rate Limiting
- Instagram has rate limits on messaging
- Bot respects 24-hour standard messaging window
- Only replies to user-initiated conversations

### Security
- HMAC signature verification is stubbed for MVP
- Implement proper signature verification for production
- Use environment variables for all sensitive data

### Monitoring
- All requests are logged with unique IDs
- Handoffs are logged or sent to Slack
- Health check endpoint at `/health`

### Deployment
The app is compatible with:
- **Vercel:** Deploy as Node.js app
- **Render:** Use Node.js environment
- **Fly.io:** Deploy with Docker
- **Heroku:** Standard Node.js deployment

### Scaling Considerations
- No database for MVP (configs loaded in memory)
- Consider Redis for session storage in production
- Add request queuing for high volume
- Implement proper error handling and retries

## Troubleshooting

### Common Issues

1. **Webhook verification fails:**
   - Check `VERIFY_TOKEN` matches Meta app settings
   - Ensure webhook URL is accessible

2. **Messages not sending:**
   - Verify `PAGE_ACCESS_TOKEN` is valid
   - Check Instagram account is connected to Meta app
   - Ensure 24-hour messaging window hasn't expired

3. **Pricing errors:**
   - Check YAML syntax in pricing config
   - Verify package keys match in LLM prompts
   - Test pricing math with `npm test`

### Debug Mode

Enable detailed logging by setting:
```bash
DEBUG=true npm run dev
```

## Support

For issues or questions:
1. Check the test scenarios in `test/quote-flows.md`
2. Run pricing tests with `npm test`
3. Review logs for request IDs and error details
4. Verify all environment variables are set correctly
