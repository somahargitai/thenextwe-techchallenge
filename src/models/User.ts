import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'client' | 'coach' | 'project-manager' | 'operations';

export interface IUser extends Document {
  role: UserRole;
  firstName: string;
  lastName: string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['client', 'coach', 'project-manager', 'operations'] as const,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', userSchema);
