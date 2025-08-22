const express = require('express');
const fs = require('fs');
const path = require('path');
const { getTenantConfig } = require('../lib/tenant');

const router = express.Router();

/**
 * GET /admin - Admin dashboard
 */
router.get('/', (req, res) => {
  const tenantsDir = path.join(__dirname, '../config/tenants');
  let tenants = [];
  
  try {
    if (fs.existsSync(tenantsDir)) {
      const files = fs.readdirSync(tenantsDir);
      tenants = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const tenantId = file.replace('.json', '');
          const config = getTenantConfig(tenantId);
          return {
            id: tenantId,
            name: config.creator_name,
            bookingUrl: config.booking_url,
            createdAt: config.created_at,
            onboardingCompleted: config.onboarding_completed,
            webhookUrl: `https://your-domain.com/webhook/${tenantId}`
          };
        });
    }
  } catch (error) {
    console.error('Error reading tenants:', error);
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>InstaClose Admin</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
          max-width: 1200px; 
          margin: 0 auto; 
          padding: 20px;
        }
        .header { 
          background: #2c3e50; 
          color: white; 
          padding: 20px; 
          border-radius: 8px; 
          margin-bottom: 30px; 
        }
        .stats { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
          gap: 20px; 
          margin-bottom: 30px; 
        }
        .stat { 
          background: #ecf0f1; 
          padding: 20px; 
          border-radius: 8px; 
          text-align: center; 
        }
        .stat-number { font-size: 2rem; font-weight: bold; color: #3498db; }
        .tenant { 
          background: white; 
          border: 1px solid #ddd; 
          padding: 20px; 
          margin: 10px 0; 
          border-radius: 8px; 
        }
        .tenant-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 15px; 
        }
        .tenant-name { font-size: 1.2rem; font-weight: bold; }
        .tenant-status { 
          padding: 5px 10px; 
          border-radius: 4px; 
          font-size: 0.9rem; 
        }
        .status-active { background: #d4edda; color: #155724; }
        .status-pending { background: #fff3cd; color: #856404; }
        .tenant-details { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
          gap: 15px; 
        }
        .detail { 
          background: #f8f9fa; 
          padding: 10px; 
          border-radius: 4px; 
        }
        .detail-label { font-weight: bold; color: #666; }
        .code { 
          background: #f1f3f4; 
          padding: 5px; 
          border-radius: 3px; 
          font-family: monospace; 
          font-size: 0.9rem; 
        }
        .no-tenants { 
          text-align: center; 
          padding: 60px; 
          color: #666; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚀 Voicely Admin Dashboard</h1>
        <p>Manage your B2B Instagram DM bot tenants</p>
      </div>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-number">${tenants.length}</div>
          <div>Total Tenants</div>
        </div>
        <div class="stat">
          <div class="stat-number">${tenants.filter(t => t.onboardingCompleted).length}</div>
          <div>Active Tenants</div>
        </div>
        <div class="stat">
          <div class="stat-number">${tenants.filter(t => !t.onboardingCompleted).length}</div>
          <div>Pending Setup</div>
        </div>
      </div>
      
      ${tenants.length === 0 ? `
        <div class="no-tenants">
          <h2>No tenants yet</h2>
          <p>Direct creators to <a href="/onboarding">/onboarding</a> to get started</p>
        </div>
      ` : `
        <h2>Tenant Overview</h2>
        ${tenants.map(tenant => `
          <div class="tenant">
            <div class="tenant-header">
              <div class="tenant-name">${tenant.name}</div>
              <div class="tenant-status ${tenant.onboardingCompleted ? 'status-active' : 'status-pending'}">
                ${tenant.onboardingCompleted ? 'Active' : 'Pending Setup'}
              </div>
            </div>
            <div class="tenant-details">
              <div class="detail">
                <div class="detail-label">Tenant ID:</div>
                <div class="code">${tenant.id}</div>
              </div>
              <div class="detail">
                <div class="detail-label">Booking URL:</div>
                <div>${tenant.bookingUrl}</div>
              </div>
              <div class="detail">
                <div class="detail-label">Webhook URL:</div>
                <div class="code">${tenant.webhookUrl}</div>
              </div>
              <div class="detail">
                <div class="detail-label">Created:</div>
                <div>${new Date(tenant.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        `).join('')}
      `}
      
      <div style="margin-top: 40px; text-align: center;">
        <a href="/onboarding" style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Add New Tenant
        </a>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;
