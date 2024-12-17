import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  conversation: { type: Array, required: true },
});

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);