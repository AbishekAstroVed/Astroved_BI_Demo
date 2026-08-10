import mongoose from 'mongoose';

const IntegrationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  connected: { type: Boolean, default: false },
  lastSync: { type: String, default: 'Never' },
  config: { type: Map, of: String, default: {} }
});

export default mongoose.model('Integration', IntegrationSchema);
