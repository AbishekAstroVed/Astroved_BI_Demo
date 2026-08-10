import mongoose from 'mongoose';

const ReportScheduleSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  dashboards: [{ type: String, required: true }],
  frequency: { type: String, required: true },
  format: { type: String, required: true },
  recipients: [{ type: String, required: true }],
  time: { type: String, required: true },
  period: { type: String, default: 'Daily' },
  timeZone: { type: String, default: 'GMT+5:30' },
  senderEmail: { type: String, default: 'no-reply@astroved.com' }
});

export default mongoose.model('ReportSchedule', ReportScheduleSchema);
