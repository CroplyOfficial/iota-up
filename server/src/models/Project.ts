import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  tags: {
    type: Array,
    required: true,
  },
  projectAuthor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  upvotes: {
    type: Number,
    required: true,
    default: 0,
  },
  backers: {
    type: Number,
    required: true,
    default: 0,
  },
  media: {
    type: Array,
    required: true,
    default: [],
  },
  created: {
    type: Date,
    default: Date.now,
    required: true,
  },
  video: {
    type: String,
    required: false,
  },
  category: {
    type: Array,
    required: true,
    default: [],
  },
  wallet: {
    type: String,
    required: true,
  },
});

export interface IProjectModel extends mongoose.Document {
  name: string;
  desc: string;
  projectAuthor: mongoose.Schema.Types.ObjectId;
  tags: Array<string>;
  upvotes: number;
  backers: number;
  media: Array<string>;
  created: Date;
  video: string;
  category: string[];
  wallet: string;
}

const Project = mongoose.model<IProjectModel>('Project', projectSchema);
export { Project };
