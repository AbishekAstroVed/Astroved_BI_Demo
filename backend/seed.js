import mongoose from 'mongoose';
import User from './models/User.js';
import RolePermission from './models/RolePermission.js';
import KPI from './models/KPI.js';
import TargetMetric from './models/TargetMetric.js';
import ReportSchedule from './models/ReportSchedule.js';
import NotificationSetting from './models/NotificationSetting.js';
import AISetting from './models/AISetting.js';
import Integration from './models/Integration.js';
import AuditLog from './models/AuditLog.js';
import SystemConfig from './models/SystemConfig.js';

export const seedDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.log('[Database Seeder] Skipping auto-seed: Database is in offline mock mode.');
    return;
  }
  try {
    // 1. Seed/Upsert Users
    const defaultUsers = [
      { empId: 'EMP001', name: 'System Admin', email: 'admin@astroved.com', password: 'admin123', phone: '+91 98765 43200', department: 'Analytics', designation: 'Super Admin', role: 'Super Admin', status: 'Active', createdDate: '2025-01-01', lastLogin: '2026-07-14 16:30' },

    ];
    for (const u of defaultUsers) {
      await User.findOneAndUpdate({ empId: u.empId }, u, { upsert: true, new: true });
    }
    console.log('Seeded/updated default users.');

    // 2. Seed/Upsert RolePermissions
    const defaultRoles = [
      {
        role: 'System Admin',
        permissions: {
          dashboard: { executive: true, sales: true, marketing: true, newsletter: true, seo: true, customer: true, funnel: true, operations: true, ai: true },
          data: { view: true, export: true, download: true, drillDown: true, viewCost: true, viewRevenue: true, viewProfit: true, viewCustomer: true },
          management: { users: true, roles: true, kpis: true, targets: true, reports: true, ai: true, notifications: true, integrations: true, apis: true },
          crud: { view: true, create: true, edit: true, delete: true, approve: true, publish: true }
        }
      },
      {
        role: 'Super Admin',
        permissions: {
          dashboard: { executive: true, sales: true, marketing: true, newsletter: true, seo: true, customer: true, funnel: true, operations: true, ai: true },
          data: { view: true, export: true, download: true, drillDown: true, viewCost: true, viewRevenue: true, viewProfit: true, viewCustomer: true },
          management: { users: true, roles: true, kpis: true, targets: true, reports: true, ai: true, notifications: true, integrations: true, apis: true },
          crud: { view: true, create: true, edit: true, delete: true, approve: true, publish: true }
        }
      },
      {
        role: 'Analyst',
        permissions: {
          dashboard: { executive: true, sales: true, marketing: false, newsletter: false, seo: false, customer: true, funnel: false, operations: false, ai: true },
          data: { view: true, export: false, download: true, drillDown: true, viewCost: false, viewRevenue: true, viewProfit: false, viewCustomer: false },
          management: { users: false, roles: false, kpis: false, targets: false, reports: true, ai: false, notifications: false, integrations: false, apis: false },
          crud: { view: true, create: false, edit: false, delete: false, approve: false, publish: false }
        }
      },
      {
        role: 'Admin',
        permissions: {
          dashboard: { executive: true, sales: true, marketing: true, newsletter: true, seo: true, customer: true, funnel: true, operations: true, ai: true },
          data: { view: true, export: true, download: true, drillDown: true, viewCost: true, viewRevenue: true, viewProfit: true, viewCustomer: true },
          management: { users: true, roles: false, kpis: true, targets: true, reports: true, ai: true, notifications: true, integrations: true, apis: true },
          crud: { view: true, create: true, edit: true, delete: false, approve: true, publish: true }
        }
      }
    ];
    for (const r of defaultRoles) {
      await RolePermission.findOneAndUpdate({ role: r.role }, r, { upsert: true, new: true });
    }
    console.log('Seeded/updated default role permissions.');

    // 3. Seed KPIs
    const kpiCount = await KPI.countDocuments();
    if (kpiCount === 0) {
      await KPI.insertMany([])

      console.log('Seeded default KPIs.');
    }

    // 4. Seed TargetMetrics
    const targetCount = await TargetMetric.countDocuments();
    if (targetCount === 0) {
      await TargetMetric.insertMany([])

      console.log('Seeded default target metrics.');
    }

    // 5. Seed ReportSchedules
    const scheduleCount = await ReportSchedule.countDocuments();
    if (scheduleCount === 0) {
      await ReportSchedule.insertMany([])

      console.log('Seeded default report schedules.');
    }

    // 6. Seed NotificationSettings
    const notifCount = await NotificationSetting.countDocuments();
    if (notifCount === 0) {
      await NotificationSetting.create({
        emailNotif: true,
        dashboardAlerts: true,
        slackWebhook: 'https://hooks.slack.com/services/SLACK_MOCK_WEBHOOK_URL',
        teamsWebhook: '',
        rules: { revenueAlerts: true, kpiAlerts: true, failedPaymentAlerts: true, aiInsightAlerts: false }
      });
      console.log('Seeded default notification settings.');
    }

    // 7. Seed AISettings
    const defaultPrompt = 'You are AstroVed\'s Lead BI Analyst. Analyze the platform\'s multi-channel metrics (Puja Services, Gemstones, Consultation, Products), traffic acquisition channels (Organic vs Paid), conversion funnel drop-offs (especially Add-to-Cart to Purchase), and operational checkouts (payment gateway success, refund rates, bank latency). Identify key trends, opportunities, and critical anomalies. For every insight, provide a precise explanation of why it occurred and outline exactly 2 concrete, strategic recommendations (e.g., budget reallocations, email campaigns, checkout flow adjustments) to maximize growth or mitigate issues.';

    let aiConfig = await AISetting.findOne({});
    if (!aiConfig) {
      await AISetting.create({
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-4o',
        refreshInterval: '6 Hours',
        maxTokens: 2048,
        temperature: 0.7,
        enabled: true,
        prompts: defaultPrompt
      });
      console.log('Seeded default AI settings.');
    } else {
      let updated = false;
      if ((aiConfig.apiKey === '' || aiConfig.apiKey.includes('••••') || aiConfig.apiKey.includes('***')) && process.env.OPENAI_API_KEY) {
        aiConfig.apiKey = process.env.OPENAI_API_KEY;
        updated = true;
      }
      if (aiConfig.prompts === 'Analyze AstroVed dashboard anomalies and draft immediate strategic interventions.' || aiConfig.prompts === '') {
        aiConfig.prompts = defaultPrompt;
        updated = true;
      }
      if (updated) {
        await aiConfig.save();
        console.log('Updated database AI settings with values from env and default premium prompt template.');
      }
    }

    // 8. Seed Integrations
    const defaultIntegrations = [
      {
        id: 'google-analytics',
        name: 'Google Analytics (GA4)',
        connected: false,
        lastSync: 'Never',
        config: {
          measurementId: process.env.GA_MEASUREMENT_ID || 'G-KTDRH6FFBS',
          apiSecret: process.env.GA_API_SECRET || '81K-3pa0TkearOxg4yRsbA',
          propertyId: process.env.GA_PROPERTY_ID || '388055358',
          oauthConnected: 'false'
        }
      },
      {
        id: 'google-search-console',
        name: 'Google Search Console',
        connected: true,
        lastSync: '1 hour ago',
        config: {
          siteUrl: process.env.GSC_SITE_URL || 'https://www.astroved.com',
          clientEmail: process.env.GSC_CLIENT_EMAIL || 'gsc-sync@astroved.iam.gserviceaccount.com',
          privateKey: process.env.GSC_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC6...\n-----END PRIVATE KEY-----'
        }
      },
      {
        id: 'meta-ads',
        name: 'Meta Ads Manager',
        connected: false,
        lastSync: 'Never',
        config: {
          appId: process.env.META_ADS_APP_ID || '',
          appSecret: process.env.META_ADS_APP_SECRET || '',
          accessToken: process.env.META_ADS_ACCESS_TOKEN || 'mock_meta_ads_long_lived_token_xyz',
          adAccountId: process.env.META_ADS_AD_ACCOUNT_ID || '',
          businessManagerId: process.env.META_ADS_BUSINESS_MANAGER_ID || '',
          pixelId: process.env.META_ADS_PIXEL_ID || '123456789012345'
        }
      },
      {
        id: 'google-ads',
        name: 'Google Ads',
        connected: true,
        lastSync: '30 min ago',
        config: {
          developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || 'mock_dev_token_9876',
          clientId: process.env.GOOGLE_ADS_CLIENT_ID || 'mock_google_ads_client_id.apps.googleusercontent.com',
          clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || 'mock_google_ads_client_secret_654321',
          refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
          customerId: process.env.GOOGLE_ADS_CUSTOMER_ID || '123-456-7890'
        }
      },
      {
        id: 'payment-gateway',
        name: 'Razorpay / Stripe',
        connected: true,
        lastSync: 'Real-time',
        config: {
          stripeAccount: process.env.STRIPE_ACCOUNT || '',
          stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
          stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
          stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
          razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
          razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
          webhook: process.env.WEBHOOK_URL || ''
        }
      },
      {
        id: 'sql-database',
        name: 'BigQuery / PostgreSQL',
        connected: true,
        lastSync: '15 min ago',
        config: {
          host: process.env.PG_HOST || 'localhost',
          port: process.env.PG_PORT || '5432',
          database: process.env.PG_DATABASE || 'astroved_bi',
          username: process.env.PG_USERNAME || 'astroved_readonly',
          password: process.env.PG_PASSWORD || 'mock_db_password_456'
        }
      },
      {
        id: 'zoho-crm',
        name: 'Zoho CRM',
        connected: false,
        lastSync: 'Never',
        config: {
          clientId: process.env.ZOHO_CRM_CLIENT_ID || '',
          clientSecret: process.env.ZOHO_CRM_CLIENT_SECRET || '',
          refreshToken: process.env.ZOHO_CRM_REFRESH_TOKEN || '',
          organizationId: process.env.ZOHO_CRM_ORGANIZATION_ID || '',
          dataCenterUrl: process.env.ZOHO_CRM_DATA_CENTER_URL || ''
        }
      }
    ];

    for (const integration of defaultIntegrations) {
      await Integration.findOneAndUpdate({ id: integration.id }, integration, { upsert: true, new: true });
    }
    console.log('Seeded/updated default integrations.');

    // 9. Seed AuditLogs
    const logCount = await AuditLog.countDocuments();
    if (logCount === 0) {
      await AuditLog.insertMany([]);
      console.log('Seeded default audit logs.');
    }

    // 10. Seed SystemConfig
    const systemCount = await SystemConfig.countDocuments();
    if (systemCount === 0) {
      await SystemConfig.create({});
      console.log('Seeded default system configurations.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
