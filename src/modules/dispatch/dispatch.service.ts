import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CancelJobDto, CreateJobDto, CreateTaskDto } from '../job/dto';
import { CreateQuoteDto, ProviderQuotesDto } from '../quote/dto';
import { QuoteService } from '../quote/quote.service';
import { JobService } from '../job/job.service';
import {
  TaskRepository,
  QuoteRepository,
  JobRepository,
} from '../../database/repositories';
import { Task, Quote, Job } from '../../database/schemas';
import { DeliveryProvidersEnum, TaskStatusEnums } from '../../common/enums';
import { DRIVER_NOT_CONFIRM_DELIVERY } from '../../common/constants';
import { DeliveryProvidersGatewayService } from '../../common/services';

@Injectable()
export class DispatchService {
  private logger: Logger = new Logger(DispatchService.name);
  constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly taskRepository: TaskRepository,
    private readonly jobRepository: JobRepository,
    private readonly quoteService: QuoteService,
    private readonly jobService: JobService,
    private readonly deliveryProvidersGatewayService: DeliveryProvidersGatewayService,
  ) {}

  async createQuote(createQuoteDto: CreateQuoteDto): Promise<Quote> {
    return this.quoteService.create(createQuoteDto);
  }

  async createJob(createJobDto: CreateJobDto): Promise<Job> {
    try {
      const quote: Quote = await this.getOrCreateNewQuote(createJobDto);

      return this.createJobByQuoteList(quote, createJobDto);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  private async createJobByQuoteList(
    quote: Quote,
    createJobData: CreateJobDto,
  ): Promise<Job> {
    for (const quoteList of quote.list) {
      for (const providerQuote of quoteList.quotes) {
        try {
          return await this.jobService.create(createJobData, {
            _id: quote._id,
            quoteId: providerQuote.quoteId,
            taskId: providerQuote.taskId,
            jobId: providerQuote.jobId,
            jobConfigurationId: providerQuote.jobConfigurationId,
            providerService: quoteList.providerService,
          });
        } catch (e) {
          this.logger.error(
            `Can not create job with quoteInternalId: ${quote._id}, providerService: ${quoteList.providerService}`,
            '',
            JSON.stringify(e),
          );
        }
      }
    }
  }

  async createTasksByQuoteList(
    jobId: string,
    quote: Quote,
    createTaskData: CreateTaskDto,
  ): Promise<Task[]> {
    const createdTaskList: Task[] = [];
    for (const quoteList of quote.list) {
      const task = await this.createTaskByProviderQuotes(
        quote._id.toString(),
        quoteList,
        createTaskData,
      );

      await this.jobRepository.updateOne(
        { _id: jobId },
        { $push: { taskList: task._id } },
      );

      createdTaskList.push(task);
    }

    return createdTaskList;
  }

  private async createTaskByProviderQuotes(
    quoteId: string,
    providerQuotes: ProviderQuotesDto,
    createDeliveryData: CreateTaskDto,
  ): Promise<Task> {
    for (const providerQuote of providerQuotes.quotes) {
      try {
        return await this.jobService.createTaskByQuote(
          createDeliveryData,
          {
            _id: quoteId,
            quoteId: providerQuote.quoteId,
            taskId: providerQuote.taskId,
            jobId: providerQuote.jobId,
            jobConfigurationId: providerQuote.jobConfigurationId,
            providerService: providerQuotes.providerService,
          },
          TaskStatusEnums.PENDING,
        );
      } catch (e) {
        this.logger.error(
          `Can not create task with quoteInternalId: ${quoteId}, providerService: ${providerQuotes.providerService}`,
          '',
          JSON.stringify(e),
        );
      }
    }
  }

  async cancelJob(jobId: string, cancelJobDto: CancelJobDto) {
    const job = await this.jobRepository.findOne({
      _id: jobId,
    });

    const tasks = await this.taskRepository.find({
      _id: { $in: job.taskList },
      status: {
        $ne: TaskStatusEnums.CANCELED,
      },
    });

    await this.cancelTasks(tasks, cancelJobDto);

    return job;
  }

  private async getOrCreateNewQuote(
    createDeliveryData: CreateJobDto,
  ): Promise<Quote> {
    if (!createDeliveryData.quoteExternalReference) {
      const mappedQuoteData =
        this.mapQuoteDataFromDeliveryData(createDeliveryData);

      return this.quoteService.create(mappedQuoteData);
    }

    return this.quoteRepository.findOne({
      _id: createDeliveryData.quoteExternalReference,
    });
  }

  private mapQuoteDataFromDeliveryData(
    createDeliveryData: CreateJobDto,
  ): CreateQuoteDto {
    return {
      pickupAddress: createDeliveryData.pickupAddress,
      dropoffAddress: createDeliveryData.dropoffAddress,
      dropoffPhoneNumber: createDeliveryData.dropoffPhoneNumber,
      dropoffName: createDeliveryData.dropoffName,
      dropoffFirstName: createDeliveryData.dropoffFirstName,
      dropoffLastName: createDeliveryData.dropoffLastName,
      dropoffEmail: createDeliveryData.dropoffEmail,
      dropoffInstructions: createDeliveryData.dropoffInstructions,
      pickupInstructions: createDeliveryData.pickupInstructions,
      pickupPhoneNumber: createDeliveryData.pickupPhoneNumber,
      pickupStartTime: createDeliveryData.pickupStartTime,
      dropoffEndTime: createDeliveryData.dropoffEndTime,
      orderValue: createDeliveryData.orderValue,
      itemsCount: createDeliveryData.itemsCount,
      tax: createDeliveryData.tax,
      tip: createDeliveryData.tip,
      externalStoreId: createDeliveryData.externalStoreId,
      pickupBusinessName: createDeliveryData.pickupBusinessName,
      teamId: createDeliveryData.teamId,
      tenantKey: createDeliveryData.tenantKey,
      nashGroupId: createDeliveryData.nashGroupId,
      metadata: createDeliveryData.metadata,
    };
  }

  async taskConfirmed(taskId: string, providerService: DeliveryProvidersEnum) {
    const task = await this.taskRepository.findOne(
      {
        taskId,
        providerService,
        status: {
          $in: [TaskStatusEnums.CREATED, TaskStatusEnums.PENDING],
        },
      },
      false,
    );

    if (!task) {
      return;
    }

    this.logger.log(`Driver confirmed task: ${JSON.stringify(task)}`);

    await this.taskRepository.updateOne(
      { _id: task._id },
      { status: TaskStatusEnums.CONFIRMED },
    );
    await this.jobRepository.updateOne(
      { taskList: task._id },
      { $set: { currentTask: task._id } },
    );
    await this.quoteRepository.updateOne(
      { _id: task.internalQuoteId },
      { $set: { quoteId: task.quoteId, providerService } },
    );

    const pendingTasks = await this.taskRepository.find({
      internalQuoteId: task.internalQuoteId,
      status: TaskStatusEnums.PENDING,
    });

    await this.cancelTasks(pendingTasks);
  }

  async cancelTasks(tasks: Task[], cancelJobDto?: CancelJobDto): Promise<void> {
    for (const task of tasks) {
      try {
        await this.jobService.cancelProcess(task, {
          orderNumber: task.createdTaskData.deliveryExternalNumber,
          tenantKey: task.createdTaskData.tenantKey,
          cancellationReason: DRIVER_NOT_CONFIRM_DELIVERY,
          businessId: task.createdTaskData.externalStoreId,
          ...cancelJobDto,
        });
      } catch (e) {
        e = e.response?.data || e;
        this.logger.error(
          `Failed to cancel task, providerService is ${task.providerService}, taskId: ${task.taskId}`,
          '',
          JSON.stringify(e),
        );
      }
    }
  }

  async getJobDetails(jobId: string): Promise<Task> {
    try {
      const job = await this.jobRepository.findOne({ _id: jobId }, true, {
        currentTask: 1,
      });
      const task = await this.taskRepository.findOne(
        { _id: job.currentTask },
        true,
        {
          taskId: 1,
          providerService: 1,
        },
      );

      const details =
        await this.deliveryProvidersGatewayService.getDeliveryDetails(
          task.providerService,
          task.taskId,
        );
      if (details) {
        task.taskDetails = details;
      }
      return await this.taskRepository.findOneAndUpdate(
        { _id: task._id },
        { $set: task },
        {
          new: true,
          lean: true,
          projection: {
            taskId: 0,
            quoteId: 0,
            internalQuoteId: 0,
            createdTaskData: 0,
          },
        },
      );
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
