import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class StructuredAddressDto {
  @IsString()
  @IsNotEmpty()
  readonly streetAddress: string;
  @IsString()
  @IsNotEmpty()
  readonly city: string;
  @IsString()
  @IsNotEmpty()
  readonly state: string;
  @IsString()
  @IsNotEmpty()
  readonly zipCode: string;
  @IsString()
  @IsOptional()
  readonly country: string;
  @IsString()
  @IsOptional()
  readonly unit: string;
  @IsNumber()
  @IsOptional()
  readonly latitude: number;
  @IsNumber()
  @IsOptional()
  readonly longitude: number;
  @IsString()
  @IsOptional()
  readonly fullAddress: string;
}
