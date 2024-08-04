import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookEventsDocument = WebhookEvents & Document;

@Schema({
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
  strict: false,
  collection: WebhookEvents.name,
})
export class WebhookEvents {}

export const WebhookEventsSchema = SchemaFactory.createForClass(WebhookEvents);
