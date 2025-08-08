import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICoaching extends Document {
  clientId: Types.ObjectId;
  coachId: Types.ObjectId;
  projectId: Types.ObjectId;
}

const coachingSchema: Schema<ICoaching> = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Coaching = mongoose.model<ICoaching>('Coaching', coachingSchema);
