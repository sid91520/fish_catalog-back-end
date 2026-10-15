import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AdminRegisterDto extends AdminLoginDto {
  @IsString()
  @MinLength(6)
  declare password: string;
}
