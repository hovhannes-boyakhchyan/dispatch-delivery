import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { WebhookEventsModule } from './modules/webhook-events/webhook-events.module';
import { QuoteModule } from './modules/quote/quote.module';
import { JobModule } from './modules/job/job.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        process.env.NODE_ENV && process.env.NODE_ENV !== 'development'
          ? `.env.${process.env.NODE_ENV}`
          : `.env`,
      ],
      isGlobal: true,
    }),
    DatabaseModule,
    HealthModule,
    WebhookEventsModule,
    QuoteModule,
    JobModule,
    DispatchModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
