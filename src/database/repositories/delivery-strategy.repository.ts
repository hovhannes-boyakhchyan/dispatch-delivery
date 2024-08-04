import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from './abstract.repository';
import { DeliveryStrategy, DeliveryStrategyDocument } from '../schemas';

@Injectable()
export class DeliveryStrategyRepository extends AbstractRepository<DeliveryStrategyDocument> {
  logger = new Logger(DeliveryStrategyRepository.name);

  constructor(
    @InjectModel(DeliveryStrategy.name)
    deliveryStrategyModel: Model<DeliveryStrategyDocument>,
  ) {
    super(deliveryStrategyModel);
  }
}
