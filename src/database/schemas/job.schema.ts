import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Task } from './task.schema';

export type JobDocument = Job & Document;

@Schema({
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
  collection: Job.name,
})
export class Job {
  @Prop({ auto: true })
  _id!: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Task.name,
  })
  currentTask: string;

  @Prop({
    type: Array<mongoose.Schema.Types.ObjectId>,
    required: true,
    ref: Task.name,
  })
  taskList: string[];
}

export const JobSchema = SchemaFactory.createForClass(Job);
