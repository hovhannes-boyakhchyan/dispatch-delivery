import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from './abstract.repository';
import { Task, TaskDocument } from '../schemas';

@Injectable()
export class TaskRepository extends AbstractRepository<TaskDocument> {
  logger = new Logger(TaskRepository.name);

  constructor(
    @InjectModel(Task.name)
    taskModel: Model<TaskDocument>,
  ) {
    super(taskModel);
  }
}
