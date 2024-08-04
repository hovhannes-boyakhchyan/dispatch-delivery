import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from './abstract.repository';
import { Job, JobDocument } from '../schemas';

@Injectable()
export class JobRepository extends AbstractRepository<JobDocument> {
  logger = new Logger(JobRepository.name);

  constructor(
    @InjectModel(Job.name)
    jobModel: Model<JobDocument>,
  ) {
    super(jobModel);
  }
}
