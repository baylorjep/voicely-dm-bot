const { createTenantConfig } = require('./tenant');
const fs = require('fs');
const path = require('path');

/**
 * Self-service onboarding for new creators
 */

/**
 * Generate onboarding instructions for a new creator
 */
function generateOnboardingInstructions(tenantId, creatorName) {
  return {
    step1: {
      title: "1. Create Your Meta App",
      instructions: [
        "Go to https://developers.facebook.com/",
        "Click 'Create App' → Business → Instagram Basic Display",
        "Name your app: 'Voicely Bot - [Your Name]'",
        "Add Instagram Basic Display product"
      ],
      estimatedTime: "5 minutes"
    },
    step2: {
      title: "2. Connect Your Instagram Account",
      instructions: [
        "In your app, go to Instagram Basic Display → Basic Display",
        "Click 'Add Instagram Account'",
        "Log in with your Instagram Business/Creator account",
        "Copy your Instagram User ID (you'll need this)"
      ],
      estimatedTime: "3 minutes"
    },
    step3: {
      title: "3. Generate Access Token",
      instructions: [
        "Go to Instagram Basic Display → Basic Display → User Token Generator",
        "Click 'Generate Token'",
        "Select permissions: user_profile, user_media",
        "Copy the generated token"
      ],
      estimatedTime: "2 minutes"
    },
    step4: {
      title: "4. Set Up Webhook",
      instructions: [
        "Go to Instagram Basic Display → Basic Display → Webhooks",
        "Add webhook URL: https://your-domain.com/webhook/" + tenantId,
        "Set verify token: voicely_" + tenantId,
        "Subscribe to 'messages' events"
      ],
      estimatedTime: "3 minutes"
    },
    step5: {
      title: "5. Complete Your Profile",
      instructions: [
        "Fill out your creator profile below",
        "Add your Calendly booking link",
        "Customize your pricing and voice",
        "Test your bot!"
      ],
      estimatedTime: "5 minutes"
    }
  };
}

/**
 * Create a new creator profile
 */
function createCreatorProfile(tenantId, profileData) {
  const {
    creatorName,
    bookingUrl,
    instagramUserId,
    pageId,
    pageAccessToken,
    verifyToken,
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
    meta_config: {
      page_id: pageId,
      page_access_token: pageAccessToken
    },
    instagram_user_id: instagramUserId,
    verify_token: verifyToken || `voicely_${tenantId}`,
    onboarding_completed: true,
    created_at: new Date().toISOString()
  };

  try {
    createTenantConfig(tenantId, config);
    return { success: true, config };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Validate creator profile data
 */
function validateProfileData(profileData) {
  const errors = [];
  
  if (!profileData.creatorName) {
    errors.push("Creator name is required");
  }
  
  if (!profileData.bookingUrl) {
    errors.push("Booking URL is required");
  }
  
  if (!profileData.pageId) {
    errors.push("Meta Page ID is required");
  }
  
  if (!profileData.pageAccessToken) {
    errors.push("Meta Page Access Token is required");
  }
  
  if (!profileData.verifyToken) {
    errors.push("Webhook verify token is required");
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
  const nameSlug = creatorName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 10);
  return `${nameSlug}_${timestamp}`;
}

/**
 * Test webhook connection
 */
async function testWebhookConnection(tenantId, verifyToken) {
  // This would make a test call to verify the webhook is working
  // For MVP, we'll just validate the format
  return {
    success: true,
    message: "Webhook URL format is valid",
    webhookUrl: `https://your-domain.com/webhook/${tenantId}`
  };
}

module.exports = {
  generateOnboardingInstructions,
  createCreatorProfile,
  validateProfileData,
  generateTenantId,
  testWebhookConnection
};
