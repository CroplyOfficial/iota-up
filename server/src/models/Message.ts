import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  content: {
    iv: { type: String },
    content: { type: String },
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export interface IMessageSchema {
  sender: mongoose.Schema.Types.ObjectId;
  content: {
    iv: string;
    content: string;
  };
  date: Date;
}

const Message = mongoose.model<IMessageSchema>('Message', messageSchema);
export { Message };
