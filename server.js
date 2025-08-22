require('dotenv').config();
const express = require('express');
const { handleWebhookVerification, handleWebhookEvents } = require('./routes/webhook');
const onboardingRouter = require('./routes/onboarding');
const landingRouter = require('./routes/landing');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Voicely DM Bot - B2B Multi-tenant Ready');
console.log('📦 Configurations will be loaded per-tenant');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Webhook routes - support both single and multi-tenant
app.get('/webhook', handleWebhookVerification);
app.post('/webhook', handleWebhookEvents);

// Multi-tenant webhook routes
app.get('/webhook/:tenantId', handleWebhookVerification);
app.post('/webhook/:tenantId', handleWebhookEvents);

// Landing page
app.use('/', landingRouter);

// Onboarding routes
app.use('/onboarding', onboardingRouter);

// Admin dashboard
app.use('/admin', adminRouter);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 InstaClose DM Bot running on port ${PORT}`);
  console.log(`🔗 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  
  // Log environment info
  console.log(`📱 Page ID: ${process.env.PAGE_ID || 'NOT SET'}`);
  console.log(`🎯 Creator: ${process.env.CREATOR_NAME || 'NOT SET'}`);
  console.log(`📅 Booking URL: ${process.env.BOOKING_URL || 'NOT SET'}`);
  
  if (process.env.SLACK_WEBHOOK_URL) {
    console.log('🔔 Slack notifications enabled');
  } else {
    console.log('📝 Handoffs will be logged only (no Slack webhook)');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  process.exit(0);
});
