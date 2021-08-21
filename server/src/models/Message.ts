import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

export interface IMessageSchema {
  sender: mongoose.Schema.Types.ObjectId;
  content: string;
}

const Message = mongoose.model<IMessageSchema>("Message", messageSchema);
export { Message };
