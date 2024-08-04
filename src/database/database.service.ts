import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as moment from 'moment';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QuoteRepository } from './repositories';
import { QuoteStatusEnums } from '../common/enums';

@Injectable()
export class DatabaseService {
  private logger: Logger = new Logger(DatabaseService.name);
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly quoteRepository: QuoteRepository,
  ) {}

  getDbHandle(): Connection {
    return this.connection;
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async cleanupNotSelectedQuotes(): Promise<void> {
    const date = moment().utc().subtract(1, 'day').toDate();

    await this.quoteRepository.deleteMany({
      status: QuoteStatusEnums.CREATED,
      createdAt: { $lte: date },
    });
    this.logger.log(
      `Cleaned up not selected quotes after date: ${moment(date).format()}`,
    );
  }
}
