import mongoose from 'mongoose';

const TargetMetricSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  value: { type: String, required: true },
  dept: { type: String, default: 'All' },
  country: { type: String, default: 'All' },
  product: { type: String, default: 'All' }
});

export default mongoose.model('TargetMetric', TargetMetricSchema);
