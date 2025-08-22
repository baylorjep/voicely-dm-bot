const { verifyWebhook, extractEvents, sendText } = require('../lib/meta');
const { decideAction } = require('../lib/llm');
const { computeQuote } = require('../lib/pricing');
const { loadVoice, loadPersona, draftQuoteText } = require('../lib/voice');
const { notifyHandoff } = require('../lib/handoff');
const { extractTenantId, getTenantConfig } = require('../lib/tenant');

/**
 * GET /webhook - Meta webhook verification
 */
function handleWebhookVerification(req, res) {
  verifyWebhook(req, res, process.env.VERIFY_TOKEN);
}

/**
 * POST /webhook - Handle incoming DM events
 */
async function handleWebhookEvents(req, res) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Processing webhook event`);
  
  try {
    // Extract tenant ID and load tenant-specific config
    const tenantId = extractTenantId(req);
    const tenantConfig = getTenantConfig(tenantId);
    
    console.log(`[${requestId}] Processing for tenant: ${tenantId}`);
    
    // Load tenant-specific configurations
    const pricing = require('../lib/pricing').loadPricing(tenantConfig.pricing_config);
    const voice = loadVoice(tenantConfig.voice_config);
    const persona = loadPersona(tenantConfig.persona_config);
    
    const events = extractEvents(req);
    
    if (events.length === 0) {
      console.log(`[${requestId}] No valid events found`);
      return res.sendStatus(200);
    }
    
    for (const event of events) {
      console.log(`[${requestId}] Processing event for PSID: ${event.psid}`);
      
      // Decide action based on user text
      const action = await decideAction({
        userText: event.text,
        voice,
        persona
      });
      
      console.log(`[${requestId}] Action decided:`, action.type);
      
      // Handle different action types
      switch (action.type) {
        case 'WARM_REPLY':
                await sendText({
        psid: event.psid,
        text: action.text,
        pageId: tenantConfig.meta_config.page_id,
        accessToken: tenantConfig.meta_config.page_access_token
      });
          break;
          
                  case 'ASK':
            const questionsText = action.questions.join('\n');
            await sendText({
              psid: event.psid,
              text: questionsText,
              pageId: tenantConfig.meta_config.page_id,
              accessToken: tenantConfig.meta_config.page_access_token
            });
            break;
            
          case 'QUOTE_REQUEST':
            try {
              const quote = computeQuote(pricing, action.args);
              const quoteText = draftQuoteText({ voice, quote, persona });
              await sendText({
                psid: event.psid,
                text: quoteText,
                pageId: tenantConfig.meta_config.page_id,
                accessToken: tenantConfig.meta_config.page_access_token
              });
            } catch (error) {
              console.error(`[${requestId}] Error computing quote:`, error.message);
              await sendText({
                psid: event.psid,
                text: "Sorry, I'm having trouble with the pricing right now. Let me get back to you personally!",
                pageId: tenantConfig.meta_config.page_id,
                accessToken: tenantConfig.meta_config.page_access_token
              });
            }
            break;
            
          case 'BOOKING':
            // Use tenant-specific booking URL
            const bookingText = persona.booking.cta.replace('{BOOKING_URL}', tenantConfig.booking_url);
            await sendText({
              psid: event.psid,
              text: bookingText,
              pageId: tenantConfig.meta_config.page_id,
              accessToken: tenantConfig.meta_config.page_access_token
            });
            break;
            
          case 'HUMAN':
            await notifyHandoff({
              psid: event.psid,
              text: event.text,
              reason: action.reason
            });
            await sendText({
              psid: event.psid,
              text: "Flagging this for me to answer personally — I'll be right with you! 🙌",
              pageId: tenantConfig.meta_config.page_id,
              accessToken: tenantConfig.meta_config.page_access_token
            });
            break;
            
          default:
            console.error(`[${requestId}] Unknown action type:`, action.type);
            await sendText({
              psid: event.psid,
              text: "Thanks for reaching out! How can I help?",
              pageId: tenantConfig.meta_config.page_id,
              accessToken: tenantConfig.meta_config.page_access_token
            });
      }
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error(`[${requestId}] Error processing webhook:`, error.message);
    res.sendStatus(500);
  }
}

module.exports = {
  handleWebhookVerification,
  handleWebhookEvents
};
