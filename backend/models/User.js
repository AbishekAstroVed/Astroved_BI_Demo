import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: 'astroved123' },
  phone: { type: String },
  department: { type: String, default: 'Analytics' },
  designation: { type: String },
  role: { type: String, default: 'Analyst' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdDate: { type: String },
  lastLogin: { type: String, default: 'Never' }
});

export default mongoose.model('User', UserSchema);
