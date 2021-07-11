import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export interface IPostModel extends mongoose.Document {
  project: mongoose.Types.ObjectId;
  title: string;
  body: string;
  created: Date;
}

const Post = mongoose.model<IPostModel>('Post', PostSchema);
export { Post };
