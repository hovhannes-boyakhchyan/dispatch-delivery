import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  CreateJobDto,
  CancelJobDto,
  QuoteDataForCreateDeliveryDto,
  CreateTaskDto,
} from './dto';
import { DeliveryProvidersGatewayService } from '../../common/services';
import {
  JobRepository,
  QuoteRepository,
  TaskRepository,
} from '../../database/repositories';
import { HelpersJobService } from './helpers.job.service';
import { Job, Task } from '../../database/schemas';
import {
  DeliveryProvidersNameEnum,
  QuoteStatusEnums,
  TaskStatusEnums,
} from '../../common/enums';

@Injectable()
export class JobService {
  private logger: Logger = new Logger(JobService.name);

  constructor(
    private readonly deliveryProvidersGatewayService: DeliveryProvidersGatewayService,
    private readonly helpersJobService: HelpersJobService,
    private readonly quoteRepository: QuoteRepository,
    private readonly taskRepository: TaskRepository,
    private readonly jobRepository: JobRepository,
  ) {}

  async create(
    createJobDto: CreateJobDto,
    quoteData?: QuoteDataForCreateDeliveryDto,
  ): Promise<Job> {
    try {
      if (!quoteData) {
        quoteData = await this.quoteRepository.findOne({
          _id: createJobDto.quoteExternalReference,
        });
      }

      const task = await this.createTaskByQuote({ ...createJobDto }, quoteData);

      const job = await this.jobRepository.create({
        currentTask: task._id,
        taskList: [task._id],
      });

      this.quoteRepository.updateOne(
        { _id: quoteData._id },
        { $set: { status: QuoteStatusEnums.SELECTED, ...quoteData } },
      );

      return job;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async createTaskByQuote(
    createTaskDto: CreateTaskDto,
    quoteData: QuoteDataForCreateDeliveryDto,
    status = TaskStatusEnums.CREATED,
  ): Promise<Task> {
    try {
      const mappedDeliveryData = this.helpersJobService.mapCreateDeliveryData(
        createTaskDto,
        quoteData,
      );

      const delivery =
        await this.deliveryProvidersGatewayService.createDelivery(
          quoteData.providerService,
          mappedDeliveryData,
        );
      this.logger.debug(`Task created: ${JSON.stringify(delivery)}`);

      try {
        return await this.taskRepository.create({
          status,
          taskId: delivery.deliveryId,
          providerService: quoteData.providerService,
          providerServiceName:
            DeliveryProvidersNameEnum[quoteData.providerService],
          quoteId: quoteData.quoteId,
          internalQuoteId: quoteData._id,
          createdTaskData: createTaskDto,
        });
      } catch (e) {
        await this.deliveryProvidersGatewayService.cancelDelivery(
          quoteData.providerService,
          delivery.deliveryId,
          {
            orderNumber: createTaskDto.deliveryExternalNumber,
            tenantKey: createTaskDto.tenantKey,
          },
        );
        this.logger.error(
          `Can not create delivery with quoteInternalId: ${quoteData._id}, providerService: ${quoteData.providerService}`,
          '',
          JSON.stringify(e),
        );
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async cancel(jobId: string, cancelJobDto: CancelJobDto): Promise<Task> {
    try {
      const job = await this.taskRepository.findOne({
        _id: jobId,
      });

      return this.cancelProcess(job, cancelJobDto);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async cancelProcess(
    task: Task,
    cancelDeliveryDto: CancelJobDto,
  ): Promise<Task> {
    try {
      const cancelDelivery =
        await this.deliveryProvidersGatewayService.cancelDelivery(
          task.providerService,
          task.taskId,
          cancelDeliveryDto,
        );
      this.logger.debug(`Canceled task: ${JSON.stringify(cancelDelivery)}`);

      return await this.taskRepository.findOneAndUpdate(
        { _id: task._id },
        {
          status: TaskStatusEnums.CANCELED,
        },
      );
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
