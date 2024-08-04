import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as BPromise from 'bluebird';
import * as moment from 'moment';
import { FilterQuery } from 'mongoose';
import { CreateQuoteDto, ProviderQuotesDto } from './dto';
import { DeliveryProvidersGatewayService } from '../../common/services';
import { SortQuoteByConditionService } from './sort-quote-by-condition.service';
import {
  BusinessSettingsRepository,
  DeliveryStrategyRepository,
  DispatchConfigsRepository,
  QuoteRepository,
} from '../../database/repositories';
import { DeliveryProvidersEnum, TimeUnitsEnum } from '../../common/enums';
import {
  DeliveryStrategy,
  DeliveryStrategyDocument,
  Quote,
} from '../../database/schemas';
import { ProvidersConfigType } from '../../common/types';
import { CAN_NOT_CREATE_QUOTE } from '../../common/constants';

@Injectable()
export class QuoteService {
  private readonly logger: Logger = new Logger(QuoteService.name);

  constructor(
    private readonly deliveryApiService: DeliveryProvidersGatewayService,
    private readonly sortQuoteByConditionService: SortQuoteByConditionService,
    private readonly deliveryStrategyRepository: DeliveryStrategyRepository,
    private readonly businessSettingsRepository: BusinessSettingsRepository,
    private readonly dispatchConfigsRepository: DispatchConfigsRepository,
    private readonly quoteRepository: QuoteRepository,
  ) {}

  async create(createQuoteDto: CreateQuoteDto): Promise<Quote> {
    try {
      const dispatchConfigs = await this.dispatchConfigsRepository.findOne({});
      const quote = await this.createQuoteByStrategy(createQuoteDto);

      if (
        dispatchConfigs.flatFee.enabled &&
        quote.fee < dispatchConfigs.flatFee.amountCents
      ) {
        quote.fee = dispatchConfigs.flatFee.amountCents;
      }

      return quote;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  private async createQuoteByStrategy(createQuoteData: CreateQuoteDto) {
    const businessConfigs = await this.businessSettingsRepository.findOne(
      {
        businessId: createQuoteData.externalStoreId,
      },
      false,
    );

    const findDeliveryStrategyFilterQuery: FilterQuery<DeliveryStrategyDocument> =
      {};
    if (businessConfigs?.deliveryStrategyId) {
      findDeliveryStrategyFilterQuery._id = businessConfigs.deliveryStrategyId;
    } else {
      findDeliveryStrategyFilterQuery.isDefault = true;
    }

    const strategy = await this.deliveryStrategyRepository.findOne(
      findDeliveryStrategyFilterQuery,
    );

    const providersQuotes = await this.getProvidersQuotes(
      strategy.deliveryProvidersList,
      createQuoteData,
      businessConfigs?.providersConfig,
    );
    this.logger.debug(`providersQuotes: ${JSON.stringify(providersQuotes)}`);

    this.sortQuotesByPriority(strategy, providersQuotes);
    const selectedQuote = this.selectQuote(providersQuotes);

    return this.saveSelectQuote(
      selectedQuote,
      providersQuotes,
      createQuoteData,
    );
  }

  private sortQuotesByPriority(
    strategy: DeliveryStrategy,
    providersQuotes: ProviderQuotesDto[],
  ): ProviderQuotesDto[] {
    const { priority } = strategy;

    for (const condition of priority) {
      this.sortQuoteByConditionService[condition](providersQuotes, strategy);
    }

    return providersQuotes;
  }

  private selectQuote(providersQuotes: ProviderQuotesDto[]): Partial<Quote> {
    const selectedProviderQuotes = providersQuotes[0];
    const quote = selectedProviderQuotes?.quotes?.[0];
    if (!quote) {
      throw new BadRequestException(CAN_NOT_CREATE_QUOTE);
    }

    return {
      quoteId: quote.quoteId,
      fee: quote.fee,
      jobId: quote.jobId,
      taskId: quote.taskId,
      jobConfigurationId: quote.jobConfigurationId,
      providerService: selectedProviderQuotes.providerService,
      deliveryTime: quote.deliveryTime,
    };
  }

  private async saveSelectQuote(
    selectedQuote: Partial<Quote>,
    providersQuotes: ProviderQuotesDto[],
    createQuoteData: CreateQuoteDto,
  ): Promise<Quote> {
    const calcDeliveryPeriod = {
      amount: selectedQuote.deliveryTime
        ? moment(selectedQuote.deliveryTime).diff(
            moment(),
            TimeUnitsEnum.minutes,
          )
        : null,
      unit: TimeUnitsEnum.minutes,
    };

    const quote = await this.quoteRepository.create({
      ...selectedQuote,
      deliveryPeriod: calcDeliveryPeriod,
      list: providersQuotes,
      createQuoteData,
    });
    this.logger.debug(`Selected quote: ${JSON.stringify(quote)}`);

    return quote;
  }

  private async getProvidersQuotes(
    deliveryProviders: DeliveryProvidersEnum[],
    createQuoteData: CreateQuoteDto,
    providersConfig: ProvidersConfigType,
  ): Promise<ProviderQuotesDto[]> {
    const resultCreateQuote = await BPromise.map(
      deliveryProviders,
      async (provider) => {
        try {
          const quote = await this.deliveryApiService.getQuote(provider, {
            ...createQuoteData,
            ...providersConfig?.[provider],
          });
          return {
            ...quote,
            providerService: provider,
          };
        } catch (e) {
          return null;
        }
      },
    );

    return resultCreateQuote.filter((quote) => !!quote);
  }
}
