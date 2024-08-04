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
  ],
})
export class DispatchModule {}
