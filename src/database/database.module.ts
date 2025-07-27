import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseService } from './database.service';
import { QuoteRepository } from './repositories';
import { Quote, QuoteSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_CONNECTION_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Quote.name, schema: QuoteSchema }]),
    ScheduleModule.forRoot(),
  ],
  providers: [DatabaseService, QuoteRepository],
  exports: [DatabaseService],
})
export class DatabaseModule {}
