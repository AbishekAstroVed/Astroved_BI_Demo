import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  user: { type: String, required: true },
  action: { type: String, required: true },
  module: { type: String, required: true },
  ip: { type: String },
  browser: { type: String },
  date: { type: String },
  time: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('AuditLog', AuditLogSchema);
