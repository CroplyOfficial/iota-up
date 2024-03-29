import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  members: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    required: true,
  },
  messages: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    required: true,
  },
  isBlocked: {
    type: Boolean,
    required: true,
    default: false,
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId || null,
  },
});

chatSchema.pre('remove', function (callback: any) {
  // Remove all the docs that refers
  // @ts-ignore
  this.model('Message').deleteMany({ _id: this.messages }, callback);
});

export interface IChatModel {
  members: [mongoose.Schema.Types.ObjectId, mongoose.Schema.Types.ObjectId];
  messages: Array<mongoose.Schema.Types.ObjectId>;
  isBlocked: boolean;
  blockedBy: mongoose.Schema.Types.ObjectId | null;
}

const Chat = mongoose.model<IChatModel>('Chat', chatSchema);
export { Chat };
