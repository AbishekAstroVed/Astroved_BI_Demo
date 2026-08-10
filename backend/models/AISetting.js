import mongoose from 'mongoose';

const AISettingSchema = new mongoose.Schema({
  apiKey: { type: String, default: '' },
  model: { type: String, default: 'gpt-4o' },
  refreshInterval: { type: String, default: '6 Hours' },
  maxTokens: { type: Number, default: 2048 },
  temperature: { type: Number, default: 0.7 },
  enabled: { type: Boolean, default: true },
  prompts: { type: String, default: '' }
});

export default mongoose.model('AISetting', AISettingSchema);
