import { Headers, Body, Controller, Logger, Post } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDto, CreateQuoteResponseDto } from './dto';

@Controller('quote')
export class QuoteController {
  private logger: Logger = new Logger(QuoteController.name);
  constructor(private readonly quoteService: QuoteService) {}

  @Post('/create')
  async createQuote(
    @Headers('business') businessId: string,
    @Body() createQuoteDto: CreateQuoteDto,
  ): Promise<CreateQuoteResponseDto> {
    this.logger.log(`Create Quote Data ==>> ${JSON.stringify(createQuoteDto)}`);

    const quote = await this.quoteService.create(createQuoteDto);

    return {
      data: {
        quotes: [
          {
            quoteId: quote._id.toString(),
            fee: quote.fee,
            deliveryTime: quote.deliveryTime,
            deliveryPeriod: quote.deliveryPeriod,
          },
        ],
      },
    };
  }
}
