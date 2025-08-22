const express = require('express');
const { 
  generateOnboardingInstructions, 
  createCreatorProfile, 
  validateProfileData, 
  generateTenantId,
  getInstagramAuthUrl,
  handleInstagramCallback
} = require('../lib/onboarding');

const router = express.Router();

/**
 * GET /onboarding - Show simplified onboarding form
 */
router.get('/', (req, res) => {
  const creatorName = req.query.name || '';
  const tenantId = creatorName ? generateTenantId(creatorName) : '';
  const instructions = creatorName ? generateOnboardingInstructions(tenantId, creatorName) : null;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Voicely Bot Setup</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .step { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .step h3 { margin-top: 0; color: #007bff; }
        .step ol { margin: 10px 0; }
        .step li { margin: 8px 0; }
        .form-group { margin: 20px 0; }
        label { display: block; margin-bottom: 5px; font-weight: 600; }
        input, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
        button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin: 5px; }
        button:hover { background: #0056b3; }
        .btn-secondary { background: #6c757d; }
        .btn-secondary:hover { background: #545b62; }
        .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .error { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .code { background: #f1f3f4; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
        .instagram-connect { background: #e4405f; }
        .instagram-connect:hover { background: #c13584; }
      </style>
    </head>
    <body>
      <h1>🚀 Voicely Bot Setup</h1>
      <p>Get your Instagram DM bot up and running in 5 minutes!</p>
      
      ${creatorName ? `
        <div class="success">
          <h3>Welcome, ${creatorName}!</h3>
          <p>Your unique ID: <strong>${tenantId}</strong></p>
        </div>
        
        <h2>📋 Simple Setup (2 Steps)</h2>
        ${Object.values(instructions).map(step => `
          <div class="step">
            <h3>${step.title} (${step.estimatedTime})</h3>
            <ol>
              ${step.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ol>
          </div>
        `).join('')}
        
        <h2>⚙️ Complete Your Profile</h2>
        <form id="profileForm" method="POST">
          <input type="hidden" name="tenantId" value="${tenantId}">
          
          <div class="form-group">
            <label>Creator Name:</label>
            <input type="text" name="creatorName" value="${creatorName}" required>
          </div>
          
          <div class="form-group">
            <label>Calendly Booking URL:</label>
            <input type="url" name="bookingUrl" placeholder="https://calendly.com/yourname/30min" required>
          </div>
          
          <div class="form-group">
            <label>Instagram User ID:</label>
            <input type="text" name="instagramUserId" placeholder="17841405793087218" required>
            <small>Don't know your Instagram User ID? <a href="#" onclick="showInstagramHelp()">Click here to find it</a></small>
          </div>
          
          <button type="submit">Create My Bot Profile</button>
        </form>
        
        <div id="instagramHelp" style="display: none; background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <h4>How to find your Instagram User ID:</h4>
          <ol>
            <li>Go to <a href="https://www.instagram.com/yourusername" target="_blank">your Instagram profile</a></li>
            <li>Right-click and "View Page Source"</li>
            <li>Search for "profilePage_</li>
            <li>Look for a number like "17841405793087218" - that's your User ID</li>
            <li>Or use a tool like <a href="https://codeofaninja.com/tools/find-instagram-user-id/" target="_blank">this one</a></li>
          </ol>
        </div>
      ` : `
        <form method="GET">
          <div class="form-group">
            <label>What's your name?</label>
            <input type="text" name="name" placeholder="Sarah Johnson" required>
          </div>
          <button type="submit">Start Setup</button>
        </form>
      `}
      
      <script>
        function showInstagramHelp() {
          document.getElementById('instagramHelp').style.display = 'block';
        }
        
        document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData);
          
          try {
            const response = await fetch('/onboarding', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
              document.body.innerHTML = \`
                <div class="success">
                  <h2>🎉 Setup Complete!</h2>
                  <p>Your Voicely bot is ready to go!</p>
                  <p><strong>Your bot URL:</strong> <span class="code">https://voicely-bay.vercel.app/webhook/${tenantId}</span></p>
                  <p><strong>Next steps:</strong></p>
                  <ol>
                    <li>Your bot will automatically respond to Instagram DMs</li>
                    <li>Test it by sending a DM to your Instagram account</li>
                    <li>Customize your pricing and voice in the admin panel</li>
                  </ol>
                  <p><a href="/admin">Go to Admin Dashboard</a></p>
                </div>
              \`;
            } else {
              document.body.innerHTML += \`
                <div class="error">
                  <h3>❌ Setup Failed</h3>
                  <p>\${result.error}</p>
                </div>
              \`;
            }
          } catch (error) {
            document.body.innerHTML += \`
              <div class="error">
                <h3>❌ Error</h3>
                <p>\${error.message}</p>
              </div>
            \`;
          }
        });
      </script>
    </body>
    </html>
  `);
});

/**
 * POST /onboarding - Create creator profile
 */
router.post('/', (req, res) => {
  const profileData = req.body;
  
  // Validate the data
  const validation = validateProfileData(profileData);
  if (!validation.isValid) {
    return res.json({ 
      success: false, 
      error: `Validation failed: ${validation.errors.join(', ')}` 
    });
  }
  
  // Create the profile
  const result = createCreatorProfile(profileData.tenantId, profileData);
  
  if (result.success) {
    res.json({ 
      success: true, 
      message: 'Profile created successfully!',
      tenantId: profileData.tenantId,
      webhookUrl: `https://voicely-bay.vercel.app/webhook/${profileData.tenantId}`
    });
  } else {
    res.json({ 
      success: false, 
      error: result.error 
    });
  }
});

/**
 * GET /onboarding/callback - Handle Instagram OAuth callback
 */
router.get('/callback', (req, res) => {
  const { code, tenant, creator } = req.query;
  
  if (!code || !tenant || !creator) {
    return res.redirect('/onboarding?error=missing_params');
  }
  
  // Handle the OAuth callback
  const result = handleInstagramCallback(code, tenant, creator);
  
  if (result.success) {
    res.redirect(`/onboarding?name=${encodeURIComponent(creator)}&connected=true`);
  } else {
    res.redirect(`/onboarding?name=${encodeURIComponent(creator)}&error=connection_failed`);
  }
});

module.exports = router;
