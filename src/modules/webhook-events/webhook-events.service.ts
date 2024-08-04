import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WebhookEvents,
  WebhookEventsDocument,
} from '../../database/schemas/webhook-events.schema';
import { EventDto } from './dto/event.dto';

@Injectable()
export class WebhookEventsService {
  constructor(
    @InjectModel(WebhookEvents.name)
    private readonly webhookEvents: Model<WebhookEventsDocument>,
  ) {}

  async saveEvent(eventDto: EventDto): Promise<WebhookEvents> {
    const eventData = await this.webhookEvents.create(eventDto);
    return eventData.toObject();
  }
}
