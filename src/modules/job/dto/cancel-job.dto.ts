import { IsString, IsOptional } from 'class-validator';

export class CancelJobDto {
  @IsOptional()
  @IsString()
  tenantKey?: string;

  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @IsOptional()
  @IsString()
  businessId?: string;

  @IsOptional()
  @IsString()
  restaurantMailbox?: string;
}
