import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import {
  DeliveryProvidersEnum,
  DeliveryStrategyPriorityEnum,
} from '../../common/enums';

export type DeliveryStrategyDocument = DeliveryStrategy & Document;

@Schema({
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
  collection: DeliveryStrategy.name,
})
export class DeliveryStrategy {
  @Prop({ auto: true })
  _id!: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, default: '' })
  title: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: Boolean, default: false })
  isDefault: boolean;

  @Prop({
    type: [String],
    enum: Object.values(DeliveryProvidersEnum),
    required: true,
  })
  deliveryProvidersList: DeliveryProvidersEnum[];

  @Prop({
    type: [String],
    enum: Object.values(DeliveryProvidersEnum),
    required: true,
  })
  preferredDeliveryProviders: DeliveryProvidersEnum[];

  @Prop({ type: Boolean, default: false })
  shortTime: boolean;

  @Prop({ type: Boolean, default: true })
  lowPrice: boolean;

  @Prop({
    type: [String],
    enum: Object.values(DeliveryStrategyPriorityEnum),
    default: [DeliveryStrategyPriorityEnum.LOW_PRICE],
  })
  priority: DeliveryStrategyPriorityEnum[];
}

export const DeliveryStrategySchema =
  SchemaFactory.createForClass(DeliveryStrategy);
