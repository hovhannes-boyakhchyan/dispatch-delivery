import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { DeliveryProvidersEnum, QuoteStatusEnums } from '../../common/enums';
import {
  ProviderQuotesDto,
  DeliveryPeriodDto,
  CreateQuoteDto,
} from '../../modules/quote/dto';

export type QuoteDocument = Quote & Document;

@Schema({
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
  collection: Quote.name,
})
export class Quote {
  @Prop({ auto: true })
  _id!: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(QuoteStatusEnums),
    default: QuoteStatusEnums.CREATED,
  })
  status: QuoteStatusEnums;

  @Prop({ type: String, required: true })
  quoteId: string;

  @Prop({ type: String })
  jobId?: string;

  @Prop({ type: String })
  taskId?: string;

  @Prop({ type: String })
  jobConfigurationId?: string;

  @Prop({ type: Number })
  fee: number;

  @Prop({ type: String })
  deliveryTime?: string;

  @Prop({ type: DeliveryPeriodDto })
  deliveryPeriod: DeliveryPeriodDto;

  @Prop({
    type: String,
    enum: Object.values(DeliveryProvidersEnum),
    required: true,
  })
  providerService: DeliveryProvidersEnum;

  @Prop({ type: Array<ProviderQuotesDto> })
  list: ProviderQuotesDto[];

  @Prop({ type: Object, _id: false })
  createQuoteData?: CreateQuoteDto;
}

export const QuoteSchema = SchemaFactory.createForClass(Quote);
