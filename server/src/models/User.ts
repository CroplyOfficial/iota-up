import mongoose from "mongoose";

// User Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  bio: {
    type: String,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
    default: "",
  },
  avatar: {
    type: String,
    default: "/images/defaultavatar.png",
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  isBanned: {
    type: Boolean,
    required: true,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  skills: {
    type: Array,
    required: true,
    default: [],
  },
  wallet: {
    type: String,
  },
  city: {
    type: String,
  },
  country: {
    type: String,
  },
  connections: {
    type: Array,
  },
  upvotedProjects: {
    type: Array,
    required: true,
    default: [],
  },
  backedProjects: {
    type: Array,
    required: true,
    default: [],
  },
  projects: {
    type: Array,
    required: true,
    default: [],
  },
  chats: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
    required: true,
    default: [],
  },
});

// User Interface
export interface UserType extends mongoose.Document {
  username: string;
  bio: string;
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  isBanned: boolean;
  isAdmin: boolean;
  wallet: string;
  city: string;
  country: string;
  connections: Array<string>;
  upvotedProjects: Array<mongoose.Schema.Types.ObjectId>;
  backedProjects: Array<mongoose.Schema.Types.ObjectId>;
  projects: string[];
  chats: mongoose.Schema.Types.ObjectId[];
}

const User = mongoose.model("User", UserSchema);
export { User };
