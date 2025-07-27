import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from './abstract.repository';
import { BusinessSettings, BusinessSettingsDocument } from '../schemas';

@Injectable()
export class BusinessSettingsRepository extends AbstractRepository<BusinessSettingsDocument> {
  logger = new Logger(BusinessSettingsRepository.name);

  constructor(
    @InjectModel(BusinessSettings.name)
    businessSettingsModel: Model<BusinessSettingsDocument>,
  ) {
    super(businessSettingsModel);
  }
}
