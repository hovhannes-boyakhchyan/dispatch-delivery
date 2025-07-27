import { DeliveryPeriodDto } from './delivery-period.dto';

export class QuoteDto {
  quoteId: string;
  fee: number;
  deliveryTime?: string;
  deliveryPeriod?: DeliveryPeriodDto;
}
