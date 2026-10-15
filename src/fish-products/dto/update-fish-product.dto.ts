import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateFishProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPrice?: number;
}
