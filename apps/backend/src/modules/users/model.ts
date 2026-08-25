import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface UserDoc extends mongoose.Document {
  email: string;
  passwordHash: string;
  role: 'admin';
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<UserDoc>(
  {
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
  },
  { timestamps: true }
);

/** Compara la contraseña plana contra el hash (bcrypt) */
userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<UserDoc>('User', userSchema);
