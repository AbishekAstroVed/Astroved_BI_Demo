import mongoose from 'mongoose';

const NotificationSettingSchema = new mongoose.Schema({
  emailNotif: { type: Boolean, default: true },
  dashboardAlerts: { type: Boolean, default: true },
  slackWebhook: { type: String, default: '' },
  teamsWebhook: { type: String, default: '' },
  rules: {
    revenueAlerts: { type: Boolean, default: true },
    kpiAlerts: { type: Boolean, default: true },
    failedPaymentAlerts: { type: Boolean, default: true },
    aiInsightAlerts: { type: Boolean, default: false }
  }
});

export default mongoose.model('NotificationSetting', NotificationSettingSchema);
