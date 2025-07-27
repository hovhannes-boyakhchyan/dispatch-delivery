import { QuoteDto } from './quote.dto';

export class CreateQuoteResponseDto {
  data: {
    quotes: [QuoteDto];
  };
}
