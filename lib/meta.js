const axios = require('axios');

/**
 * Verify webhook for Meta platform
 */
function verifyWebhook(req, res, VERIFY_TOKEN) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified');
    res.status(200).send(challenge);
  } else {
    console.error('Webhook verification failed');
    res.sendStatus(403);
  }
}

/**
 * Extract events from webhook payload
 */
function extractEvents(req) {
  const events = [];
  
  try {
    const body = req.body;
    
    if (body.object === 'instagram' && body.entry) {
      for (const entry of body.entry) {
        if (entry.messaging) {
          for (const messaging of entry.messaging) {
            if (messaging.message && messaging.message.text) {
              events.push({
                psid: messaging.sender.id,
                text: messaging.message.text
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error extracting events:', error.message);
  }
  
  return events;
}

/**
 * Send text message via Meta API
 */
async function sendText({ psid, text, messaging_type = 'RESPONSE', pageId, accessToken }) {
  // Use provided credentials or fall back to environment variables
  const targetPageId = pageId || process.env.PAGE_ID;
  const targetAccessToken = accessToken || process.env.PAGE_ACCESS_TOKEN;
  
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${targetPageId}/messages`,
      {
        recipient: { id: psid },
        messaging_type: messaging_type,
        message: { text: text }
      },
      {
        params: {
          access_token: targetAccessToken
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Message sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * TODO: Implement HMAC signature verification for production
 * This is a stub function for future security enhancement
 */
function verifySignature(req, appSecret) {
  // TODO: Implement HMAC signature verification
  // const signature = req.headers['x-hub-signature-256'];
  // const expectedSignature = 'sha256=' + crypto
  //   .createHmac('sha256', appSecret)
  //   .update(JSON.stringify(req.body))
  //   .digest('hex');
  // return signature === expectedSignature;
  
  console.log('Signature verification skipped for MVP');
  return true; // Skip for MVP
}

module.exports = {
  verifyWebhook,
  extractEvents,
  sendText,
  verifySignature
};
