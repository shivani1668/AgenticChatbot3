import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  role: { type: String, default: 'member' }, // member, lead, admin
  skills: [{ type: String }],
  projects: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
