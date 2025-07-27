import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { CancelJobDto, CreateJobDto, JobResponseDto } from '../job/dto';
import { CreateQuoteDto, CreateQuoteResponseDto } from '../quote/dto';
import { CAN_NOT_CREATE_DELIVERY } from '../../common/constants';
import { TaskStatusEnums } from '../../common/enums';
import { ValidationMongoIdPipe } from '../../common/pipes';

@Controller('dispatch')
export class DispatchController {
  private logger: Logger = new Logger(DispatchController.name);
  constructor(private readonly dispatchService: DispatchService) {}

  @Post('/quote/create')
  async createQuote(
    @Headers('business') businessId: string,
    @Body() createQuoteDto: CreateQuoteDto,
  ): Promise<CreateQuoteResponseDto> {
    this.logger.log(`Create Quote Data ==>> ${JSON.stringify(createQuoteDto)}`);

    const quote = await this.dispatchService.createQuote(createQuoteDto);

    return {
      data: {
        quotes: [
          {
            quoteId: quote._id.toString(),
            fee: quote.fee,
            deliveryTime: quote.deliveryTime,
            deliveryPeriod: quote.deliveryPeriod,
          },
        ],
      },
    };
  }

  @Post('/job/create')
  async createJob(@Body() createJobDto: CreateJobDto): Promise<JobResponseDto> {
    this.logger.log(`Create Job Data ==>> ${JSON.stringify(createJobDto)}`);

    const job = await this.dispatchService.createJob(createJobDto);
    if (!job?._id) {
      throw new BadRequestException(CAN_NOT_CREATE_DELIVERY);
    }

    this.logger.log(`Create Job Response ==>> ${JSON.stringify(job)}`);

    return {
      deliveryId: job._id.toString(),
      status: TaskStatusEnums.CREATED,
    };
  }

  @Post('/job/cancel/:id')
  async cancelJob(
    @Param('id') jobId: string,
    @Body() cancelDeliveryDto: CancelJobDto,
  ): Promise<JobResponseDto> {
    const job = await this.dispatchService.cancelJob(jobId, cancelDeliveryDto);

    return {
      deliveryId: job._id.toString(),
      status: TaskStatusEnums.CANCELED,
    };
  }

  @Get('/job-details/:id')
  async getJobDetails(@Param('id', ValidationMongoIdPipe) jobId: string) {
    return this.dispatchService.getJobDetails(jobId);
  }
}
