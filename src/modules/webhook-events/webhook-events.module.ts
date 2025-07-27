import { Module } from '@nestjs/common';
import { WebhookEventsController } from './webhook-events.controller';
import { WebhookEventsService } from './webhook-events.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WebhookEvents,
  WebhookEventsSchema,
} from '../../database/schemas/webhook-events.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebhookEvents.name, schema: WebhookEventsSchema },
    ]),
  ],
  controllers: [WebhookEventsController],
  providers: [WebhookEventsService],
})
export class WebhookEventsModule {}
