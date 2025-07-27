import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { AbstractDeliveryService } from './abstract-delivery.service';
import {
  CreateQuoteDto,
  ProviderQuotesDto,
} from '../../../../modules/quote/dto';
import {
  CancelJobDto,
  CreateTaskDto,
  ProviderCreateDeliveryResponseDto,
  ProviderDeliveryDetailsDto,
} from '../../../../modules/job/dto';

@Injectable()
export class RoutemastersDeliveryApiService implements AbstractDeliveryService {
  private logger: Logger = new Logger(RoutemastersDeliveryApiService.name);
  constructor(private readonly httpService: HttpService) {}

  async getQuote(data: CreateQuoteDto): Promise<ProviderQuotesDto> {
    return firstValueFrom(
      this.httpService
        .post(
          `http://${process.env.ROUTEMASTERS_DELIVERY_SERVICE_HOSTNAME}:${process.env.ROUTEMASTERS_DELIVERY_PORT}/quote/create`,
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
            return null;
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
          `http://${process.env.ROUTEMASTERS_DELIVERY_SERVICE_HOSTNAME}:${process.env.ROUTEMASTERS_DELIVERY_PORT}/delivery/create`,
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

  async cancelDelivery(deliveryId: string, data: CancelJobDto): Promise<void> {
    return firstValueFrom(
      this.httpService
        .post(
          `http://${process.env.ROUTEMASTERS_DELIVERY_SERVICE_HOSTNAME}:${process.env.ROUTEMASTERS_DELIVERY_PORT}/delivery/cancel/${deliveryId}`,
          data,
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
        .get(
          `http://${process.env.ROUTEMASTERS_DELIVERY_SERVICE_HOSTNAME}:${process.env.ROUTEMASTERS_DELIVERY_PORT}/delivery/details/${deliveryId}`,
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
}
