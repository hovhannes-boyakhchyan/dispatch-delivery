import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ProvidersConfigType } from '../../common/types';

export type BusinessSettingsDocument = BusinessSettings & Document;

@Schema({
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
  collection: BusinessSettings.name,
})
export class BusinessSettings {
  @Prop({ auto: true })
  _id!: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, unique: true, required: true })
  businessId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  deliveryStrategyId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Object })
  providersConfig: ProvidersConfigType;
}

export const BusinessSettingsSchema =
  SchemaFactory.createForClass(BusinessSettings);
