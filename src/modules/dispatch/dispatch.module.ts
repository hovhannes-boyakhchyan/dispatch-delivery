import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { QuoteModule } from '../quote/quote.module';
import { JobModule } from '../job/job.module';
import { DispatchMonitoringService } from './dispatch-monitoring.service';
import { KafkaModule } from '../../common/services/kafka/kafka.module';
import { DispatchConfigsRepository } from '../../database/repositories';
import { MongooseModule } from '@nestjs/mongoose';
import { DispatchConfigs, DispatchConfigsSchema } from '../../database/schemas';
import { DeliveryProvidersGatewayModule } from '../../common/services';
import { DispatchEventsProcessorService } from './dispatch-events-porocessor.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DispatchConfigs.name, schema: DispatchConfigsSchema },
    ]),
    DeliveryProvidersGatewayModule,
    QuoteModule,
    JobModule,
    ScheduleModule.forRoot(),
    KafkaModule,
  ],
  controllers: [DispatchController],
  providers: [
    DispatchService,
    DispatchMonitoringService,
    DispatchConfigsRepository,
    DispatchEventsProcessorService,
  ],
})
export class DispatchModule {}
