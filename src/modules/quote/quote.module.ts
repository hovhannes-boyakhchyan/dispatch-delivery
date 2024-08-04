import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { QuoteController } from './quote.controller';
import { QuoteService } from './quote.service';
import { SortQuoteByConditionService } from './sort-quote-by-condition.service';
import {
  Quote,
  QuoteSchema,
  DeliveryStrategy,
  DeliveryStrategySchema,
  BusinessSettings,
  BusinessSettingsSchema,
  DispatchConfigs,
  DispatchConfigsSchema,
} from '../../database/schemas';
import { DeliveryProvidersGatewayModule } from '../../common/services';
import {
  BusinessSettingsRepository,
  DeliveryStrategyRepository,
  DispatchConfigsRepository,
  QuoteRepository,
} from '../../database/repositories';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliveryStrategy.name, schema: DeliveryStrategySchema },
      { name: BusinessSettings.name, schema: BusinessSettingsSchema },
      { name: DispatchConfigs.name, schema: DispatchConfigsSchema },
      { name: Quote.name, schema: QuoteSchema },
    ]),
    HttpModule,
    DeliveryProvidersGatewayModule,
  ],
  controllers: [QuoteController],
  providers: [
    QuoteService,
    SortQuoteByConditionService,
    DeliveryStrategyRepository,
    BusinessSettingsRepository,
    DispatchConfigsRepository,
    QuoteRepository,
  ],
  exports: [QuoteService, QuoteRepository],
})
export class QuoteModule {}
