import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsDateString,
  ValidateNested,
  IsOptional,
  IsBoolean,
  ValidateIf,
  IsObject,
} from 'class-validator';
import { ProductDto } from '.';
import { StructuredAddressDto } from '../../../common/dtos';

export class CreateJobDto {
  @Type(() => StructuredAddressDto)
  @ValidateNested()
  readonly pickupAddress: StructuredAddressDto;

  @Type(() => StructuredAddressDto)
  @ValidateNested()
  readonly dropoffAddress: StructuredAddressDto;

  @IsNotEmpty()
  @IsString()
  readonly dropoffPhoneNumber: string;

  @IsNotEmpty()
  @IsString()
  readonly dropoffName: string;

  @IsOptional()
  @IsString()
  readonly dropoffFirstName: string;

  @IsOptional()
  @IsString()
  readonly dropoffLastName: string;

  @IsString()
  @IsOptional()
  readonly dropoffEmail: string;

  @IsString()
  @IsOptional()
  readonly dropoffInstructions: string;

  @IsString()
  @IsOptional()
  readonly pickupInstructions: string;

  @IsNotEmpty()
  @IsString()
  readonly pickupPhoneNumber: string;

  @ValidateIf(
    (createJobData: CreateJobDto) => !Boolean(createJobData.dropoffEndTime),
  )
  @IsDateString()
  readonly pickupStartTime: string;

  @ValidateIf(
    (createJobData: CreateJobDto) => !Boolean(createJobData.pickupStartTime),
  )
  @IsDateString()
  readonly dropoffEndTime: string;

  @IsNumber()
  @IsOptional()
  readonly orderValue: number;

  @IsNumber()
  @IsOptional()
  readonly itemsCount: number;

  @IsNumber()
  @IsOptional()
  readonly tip: number;

  @IsNumber()
  @IsOptional()
  readonly tax: number;

  @Type(() => ProductDto)
  @ValidateNested()
  readonly products: ProductDto[];

  @IsString()
  @IsNotEmpty()
  readonly externalStoreId: string;

  @IsString()
  @IsOptional()
  readonly deliveryExternalReference: string;

  @IsString()
  @IsOptional()
  readonly deliveryExternalNumber: string;

  @IsString()
  @IsOptional()
  readonly pickupBusinessName: string;

  @IsString()
  @IsOptional()
  quoteExternalReference: string;

  @IsBoolean()
  @IsOptional()
  readonly leaveAtDoor: boolean;

  @IsBoolean()
  @IsOptional()
  readonly meetAtDoor: boolean;

  @IsString()
  @IsOptional()
  readonly controlledContents: string;

  @IsString()
  @IsOptional()
  readonly teamId: string;

  @IsString()
  @IsOptional()
  readonly nashGroupId: string;

  @IsString()
  @IsOptional()
  tenantKey: string;

  @IsString()
  @IsOptional()
  jobId: string;

  @IsString()
  @IsOptional()
  taskId: string;

  @IsString()
  @IsOptional()
  jobConfigurationId: string;

  @IsObject()
  @IsOptional()
  metadata: {
    timeZone: string;
    defaultPrepTime: number;
    isScheduled: boolean;
    businessSettings: object;
  };

  @IsOptional()
  @IsBoolean()
  shouldSendCustomerNotifications?: boolean;
}
