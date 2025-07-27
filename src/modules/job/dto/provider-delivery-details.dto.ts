import { DeliveryDetailsStatusEnum } from '../../../common/enums';

export class ProviderDeliveryDetailsDto {
  status: DeliveryDetailsStatusEnum;
  courier: {
    name: string;
    vehicleType: string;
    phoneNumber: string;
    location: {
      lat: number;
      lng: number;
    };
    imgHref?: string;
    vehicleMake: string;
    vehicleModel: string;
    locationDescription: string;
    vehicleColor: string;
    trackingUrl: string;
  };
}
