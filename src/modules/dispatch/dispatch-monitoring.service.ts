import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
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
import { JOB_NOT_FOUND } from '../../common/constants';

@Injectable()
export class DispatchMonitoringService implements OnModuleInit {
  private readonly logger = new Logger(DispatchMonitoringService.name);
  private waitingMinutesDriverConfirmation: number = 1; // 1 minutes default

  constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly taskRepository: TaskRepository,
    private readonly jobRepository: JobRepository,
    private readonly dispatchService: DispatchService,
    private readonly dispatchConfigsRepository: DispatchConfigsRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.loadDriverConfirmationWaitingTime();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async checkDeliveryDriverConfirmation(): Promise<void> {
    try {
      const filterQuery = {
        status: TaskStatusEnums.CREATED,
        createdAt: {
          $lte: moment()
            .subtract(
              this.waitingMinutesDriverConfirmation,
              TimeUnitsEnum.minutes,
            )
            .toDate(),
        },
      };

      const unconfirmedTasks = await this.taskRepository.find(filterQuery);

      for (const unconfirmedTask of unconfirmedTasks) {
        await this.processUnconfirmedTask(unconfirmedTask);
      }
    } catch (error) {
      this.logger.error(
        'Error checking delivery driver confirmation:',
        error.stack,
      );
    }
  }

  private async processUnconfirmedTask(unconfirmedTask: Task): Promise<void> {
    try {
      await this.taskRepository.updateOne(
        { _id: unconfirmedTask._id },
        { $set: { status: TaskStatusEnums.PENDING } },
      );

      const quote = await this.quoteRepository.findOne({
        _id: unconfirmedTask.internalQuoteId,
      });

      if (!quote) {
        throw new NotFoundException(
          `Quote with ID ${unconfirmedTask.internalQuoteId} not found.`,
        );
      }

      const job = await this.jobRepository.findOne({
        currentTask: unconfirmedTask._id,
      });

      if (!job) {
        throw new NotFoundException(JOB_NOT_FOUND);
      }

      const currentProviderQuoteIndex = quote.list.findIndex(
        (providerQuote) =>
          providerQuote.providerService === unconfirmedTask.providerService,
      );

      const remainingNextQuotes = quote.list.slice(
        currentProviderQuoteIndex + 1,
      );

      await this.dispatchService.createTasksByQuoteList(
        job._id.toString(),
        { ...quote, list: remainingNextQuotes },
        unconfirmedTask.createdTaskData,
      );
    } catch (error) {
      this.logger.error(
        `Error processing unconfirmed task with ID ${unconfirmedTask._id}:`,
        error.stack,
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async loadDriverConfirmationWaitingTime(): Promise<void> {
    try {
      const config = await this.dispatchConfigsRepository.findOne({});

      if (
        config?.waitingMinutesDriverConfirmation !==
        this.waitingMinutesDriverConfirmation
      ) {
        this.logger.debug(
          `Driver confirmation check interval updated to ${config?.waitingMinutesDriverConfirmation} minutes.`,
        );
        this.waitingMinutesDriverConfirmation =
          config.waitingMinutesDriverConfirmation;
      }
    } catch (error) {
      this.logger.error(
        'Failed to load driver confirmation waiting time:',
        error.stack,
      );
    }
  }
}
