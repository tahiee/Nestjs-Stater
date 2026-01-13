import { IsString, IsEmail, IsOptional, MinLength } from "class-validator";

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
