import { Schema, model } from 'mongoose';
import bcrypt from "bcrypt";

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  firstName?: string;
  lastName?: string;
  socialLinks?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string,
    x?: string;
    youtube?: string;
  };
}

// User Schema
const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is Required'],
    maxlength: [20, 'Username cannot be more than 20 characters'],
    unique: [true, 'Username must be unique'],
  },
  email: {
    type: String,
    required: [true, 'Email is Required'],
    unique: [true, 'Email must be unique'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is Required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Do not return password field by default
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: '{VALUE} is not supported',
    },
    default: 'user',
    required: [true, 'Role is Required'],
  },
  firstName: {
    type: String,
    maxlength: [20, 'First Name must be less than 20 characters '],
  },
  lastName: {
    type: String,
    maxlength: [20, 'Last Name must be less than 20 characters '],
  },
  socialLinks: {
    website: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
    x: { type: String },
    youtube: { type: String },
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if(!this.isModified('password')){
    next();
    return;
  }
  // Hash the password 
  this.password = await bcrypt.hash(this.password, 10);
  next();
})

export default model<IUser>('User', userSchema);