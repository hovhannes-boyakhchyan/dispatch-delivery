import { ObjectId } from 'mongoose';
import { DeliveryProvidersEnum } from '../../../common/enums';

export class QuoteDataForCreateDeliveryDto {
  _id: string | ObjectId;
  quoteId: string;
  jobId?: string;
  taskId?: string;
  jobConfigurationId?: string;
  providerService: DeliveryProvidersEnum;
}
