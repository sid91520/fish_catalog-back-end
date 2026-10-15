import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateFishProductDto {
  @IsString()
  name: string;

  /** Image URL */
  @IsOptional()
  @IsString()
  image?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPrice?: number;
}
