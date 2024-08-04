import { ProductDto } from '.';
import { StructuredAddressDto } from '../../../common/dtos';

export class CreateTaskDto {
  pickupAddress: StructuredAddressDto;
  dropoffAddress: StructuredAddressDto;
  dropoffPhoneNumber: string;
  dropoffName: string;
  dropoffFirstName?: string;
  dropoffLastName?: string;
  dropoffEmail?: string;
  dropoffInstructions?: string;
  pickupInstructions?: string;
  pickupPhoneNumber: string;
  pickupStartTime?: string;
  dropoffEndTime?: string;
  orderValue?: number;
  itemsCount: number;
  tip?: number;
  tax?: number;
  products: ProductDto[];
  externalStoreId: string;
  deliveryExternalReference?: string;
  deliveryExternalNumber?: string;
  pickupBusinessName?: string;
  quoteExternalReference?: string;
  leaveAtDoor?: boolean;
  meetAtDoor?: boolean;
  controlledContents?: string;
  teamId?: string;
  nashGroupId?: string;
  tenantKey?: string;
  jobId?: string;
  taskId?: string;
  jobConfigurationId?: string;
  metadata?: {
    timeZone: string;
    defaultPrepTime: number;
    isScheduled: boolean;
    businessSettings: object;
  };
  shouldSendCustomerNotifications?: boolean;
}
