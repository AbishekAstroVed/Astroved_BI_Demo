import mongoose from 'mongoose';

const KPISchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  formula: { type: String },
  order: { type: Number },
  color: { type: String },
  target: { type: String },
  warning: { type: String },
  critical: { type: String }
});

export default mongoose.model('KPI', KPISchema);
