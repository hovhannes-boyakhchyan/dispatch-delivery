import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { UNABLE_TO_DELIVERY } from '../../../constants';
import { AbstractDeliveryService } from './abstract-delivery.service';
import {
  CreateQuoteDto,
  ProviderQuotesDto,
} from '../../../../modules/quote/dto';
import {
  CreateTaskDto,
  ProviderCreateDeliveryResponseDto,
  ProviderDeliveryDetailsDto,
} from '../../../../modules/job/dto';

@Injectable()
export class UberDeliveryApiService implements AbstractDeliveryService {
  private logger: Logger = new Logger(UberDeliveryApiService.name);
  constructor(private readonly httpService: HttpService) {}

  async getQuote(data: CreateQuoteDto): Promise<ProviderQuotesDto> {
    return firstValueFrom(
      this.httpService
        .post(`${process.env.UBER_DDELIVERY_SERVICE}/quote/create`, data)
        .pipe(
          map((response) => {
            return response.data;
          }),
        )
        .pipe(
          catchError((e) => {
            e = e.response?.data?.message || e;
            this.logger.error(JSON.stringify(e));
            throw new BadRequestException(UNABLE_TO_DELIVERY);
          }),
        ),
    );
  }

  async createDelivery(
    data: CreateTaskDto,
  ): Promise<ProviderCreateDeliveryResponseDto> {
    return firstValueFrom(
      this.httpService
        .post(`${process.env.UBER_DDELIVERY_SERVICE}/delivery/create`, data)
        .pipe(
          map((response) => {
            return response.data;
          }),
        )
        .pipe(
          catchError((e) => {
            e = e?.response?.data?.message || e;
            this.logger.error(JSON.stringify(e));
            throw new BadRequestException(e);
          }),
        ),
    );
  }

  async cancelDelivery(deliveryId: string): Promise<void> {
    return firstValueFrom(
      this.httpService
        .post(
          `${process.env.UBER_DDELIVERY_SERVICE}/delivery/cancel/${deliveryId}`,
        )
        .pipe(
          map((response) => {
            return response.data;
          }),
          catchError((e) => {
            e = e?.response?.data?.message || e;
            this.logger.error(JSON.stringify(e));
            throw new BadRequestException(e);
          }),
        ),
    );
  }

  async getDeliveryDetails(
    deliveryId: string,
  ): Promise<ProviderDeliveryDetailsDto> {
    return firstValueFrom(
      this.httpService
        .get(`${process.env.UBER_DDELIVERY_SERVICE}/delivery/${deliveryId}`)
        .pipe(
          map((response) => {
            return response.data;
          }),
          catchError((e) => {
            e = e?.response?.data?.message || e;
            this.logger.error(JSON.stringify(e));
            return of(null);
          }),
        ),
    );
  }
}
