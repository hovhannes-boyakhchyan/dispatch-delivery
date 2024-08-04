import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from './abstract.repository';
import { DispatchConfigs, DispatchConfigsDocument } from '../schemas';

@Injectable()
export class DispatchConfigsRepository extends AbstractRepository<DispatchConfigsDocument> {
  logger = new Logger(DispatchConfigsRepository.name);

  constructor(
    @InjectModel(DispatchConfigs.name)
    dispatchConfigsModel: Model<DispatchConfigsDocument>,
  ) {
    super(dispatchConfigsModel);
  }
}
