import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import {
  ERROR_DELIVERY_REQUIRED_FIELDS,
  UNABLE_TO_DELIVERY,
} from '../../../constants';
import { AbstractDeliveryService } from './abstract-delivery.service';
import {
  CreateQuoteDto,
  ProviderQuotesDto,
  UpdateQuoteDto,
} from '../../../../modules/quote/dto';
import {
  CreateJobDto,
  ProviderCreateDeliveryResponseDto,
  ProductDto,
  ProviderDeliveryDetailsDto,
} from '../../../../modules/job/dto';

@Injectable()
export class NashDeliveryApiService implements AbstractDeliveryService {
  private logger: Logger = new Logger(NashDeliveryApiService.name);
  constructor(private readonly httpService: HttpService) {}

  async getQuote(data: CreateQuoteDto): Promise<ProviderQuotesDto> {
    if (!data.dropoffName || !data.dropoffPhoneNumber) {
      throw ERROR_DELIVERY_REQUIRED_FIELDS;
    }

    return firstValueFrom(
      this.httpService
        .post(`${process.env.NASH_DDELIVERY_SERVICE}/job/create`, data)
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

  async updateQuote({
    jobId,
    jobConfigurationId,
    ...data
  }: UpdateQuoteDto): Promise<{ data: ProviderQuotesDto }> {
    return firstValueFrom(
      this.httpService
        .patch(
          `${process.env.NASH_DDELIVERY_SERVICE}/job/${jobId}/${jobConfigurationId}`,
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

  async selectJob({
    quoteExternalReference,
    jobId,
    taskId,
  }: CreateJobDto): Promise<ProviderCreateDeliveryResponseDto> {
    return firstValueFrom(
      this.httpService
        .post(
          `${process.env.NASH_DDELIVERY_SERVICE}/quote/select/jobs/${jobId}/tasks/${taskId}`,
          {
            quoteId: quoteExternalReference,
          },
        )
        .pipe(
          map((response) => {
            return response.data?.data;
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
    await firstValueFrom(
      this.httpService
        .post(`${process.env.NASH_DDELIVERY_SERVICE}/job/cancel/${deliveryId}`)
        .pipe(
          map((response) => {
            return response.data?.data;
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
        .post(`${process.env.NASH_DDELIVERY_SERVICE}/job/cancel/${deliveryId}`)
        .pipe(
          map((response) => {
            return response.data?.data;
          }),
          catchError((e) => {
            e = e?.response?.data?.message || e;
            this.logger.error(JSON.stringify(e));
            return of(null);
          }),
        ),
    );
  }

  async createDelivery(
    createDeliveryData: CreateJobDto,
  ): Promise<ProviderCreateDeliveryResponseDto> {
    const updateData = this.mapUpdateQuoteData(createDeliveryData);
    await this.updateQuote(updateData);
    return this.selectJob(createDeliveryData);
  }

  private mapUpdateQuoteData(createDeliveryData: CreateJobDto): UpdateQuoteDto {
    return {
      packageDescription: this.getPackageDescription(
        createDeliveryData.products,
      ),
      tipAmount: createDeliveryData.tip || 0,
      packageValue: createDeliveryData.orderValue,
      itemsCount: this.getProductCount(createDeliveryData.products),
      dropoffInstructions: createDeliveryData.dropoffInstructions,
      dropoffPhoneNumber: createDeliveryData.dropoffPhoneNumber,
      dropoffFirstName: createDeliveryData.dropoffFirstName,
      dropoffLastName: createDeliveryData.dropoffLastName,
      externalIdentifier: createDeliveryData.deliveryExternalNumber,
      jobId: createDeliveryData.jobId,
      jobConfigurationId: createDeliveryData.jobConfigurationId,
    };
  }

  private getPackageDescription(products: ProductDto[]) {
    let description = '';
    if (products?.length) {
      description = products
        .map((product) => `${product.quantity} x ${product.title}`)
        .join(', ');
    }
    return description;
  }

  private getProductCount(products: ProductDto[]) {
    return products.reduce((a, p) => p.quantity + a, 0);
  }
}
