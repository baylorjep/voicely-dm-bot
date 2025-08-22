#!/usr/bin/env node

/**
 * Create a new tenant configuration for B2B setup
 * Usage: node scripts/create-tenant.js <tenantId>
 */

const { createTenantConfig } = require('../lib/tenant');

function main() {
  const tenantId = process.argv[2];
  
  if (!tenantId) {
    console.log('❌ Please provide a tenant ID');
    console.log('Usage: node scripts/create-tenant.js <tenantId>');
    console.log('Example: node scripts/create-tenant.js photographer_sarah');
    process.exit(1);
  }
  
  console.log(`🏗️ Creating tenant configuration for: ${tenantId}`);
  
  // Default configuration template
  const config = {
    creator_name: "Creator Name",
    booking_url: "https://calendly.com/creator/30min",
    pricing_config: "./config/pricing.sample.yml",
    voice_config: "./config/voice.sample.json", 
    persona_config: "./config/persona.sample.json",
    meta_config: {
      page_id: "YOUR_PAGE_ID",
      page_access_token: "YOUR_PAGE_ACCESS_TOKEN"
    }
  };
  
  try {
    createTenantConfig(tenantId, config);
    console.log(`✅ Tenant configuration created: config/tenants/${tenantId}.json`);
    console.log('\n📝 Next steps:');
    console.log(`1. Edit config/tenants/${tenantId}.json with your specific values`);
    console.log('2. Set up Meta app and get page_id + page_access_token');
    console.log('3. Update booking_url with your Calendly link');
    console.log('4. Customize pricing, voice, and persona configs');
    console.log(`5. Use webhook URL: https://your-domain.com/webhook/${tenantId}`);
  } catch (error) {
    console.error('❌ Error creating tenant config:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
