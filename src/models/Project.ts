import { Schema, model, Types, Document } from 'mongoose';

export interface ProjectDocument extends Document {
  managerIds: Types.ObjectId[];
}

const projectSchema = new Schema<ProjectDocument>({
  managerIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
});

export const Project = model<ProjectDocument>('Project', projectSchema);
