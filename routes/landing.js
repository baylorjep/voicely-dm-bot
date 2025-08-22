const express = require('express');
const router = express.Router();

/**
 * GET / - Landing page
 */
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Voicely - AI Instagram DM Bot</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
          max-width: 1000px; 
          margin: 0 auto; 
          padding: 20px;
          line-height: 1.6;
        }
        .hero { 
          text-align: center; 
          padding: 60px 20px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
          margin-bottom: 40px;
        }
        .hero h1 { font-size: 3rem; margin-bottom: 20px; }
        .hero p { font-size: 1.2rem; margin-bottom: 30px; }
        .cta-button { 
          background: #ff6b6b; 
          color: white; 
          padding: 15px 30px; 
          border: none; 
          border-radius: 8px; 
          font-size: 1.1rem; 
          cursor: pointer; 
          text-decoration: none;
          display: inline-block;
          transition: background 0.3s;
        }
        .cta-button:hover { background: #ff5252; }
        .features { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
          gap: 30px; 
          margin: 40px 0; 
        }
        .feature { 
          background: #f8f9fa; 
          padding: 30px; 
          border-radius: 8px; 
          text-align: center; 
        }
        .feature h3 { color: #333; margin-bottom: 15px; }
        .feature-icon { font-size: 3rem; margin-bottom: 20px; }
        .pricing { 
          background: #e3f2fd; 
          padding: 40px; 
          border-radius: 8px; 
          text-align: center; 
          margin: 40px 0; 
        }
        .setup-steps { 
          background: #f1f8e9; 
          padding: 40px; 
          border-radius: 8px; 
          margin: 40px 0; 
        }
        .step { 
          display: flex; 
          align-items: center; 
          margin: 20px 0; 
          padding: 15px; 
          background: white; 
          border-radius: 6px; 
        }
        .step-number { 
          background: #4caf50; 
          color: white; 
          width: 30px; 
          height: 30px; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          margin-right: 20px; 
          font-weight: bold; 
        }
      </style>
    </head>
    <body>
      <div class="hero">
        <h1>🚀 Voicely</h1>
        <p>AI-powered Instagram DM bot that warms leads, generates quotes, and books clients in your voice</p>
        <a href="/onboarding" class="cta-button">Get Started - 15 Minute Setup</a>
      </div>
      
      <div class="features">
        <div class="feature">
          <div class="feature-icon">💬</div>
          <h3>Lead Nurturing</h3>
          <p>Warm, on-brand replies that build connection with potential clients in your authentic voice</p>
        </div>
        <div class="feature">
          <div class="feature-icon">💰</div>
          <h3>Smart Quoting</h3>
          <p>Deterministic pricing engine that generates accurate quotes with line items and totals</p>
        </div>
        <div class="feature">
          <div class="feature-icon">📅</div>
          <h3>Easy Booking</h3>
          <p>Seamless booking flow that converts warm leads into paying clients</p>
        </div>
        <div class="feature">
          <div class="feature-icon">🤖</div>
          <h3>AI Handoff</h3>
          <p>Smart escalation to human when conversations get complex or require personal touch</p>
        </div>
      </div>
      
      <div class="pricing">
        <h2>Perfect for Creators & Small Businesses</h2>
        <p>No monthly fees. No per-message charges. Just a simple setup and you're ready to scale your Instagram DMs.</p>
        <a href="/onboarding" class="cta-button">Start Free Setup</a>
      </div>
      
      <div class="setup-steps">
        <h2>How It Works</h2>
        <div class="step">
          <div class="step-number">1</div>
          <div>
            <h3>Quick Setup</h3>
            <p>Connect your Instagram account and customize your bot's voice in 15 minutes</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div>
            <h3>Start Receiving DMs</h3>
            <p>Your bot automatically responds to Instagram DMs with warm, helpful messages</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div>
            <h3>Convert to Clients</h3>
            <p>Generate quotes, handle bookings, and escalate complex requests to you</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <div>
            <h3>Scale Your Business</h3>
            <p>Never miss a lead again. Your bot works 24/7 while you focus on your craft</p>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <h2>Ready to automate your Instagram DMs?</h2>
        <a href="/onboarding" class="cta-button">Get Started Now</a>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;
