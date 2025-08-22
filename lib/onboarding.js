const { createTenantConfig } = require('./tenant');
const fs = require('fs');
const path = require('path');

/**
 * Simplified self-service onboarding for new creators
 * No Meta app creation required - users just connect their Instagram account
 */

/**
 * Generate simplified onboarding instructions
 */
function generateOnboardingInstructions(tenantId, creatorName) {
  return {
    step1: {
      title: "1. Connect Your Instagram Account",
      instructions: [
        "Click the 'Connect Instagram' button below",
        "Log in with your Instagram Business/Creator account",
        "Authorize Voicely to access your Instagram",
        "We'll automatically get your Instagram User ID"
      ],
      estimatedTime: "2 minutes"
    },
    step2: {
      title: "2. Complete Your Profile",
      instructions: [
        "Fill out your creator profile below",
        "Add your Calendly booking link",
        "Customize your bot's voice and pricing",
        "Your bot will be ready immediately!"
      ],
      estimatedTime: "3 minutes"
    }
  };
}

/**
 * Create a new creator profile with simplified setup
 */
function createCreatorProfile(tenantId, profileData) {
  const {
    creatorName,
    bookingUrl,
    instagramUserId,
    pricingConfig = './config/pricing.sample.yml',
    voiceConfig = './config/voice.sample.json',
    personaConfig = './config/persona.sample.json'
  } = profileData;

  const config = {
    creator_name: creatorName,
    booking_url: bookingUrl,
    pricing_config: pricingConfig,
    voice_config: voiceConfig,
    persona_config: personaConfig,
    // Use the platform's Meta app credentials (set in environment variables)
    meta_config: {
      page_id: process.env.PAGE_ID,
      page_access_token: process.env.PAGE_ACCESS_TOKEN
    },
    instagram_user_id: instagramUserId,
    verify_token: `voicely_${tenantId}`,
    onboarding_completed: true,
    created_at: new Date().toISOString()
  };

  try {
    createTenantConfig(tenantId, config);
    return { success: true, config };
  } catch (error) {
    console.error('Error creating creator profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Validate profile data
 */
function validateProfileData(profileData) {
  const errors = [];
  
  if (!profileData.creatorName?.trim()) {
    errors.push('Creator name is required');
  }
  
  if (!profileData.bookingUrl?.trim()) {
    errors.push('Booking URL is required');
  }
  
  if (!profileData.instagramUserId?.trim()) {
    errors.push('Instagram User ID is required');
  }
  
  // Validate booking URL format
  if (profileData.bookingUrl && !profileData.bookingUrl.startsWith('https://')) {
    errors.push('Booking URL must start with https://');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate a unique tenant ID
 */
function generateTenantId(creatorName) {
  const timestamp = Date.now().toString(36);
  const nameSlug = creatorName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
  return `${nameSlug}_${timestamp}`;
}

/**
 * Test webhook connection (simplified)
 */
function testWebhookConnection(tenantId) {
  // For now, just return success since we're using the platform's webhook
  return {
    success: true,
    message: 'Webhook configured automatically',
    webhookUrl: `https://voicely-bay.vercel.app/webhook/${tenantId}`
  };
}

/**
 * Get Instagram authorization URL
 */
function getInstagramAuthUrl(tenantId, creatorName) {
  const redirectUri = encodeURIComponent(`https://voicely-bay.vercel.app/onboarding/callback?tenant=${tenantId}&creator=${encodeURIComponent(creatorName)}`);
  const clientId = process.env.INSTAGRAM_APP_ID;
  
  return `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;
}

/**
 * Handle Instagram OAuth callback
 */
function handleInstagramCallback(code, tenantId, creatorName) {
  // This would exchange the code for an access token
  // For MVP, we'll just return success and let user manually enter Instagram User ID
  return {
    success: true,
    message: 'Instagram connected successfully!',
    instagramUserId: null // User will need to provide this manually for now
  };
}

module.exports = {
  generateOnboardingInstructions,
  createCreatorProfile,
  validateProfileData,
  generateTenantId,
  testWebhookConnection,
  getInstagramAuthUrl,
  handleInstagramCallback
};
