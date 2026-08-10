import mongoose from 'mongoose';

const SystemConfigSchema = new mongoose.Schema({
  companyName: { type: String, default: 'AstroVed Business Solutions' },
  logoUrl: { type: String, default: 'https://cdn.astroved.com/images/images-av/AstroVed-Logo.svg' },
  themeMode: { type: String, default: 'light' },
  currency: { type: String, default: '₹ (INR)' },
  timeZone: { type: String, default: 'GMT+5:30 (IST)' },
  fiscalYear: { type: String, default: 'April - March' },
  dateFormat: { type: String, default: 'DD-MM-YYYY' },
  timeFormat: { type: String, default: '12-hour' },
  language: { type: String, default: 'English (US)' },
  companyEmail: { type: String, default: 'contact@astroved.com' },
  companyPhone: { type: String, default: '+91 44 43419800' },
  companyAddress: { type: String, default: 'AstroVed Business Solutions, Chennai, India' },
  autoBackup: { type: Boolean, default: true },
  backupInterval: { type: String, default: 'Daily' },
  smtpHost: { type: String, default: '' },
  smtpPort: { type: Number, default: 587 },
  smtpUser: { type: String, default: '' },
  smtpPass: { type: String, default: '' },
  smtpFrom: { type: String, default: '' }
});

export default mongoose.model('SystemConfig', SystemConfigSchema);
