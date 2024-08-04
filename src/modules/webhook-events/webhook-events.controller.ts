import { Body, Controller, Post } from '@nestjs/common';
import { WebhookEventsService } from './webhook-events.service';
import { EventDto } from './dto/event.dto';
import { WebhookEvents } from '../../database/schemas/webhook-events.schema';

@Controller('webhook')
export class WebhookEventsController {
  constructor(private readonly webhookEventsService: WebhookEventsService) {}

  @Post()
  async event(@Body() eventDto: EventDto): Promise<WebhookEvents> {
    const eventData: WebhookEvents = await this.webhookEventsService.saveEvent(
      eventDto,
    );

    return eventData;
  }
}
