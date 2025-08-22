const axios = require('axios');

/**
 * Notify handoff via Slack webhook or log
 */
async function notifyHandoff({ psid, text, reason }) {
  const payload = {
    text: `🤖 *DM Handoff Required*\n\n*User ID:* ${psid}\n*Reason:* ${reason}\n*Last Message:* ${text}\n\n<https://calendly.com/creator/30min|View in Calendly>`,
    attachments: [
      {
        color: '#ff6b6b',
        fields: [
          {
            title: 'User ID',
            value: psid,
            short: true
          },
          {
            title: 'Reason',
            value: reason,
            short: true
          }
        ],
        footer: 'Voicely DM Bot'
      }
    ]
  };

  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await axios.post(process.env.SLACK_WEBHOOK_URL, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Handoff notification sent to Slack');
    } catch (error) {
      console.error('Error sending Slack notification:', error.message);
      // Fallback to logging
      console.log('HANDOFF REQUIRED:', { psid, text, reason });
    }
  } else {
    // Log handoff if no Slack webhook configured
    console.log('HANDOFF REQUIRED:', { psid, text, reason });
  }
}

module.exports = {
  notifyHandoff
};
