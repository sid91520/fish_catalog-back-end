import { IsDateString, IsEmail, IsInt, IsString, Matches, MinLength } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @Matches(/^\+?[0-9]{10,15}$/, { message: 'mobileNumber must be 10-15 digits' })
  mobileNumber: string;

  @IsInt()
  productId: number;

  /** ISO 8601 date-time, e.g. 2026-10-01T09:00:00+05:30 */
  @IsDateString()
  deliveryTime: string;

  @IsString()
  address: string;
}
