import { DeliveryProvidersEnum } from '../enums';

export type ProvidersConfigType = {
  [key in DeliveryProvidersEnum]: {
    teamId?: string;
    tenantKey?: string;
    nashGroupId?: string;
    freeDeliveryEnabled?: boolean;
    pickupInstructions?: string;
    setInfoInPickupInstruction?: boolean;
    maxDeliveryFee?: number;
  };
};
