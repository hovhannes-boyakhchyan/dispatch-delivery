import { Injectable, OnModuleInit } from '@nestjs/common';
import { AbstractDeliveryService } from './providers/abstract-delivery.service';
import {
  AllyDeliveryApiService,
  BurqDeliveryApiService,
  CartwheelDeliveryApiService,
  DeliverlogicDeliveryApiService,
  DoordashDeliveryApiService,
  FetchmeDeliveryApiService,
  NashDeliveryApiService,
  RoutemastersDeliveryApiService,
  SelfDeliveryApiService,
  UberDeliveryApiService,
  SpeedsterDeliveryApiService,
} from './providers';
import { DeliveryProvidersEnum } from '../../enums';
import {
  CancelJobDto,
  CreateTaskDto,
  ProviderCreateDeliveryResponseDto,
  ProviderDeliveryDetailsDto,
} from '../../../modules/job/dto';
import { CreateQuoteDto, ProviderQuotesDto } from '../../../modules/quote/dto';

@Injectable()
export class DeliveryProvidersGatewayService implements OnModuleInit {
  private providerGateways: Record<string, AbstractDeliveryService> = {};
  constructor(
    private readonly allyDeliveryApiService: AllyDeliveryApiService,
    private readonly burqDeliveryApiService: BurqDeliveryApiService,
    private readonly cartwheelDeliveryApiService: CartwheelDeliveryApiService,
    private readonly deliverlogicDeliveryApiService: DeliverlogicDeliveryApiService,
    private readonly doordashDeliveryApiService: DoordashDeliveryApiService,
    private readonly fetchmeDeliveryApiService: FetchmeDeliveryApiService,
    private readonly nashDeliveryApiService: NashDeliveryApiService,
    private readonly routemastersDeliveryApiService: RoutemastersDeliveryApiService,
    private readonly selfDeliveryApiService: SelfDeliveryApiService,
    private readonly uberDeliveryApiService: UberDeliveryApiService,
    private readonly speedsterDeliveryApiService: SpeedsterDeliveryApiService,
  ) {}

  onModuleInit(): void {
    this.registerDeliveryProviders();
  }

  private registerDeliveryProviders(): void {
    this.providerGateways[DeliveryProvidersEnum.ALLY] =
      this.allyDeliveryApiService;
    this.providerGateways[DeliveryProvidersEnum.BURQ] =
      this.burqDeliveryApiService;
    this.providerGateways[DeliveryProvidersEnum.CARTWHEEL] =
      this.cartwheelDeliveryApiService;
    this.providerGateways[DeliveryProvidersEnum.DELIVERLOGIC] =
      this.deliverlogicDeliveryApiService;
    this.providerGateways[DeliveryProvidersEnum.DOORDASH] =
      this.doordashDeliveryApiService;
    this.providerGateways[DeliveryProvidersEnum.FETCHME] =
      this.fetchmeDeliveryApiService;
    this.providerGateways[DeliveryProvidersEnum.NASH] =
      this.nashDeliveryApiService;
    this.providerGateways[DeliveryProvidersEnum.ROUTEMASTERS] =
      this.routemastersDeliveryApiService;
    this.providerGateways[DeliveryProvidersEnum.SELF] =
      this.selfDeliveryApiService;
    this.providerGateways[DeliveryProvidersEnum.UBER] =
      this.uberDeliveryApiService;
    this.providerGateways[DeliveryProvidersEnum.SPEEDSTER] =
      this.speedsterDeliveryApiService;
  }

  async getQuote(
    provider: DeliveryProvidersEnum,
    createQuoteData: CreateQuoteDto,
  ): Promise<ProviderQuotesDto> {
    return this.providerGateways[provider].getQuote(createQuoteData);
  }

  async createDelivery(
    provider: DeliveryProvidersEnum,
    createDeliveryData: CreateTaskDto,
  ): Promise<ProviderCreateDeliveryResponseDto> {
    return this.providerGateways[provider].createDelivery(createDeliveryData);
  }

  async cancelDelivery(
    provider: DeliveryProvidersEnum,
    deliveryId: string,
    cancelDeliveryData: CancelJobDto,
  ): Promise<void> {
    return this.providerGateways[provider].cancelDelivery(
      deliveryId,
      cancelDeliveryData,
    );
  }

  async getDeliveryDetails(
    provider: DeliveryProvidersEnum,
    deliveryId: string,
  ): Promise<ProviderDeliveryDetailsDto> {
    return this.providerGateways[provider].getDeliveryDetails(deliveryId);
  }
}
