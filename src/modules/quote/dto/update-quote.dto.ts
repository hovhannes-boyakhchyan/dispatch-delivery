import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateQuoteDto {
  @IsOptional()
  @IsString()
  packageDescription?: string;

  @IsOptional()
  @IsNumber()
  tipAmount?: number;

  @IsOptional()
  @IsNumber()
  packageValue?: number;

  @IsOptional()
  @IsNumber()
  itemsCount?: number;

  @IsOptional()
  @IsString()
  dropoffInstructions?: string;

  @IsOptional()
  @IsString()
  dropoffPhoneNumber?: string;

  @IsOptional()
  @IsString()
  dropoffFirstName?: string;

  @IsOptional()
  @IsString()
  dropoffLastName?: string;

  @IsOptional()
  @IsString()
  externalIdentifier?: string;

  @IsString()
  @IsOptional()
  jobId?: string;

  @IsString()
  @IsOptional()
  taskId?: string;

  @IsString()
  @IsOptional()
  jobConfigurationId?: string;
}
