import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema()
class FlatFee {
  @Prop({ type: Boolean, default: false })
  enabled: boolean;

  @Prop({ type: Number, default: 0 })
  amountCents: number;
}

export type DispatchConfigsDocument = DispatchConfigs & Document;

@Schema({
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
  collection: DispatchConfigs.name,
})
export class DispatchConfigs {
  @Prop({ auto: true })
  _id!: mongoose.Schema.Types.ObjectId;

  @Prop({ type: FlatFee, default: new FlatFee(), _id: false })
  flatFee: FlatFee;

  @Prop({ type: Number, default: 1 })
  waitingMinutesDriverConfirmation: number;
}

export const DispatchConfigsSchema =
  SchemaFactory.createForClass(DispatchConfigs);
