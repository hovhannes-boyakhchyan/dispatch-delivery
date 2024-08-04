import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import * as moment from 'moment';
import {
  TaskRepository,
  DispatchConfigsRepository,
  QuoteRepository,
  JobRepository,
} from '../../database/repositories';
import { TaskStatusEnums, TimeUnitsEnum } from '../../common/enums';
import { Task } from '../../database/schemas';
import { DispatchService } from './dispatch.service';
import { ConsumerService } from '../../common/services';
import { JOB_NOT_FOUND } from '../../common/constants';

@Injectable()
export class DispatchMonitoringService implements OnModuleInit {
  static driverConfirmationCheckTimeOutMilliseconds = 60000;
  private logger: Logger = new Logger(DispatchMonitoringService.name);

  constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly taskRepository: TaskRepository,
    private readonly jobRepository: JobRepository,
    private readonly dispatchService: DispatchService,
    private readonly consumerService: ConsumerService,
    private readonly dispatchConfigsRepository: DispatchConfigsRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.setDriverConfirmationWaitingTime();
    await this.consumerService.consume({
      topics: {
        topics: [
          process.env.UBER_DELIVERY_CONFIRM_TOPIC,
          process.env.DOORDASH_DELIVERY_CONFIRM_TOPIC,
          process.env.ROUTEMASTERS_DELIVERY_CONFIRM_TOPIC,
          process.env.SPEEDSTER_DELIVERY_CONFIRM_TOPIC,
        ],
      },
      config: { groupId: process.env.DISPATCH_MONITORING_GROUP_ID },
      onMessage: async (message) => {
        const data = JSON.parse(message.value.toString());
        try {
          await this.dispatchService.taskConfirmed(
            data.deliveryId,
            data.providerService,
          );
        } catch (e) {
          this.logger.error(`Kafka consuming error: ${e}`);
        }
      },
    });
  }

  @Interval(
    DispatchMonitoringService.driverConfirmationCheckTimeOutMilliseconds,
  )
  private async checkDeliveryDriverConfirmation(): Promise<void> {
    const filterQuery = {
      status: TaskStatusEnums.CREATED,
      createdAt: { $lte: moment().subtract(1, TimeUnitsEnum.minutes).toDate() },
    };

    const unconfirmedTasks = await this.taskRepository.find(filterQuery);

    for (const unconfirmedTask of unconfirmedTasks) {
      await this.createNextTasks(unconfirmedTask);
    }
  }

  private async createNextTasks(unconfirmedTask: Task): Promise<void> {
    await this.taskRepository.updateOne(
      { _id: unconfirmedTask._id },
      { $set: { status: TaskStatusEnums.PENDING } },
    );

    const quote = await this.quoteRepository.findOne({
      _id: unconfirmedTask.internalQuoteId,
    });

    const job = await this.jobRepository.findOne({
      currentTask: unconfirmedTask._id,
    });

    if (!job) {
      throw new NotFoundException(JOB_NOT_FOUND);
    }

    const currentProviderQuoteIndex = quote.list.findIndex(
      (providerQuot) =>
        providerQuot.providerService === unconfirmedTask.providerService,
    );

    const remainingNextQuotes = quote.list.slice(currentProviderQuoteIndex + 1);

    await this.dispatchService.createTasksByQuoteList(
      job._id.toString(),
      {
        ...quote,
        list: remainingNextQuotes,
      },
      unconfirmedTask.createdTaskData,
    );
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async setDriverConfirmationWaitingTime() {
    try {
      const { waitingMinutesDriverConfirmation } =
        await this.dispatchConfigsRepository.findOne({});

      if (waitingMinutesDriverConfirmation) {
        DispatchMonitoringService.driverConfirmationCheckTimeOutMilliseconds =
          waitingMinutesDriverConfirmation * 60000;
      }
    } catch (e) {
      this.logger.error(
        `Can not set driverConfirmationCheckTimeOutMilliseconds value.`,
      );
    }
  }
}
