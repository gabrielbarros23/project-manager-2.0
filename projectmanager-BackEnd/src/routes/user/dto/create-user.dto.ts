import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length } from "class-validator";

export class CreateUserDto {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message: 'Password is too weak. It must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special symbol.',
    }
  )
  password: string;
}
