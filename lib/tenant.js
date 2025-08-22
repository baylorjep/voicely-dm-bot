const fs = require('fs');
const path = require('path');

/**
 * Tenant management for B2B multi-tenant support
 * In production, this would connect to a database
 */

// In-memory tenant store for MVP
const tenantStore = new Map();

/**
 * Load tenant configuration
 * In production, this would fetch from database
 */
function loadTenantConfig(tenantId) {
  // For MVP, we'll use file-based configs
  // In production, this would be database-driven
  const configPath = path.join(__dirname, '../config/tenants', `${tenantId}.json`);
  
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      tenantStore.set(tenantId, config);
      return config;
    }
  } catch (error) {
    console.error(`Error loading tenant config for ${tenantId}:`, error.message);
  }
  
  // Return default config if tenant-specific config doesn't exist
  return {
    creator_name: process.env.CREATOR_NAME || 'Creator',
    booking_url: 'https://calendly.com/creator/30min',
    pricing_config: './config/pricing.sample.yml',
    voice_config: './config/voice.sample.json',
    persona_config: './config/persona.sample.json',
    meta_config: {
      page_id: process.env.PAGE_ID,
      page_access_token: process.env.PAGE_ACCESS_TOKEN
    }
  };
}

/**
 * Get tenant configuration
 */
function getTenantConfig(tenantId) {
  if (!tenantStore.has(tenantId)) {
    return loadTenantConfig(tenantId);
  }
  return tenantStore.get(tenantId);
}

/**
 * Extract tenant ID from webhook payload
 * This is where you'd implement your tenant identification logic
 */
function extractTenantId(req) {
  // For MVP, we'll use a simple approach
  // In production, this could be:
  // - From webhook URL path: /webhook/{tenantId}
  // - From custom headers
  // - From webhook payload metadata
  // - From Instagram account ID mapping
  
  const body = req.body;
  
  // Option 1: From webhook URL path (recommended for B2B)
  const urlParts = req.url.split('/');
  const tenantIdFromUrl = urlParts[urlParts.length - 1];
  if (tenantIdFromUrl && tenantIdFromUrl !== 'webhook') {
    return tenantIdFromUrl;
  }
  
  // Option 2: From Instagram account ID (if you have a mapping)
  if (body.entry && body.entry[0] && body.entry[0].id) {
    const instagramAccountId = body.entry[0].id;
    // In production, you'd have a mapping table: instagramAccountId -> tenantId
    return `tenant_${instagramAccountId}`;
  }
  
  // Option 3: Default tenant for MVP
  return 'default';
}

/**
 * Create tenant configuration file
 */
function createTenantConfig(tenantId, config) {
  const configDir = path.join(__dirname, '../config/tenants');
  const configPath = path.join(configDir, `${tenantId}.json`);
  
  // Ensure config directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ Created tenant config for ${tenantId}`);
}

module.exports = {
  loadTenantConfig,
  getTenantConfig,
  extractTenantId,
  createTenantConfig
};
