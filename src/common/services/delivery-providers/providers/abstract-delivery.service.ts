import {
  CreateQuoteDto,
  ProviderQuotesDto,
} from '../../../../modules/quote/dto';
import {
  CancelJobDto,
  CreateTaskDto,
  ProviderCreateDeliveryResponseDto,
  ProviderDeliveryDetailsDto,
} from '../../../../modules/job/dto';

export abstract class AbstractDeliveryService {
  abstract getQuote(data: CreateQuoteDto): Promise<ProviderQuotesDto>;

  abstract createDelivery(
    data: CreateTaskDto,
  ): Promise<ProviderCreateDeliveryResponseDto>;

  abstract cancelDelivery(
    deliveryId: string,
    data?: CancelJobDto,
  ): Promise<void>;

  abstract getDeliveryDetails(
    deliveryId: string,
  ): Promise<ProviderDeliveryDetailsDto>;
}
