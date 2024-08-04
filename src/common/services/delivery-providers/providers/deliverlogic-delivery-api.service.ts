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
  CancelJobDto,
  ProviderCreateDeliveryResponseDto,
  CreateTaskDto,
  ProviderDeliveryDetailsDto,
} from '../../../../modules/job/dto';

@Injectable()
export class DeliverlogicDeliveryApiService implements AbstractDeliveryService {
  private logger: Logger = new Logger(DeliverlogicDeliveryApiService.name);
  constructor(private readonly httpService: HttpService) {}

  async getQuote(data: CreateQuoteDto): Promise<ProviderQuotesDto> {
    return firstValueFrom(
      this.httpService
        .post(
          `http://${process.env.DELIVERLOGIC_DELIVERY_SERVICE_HOSTNAME}:${process.env.DELIVERLOGIC_DELIVERY_PORT}/quote/create`,
          data,
        )
        .pipe(
          map((response) => {
            return response.data?.data;
          }),
        )
        .pipe(
          catchError((e) => {
            e = e.response.data.message || e;
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
        .post(
          `http://${process.env.DELIVERLOGIC_DELIVERY_SERVICE_HOSTNAME}:${process.env.DELIVERLOGIC_DELIVERY_PORT}/order/create`,
          data,
        )
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

  async cancelDelivery(deliveryId: string, data?: CancelJobDto): Promise<void> {
    return firstValueFrom(
      this.httpService
        .post(
          `http://${process.env.DELIVERLOGIC_DELIVERY_SERVICE_HOSTNAME}:${process.env.DELIVERLOGIC_DELIVERY_PORT}/order/cancel/${deliveryId}`,
          data,
        )
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

  async getDeliveryDetails(
    deliveryId: string,
  ): Promise<ProviderDeliveryDetailsDto> {
    return firstValueFrom(
      this.httpService
        .post(
          `http://${process.env.DELIVERLOGIC_DELIVERY_SERVICE_HOSTNAME}:${process.env.DELIVERLOGIC_DELIVERY_PORT}/order/cancel/${deliveryId}`,
        )
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
}
