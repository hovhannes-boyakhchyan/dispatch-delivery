import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import {
  Task,
  TaskSchema,
  Quote,
  QuoteSchema,
  Job,
  JobSchema,
} from '../../database/schemas';
import {
  TaskRepository,
  QuoteRepository,
  JobRepository,
} from '../../database/repositories';
import { DeliveryProvidersGatewayModule } from '../../common/services';
import { HelpersJobService } from './helpers.job.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quote.name, schema: QuoteSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Job.name, schema: JobSchema },
    ]),
    HttpModule,
    DeliveryProvidersGatewayModule,
  ],
  controllers: [JobController],
  providers: [
    JobService,
    HelpersJobService,
    TaskRepository,
    JobRepository,
    QuoteRepository,
  ],
  exports: [JobService, TaskRepository, JobRepository],
})
export class JobModule {}
