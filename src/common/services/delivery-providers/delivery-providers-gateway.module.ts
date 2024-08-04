import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
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
import { DeliveryProvidersGatewayService } from './delivery-providers-gateway.service';

@Module({
  imports: [HttpModule],
  providers: [
    DeliveryProvidersGatewayService,
    DoordashDeliveryApiService,
    FetchmeDeliveryApiService,
    NashDeliveryApiService,
    AllyDeliveryApiService,
    RoutemastersDeliveryApiService,
    DeliverlogicDeliveryApiService,
    BurqDeliveryApiService,
    CartwheelDeliveryApiService,
    SelfDeliveryApiService,
    UberDeliveryApiService,
    SpeedsterDeliveryApiService,
  ],
  exports: [
    DeliveryProvidersGatewayService,
    DoordashDeliveryApiService,
    FetchmeDeliveryApiService,
    NashDeliveryApiService,
    AllyDeliveryApiService,
    RoutemastersDeliveryApiService,
    DeliverlogicDeliveryApiService,
    BurqDeliveryApiService,
    CartwheelDeliveryApiService,
    SelfDeliveryApiService,
    UberDeliveryApiService,
    SpeedsterDeliveryApiService,
  ],
})
export class DeliveryProvidersGatewayModule {}
