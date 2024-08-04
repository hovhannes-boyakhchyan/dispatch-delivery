import { DeliveryProvidersEnum } from '../../../common/enums';
import { DeliveryPeriodDto } from './delivery-period.dto';

export class ProviderQuotesDto {
  quotes: [
    {
      fee: number;
      quoteId: string;
      deliveryTime?: string;
      deliveryPeriod?: DeliveryPeriodDto;
      jobId?: string;
      taskId?: string;
      jobConfigurationId?: string;
    },
  ];
  providerService: DeliveryProvidersEnum;
}
