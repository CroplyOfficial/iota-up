import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  isBanned: {
    type: Boolean,
    required: true,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  },
  wallet: {
    type: String
  },
  city: {
    type: String
  },
  country: {
    type: String
  },
  connections: {
    type: Array
  }
});

// User Interface
export interface UserType extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  isBanned: boolean;
  isAdmin: boolean;
  wallet: string;
  city: string;
  country: string;
  connections: Array<string>;
};

const User = mongoose.model('User', UserSchema);
export { User };
