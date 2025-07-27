import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from './abstract.repository';
import { Quote, QuoteDocument } from '../schemas';

@Injectable()
export class QuoteRepository extends AbstractRepository<QuoteDocument> {
  logger = new Logger(QuoteRepository.name);

  constructor(
    @InjectModel(Quote.name)
    quoteModel: Model<QuoteDocument>,
  ) {
    super(quoteModel);
  }
}
