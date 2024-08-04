import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { ProviderQuotesDto } from './dto';
import { DeliveryStrategy } from '../../database/schemas';

@Injectable()
export class SortQuoteByConditionService {
  providers(
    quotes: ProviderQuotesDto[],
    { preferredDeliveryProviders }: DeliveryStrategy,
  ): ProviderQuotesDto[] {
    for (const preferredProvider of preferredDeliveryProviders?.reverse()) {
      quotes.sort((a) => {
        return a.providerService === preferredProvider ? -1 : 1;
      });
    }
    return quotes;
  }

  shortTime(
    quotes: ProviderQuotesDto[],
    { shortTime }: DeliveryStrategy,
  ): ProviderQuotesDto[] {
    if (shortTime) {
      for (const providerQuotes of quotes) {
        providerQuotes.quotes.sort((a, b) =>
          moment(a.deliveryTime).diff(b.deliveryTime),
        );
      }
      quotes.sort((a, b) =>
        moment(a.quotes[0].deliveryTime).diff(b.quotes[0].deliveryTime),
      );
    }

    return quotes;
  }

  lowPrice(
    quotes: ProviderQuotesDto[],
    { lowPrice }: DeliveryStrategy,
  ): ProviderQuotesDto[] {
    if (lowPrice) {
      for (const providerQuotes of quotes) {
        providerQuotes.quotes.sort((a, b) => a.fee - b.fee);
      }
      quotes.sort((a, b) => a.quotes[0].fee - b.quotes[0].fee);
    }

    return quotes;
  }
}
