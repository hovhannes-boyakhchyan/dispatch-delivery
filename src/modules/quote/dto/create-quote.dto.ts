import {
  IsString,
  IsNumber,
  IsDateString,
  ValidateNested,
  IsOptional,
  ValidateIf,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StructuredAddressDto } from '../../../common/dtos';

export class CreateQuoteDto {
  @Type(() => StructuredAddressDto)
  @ValidateNested()
  readonly dropoffAddress: StructuredAddressDto;

  @Type(() => StructuredAddressDto)
  @ValidateNested()
  readonly pickupAddress: StructuredAddressDto;

  @IsString()
  @IsOptional()
  readonly dropoffPhoneNumber: string;

  @IsString()
  @IsOptional()
  readonly pickupPhoneNumber: string;

  @ValidateIf(
    (createQuoteData: CreateQuoteDto) =>
      !Boolean(createQuoteData.dropoffEndTime),
  )
  @IsDateString()
  readonly pickupStartTime: string;

  @IsDateString()
  @IsOptional()
  readonly pickupEndTime?: string;

  @IsDateString()
  @IsOptional()
  readonly dropoffStartTime?: string;

  @ValidateIf(
    (createQuoteData: CreateQuoteDto) =>
      !Boolean(createQuoteData.pickupStartTime),
  )
  @IsDateString()
  readonly dropoffEndTime: string;

  @IsNumber()
  @IsOptional()
  readonly orderValue: number;

  @IsNumber()
  @IsOptional()
  readonly itemsCount: number;

  @IsString()
  @IsNotEmpty()
  readonly externalStoreId: string;

  @IsString()
  @IsOptional()
  readonly pickupBusinessName: string;

  @IsString()
  @IsOptional()
  readonly dropoffName: string;

  @IsString()
  @IsOptional()
  readonly dropoffFirstName: string;

  @IsString()
  @IsOptional()
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

  @IsNumber()
  @IsOptional()
  readonly tax: number;

  @IsNumber()
  @IsOptional()
  readonly tip: number;

  @IsString()
  @IsOptional()
  readonly teamId: string;

  @IsString()
  @IsOptional()
  readonly nashGroupId: string;

  @IsString()
  @IsOptional()
  tenantKey: string;

  @IsObject()
  @IsOptional()
  metadata: {
    timeZone: string;
    defaultPrepTime: number;
    isScheduled: boolean;
    businessSettings: object;
  };
}
