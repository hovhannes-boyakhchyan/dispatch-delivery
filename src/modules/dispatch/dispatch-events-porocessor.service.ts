import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TaskRepository } from '../../database/repositories';
import { TaskStatusEnums } from '../../common/enums';
import { DispatchService } from './dispatch.service';
import { ConsumerService } from '../../common/services';
import { TaskStatusDto } from './dto';

type EventProcessor = (event: TaskStatusDto) => Promise<void>;

@Injectable()
export class DispatchEventsProcessorService implements OnModuleInit {
  private readonly logger = new Logger(DispatchEventsProcessorService.name);
  private eventsProcessGateways = new Map<TaskStatusEnums, EventProcessor>();

  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly dispatchService: DispatchService,
    private readonly consumerService: ConsumerService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.registerEventStatusMethods();
    await this.initializeKafkaConsumer();
  }

  private async initializeKafkaConsumer(): Promise<void> {
    try {
      await this.consumeTaskEvent();
    } catch (error) {
      this.logger.error('Failed to initialize Kafka consumer:', error.stack);
    }
  }

  private registerEventStatusMethods(): void {
    this.eventsProcessGateways.set(
      TaskStatusEnums.CONFIRMED,
      this.taskConfirmed.bind(this),
    );
    this.eventsProcessGateways.set(
      TaskStatusEnums.CANCELED_FROM_PROVIDER,
      this.taskCancelled.bind(this),
    );
  }

  async eventProcess(event: TaskStatusDto): Promise<void> {
    try {
      const processor = this.eventsProcessGateways.get(event.status);
      if (processor) {
        await processor(event);
      }
      await this.updateTaskDetails(event);
    } catch (e) {
      this.logger.error(`Error processing event: ${event.status}`, e.stack);
    }
  }

  private async consumeTaskEvent() {
    await this.consumerService.consume({
      topics: {
        topics: [
          process.env.UBER_DELIVERY_EVENTS_TOPIC,
          process.env.DOORDASH_DELIVERY_EVENTS_TOPIC,
          process.env.ROUTEMASTERS_DELIVERY_EVENTS_TOPIC,
          process.env.SPEEDSTER_DELIVERY_EVENTS_TOPIC,
        ],
      },
      config: {
        groupId: process.env.DISPATCH_MONITORING_DELIVERY_EVENTS_GROUP_ID,
      },

      onMessage: async (message) => {
        const data: TaskStatusDto = JSON.parse(message.value.toString());
        try {
          await this.eventProcess(data);
        } catch (error) {
          this.logger.error('Error processing Kafka message:', error.stack);
        }
      },
    });
  }

  private async taskConfirmed(event: TaskStatusDto): Promise<void> {
    await this.dispatchService.taskConfirmed(
      event.deliveryId,
      event.providerService,
    );
  }

  private async taskCancelled(event: TaskStatusDto): Promise<void> {
    await this.dispatchService.taskCancelledFromProvider(event.deliveryId);
  }

  private async updateTaskDetails(event: TaskStatusDto): Promise<void> {
    if (!event.deliveryId) {
      return;
    }

    const task = await this.taskRepository.findOne(
      {
        taskId: event.deliveryId,
      },
      false,
      { taskDetails: 1 },
    );

    if (task) {
      await this.dispatchService.updateTaskDetails(task, event);
    }
  }
}
