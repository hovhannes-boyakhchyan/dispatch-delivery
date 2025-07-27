import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CancelJobDto, CreateJobDto, JobResponseDto } from './dto';
import { CAN_NOT_CREATE_DELIVERY } from '../../common/constants';
import { TaskStatusEnums } from '../../common/enums';

@Controller('job')
export class JobController {
  private logger: Logger;
  constructor(private readonly jobService: JobService) {
    this.logger = new Logger();
  }

  @Post('/create')
  async createJob(@Body() createJobDto: CreateJobDto): Promise<JobResponseDto> {
    this.logger.log(`Create Job Data ==>> ${JSON.stringify(createJobDto)}`);

    const job = await this.jobService.create(createJobDto);
    if (!job._id) {
      throw new BadRequestException(CAN_NOT_CREATE_DELIVERY);
    }

    this.logger.log(`Create Job Response ==>> ${JSON.stringify(job)}`);

    return {
      deliveryId: job._id.toString(),
      status: TaskStatusEnums.CREATED,
    };
  }

  @Post('/cancel/:id')
  async cancelJob(
    @Param('id') jobId: string,
    @Body() cancelJobDto: CancelJobDto,
  ): Promise<JobResponseDto> {
    const job = await this.jobService.cancel(jobId, cancelJobDto);

    return {
      deliveryId: job._id.toString(),
      status: job.status,
    };
  }
}
