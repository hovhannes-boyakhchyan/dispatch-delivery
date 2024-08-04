import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';
import {
  DeliveryProvidersEnum,
  DeliveryProvidersNameEnum,
  TaskStatusEnums,
} from '../../common/enums';
import {
  CreateTaskDto,
  ProviderDeliveryDetailsDto,
} from '../../modules/job/dto';

export type TaskDocument = Task & Document;

@Schema({
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
  collection: Task.name,
})
export class Task {
  @Prop({ auto: true })
  _id!: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, required: true })
  taskId: string;

  @Prop({
    type: String,
    enum: Object.values(TaskStatusEnums),
    default: TaskStatusEnums.CREATED,
  })
  status: TaskStatusEnums;

  @Prop({
    type: String,
    enum: Object.values(DeliveryProvidersEnum),
    required: true,
  })
  providerService: DeliveryProvidersEnum;

  @Prop({
    type: String,
    enum: Object.values(DeliveryProvidersNameEnum),
    required: true,
  })
  providerServiceName: DeliveryProvidersNameEnum;

  @Prop({ type: String, required: true })
  quoteId: string;

  @Prop({ type: String })
  internalQuoteId: string;

  @Prop({ type: Object, _id: false })
  createdTaskData?: CreateTaskDto;

  @Prop({ type: ProviderDeliveryDetailsDto, _id: false })
  taskDetails?: ProviderDeliveryDetailsDto;

  @Prop({ type: Object, _id: false })
  metadata?: object;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
