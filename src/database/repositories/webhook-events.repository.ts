import { AbstractRepository } from './abstract.repository';
import { WebhookEvents, WebhookEventsDocument } from '../schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WebhookEventsRepository extends AbstractRepository<WebhookEventsDocument> {
  logger = new Logger(WebhookEventsRepository.name);

  constructor(
    @InjectModel(WebhookEvents.name)
    webhookEventsModel: Model<WebhookEventsDocument>,
  ) {
    super(webhookEventsModel);
  }
}
