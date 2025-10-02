import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { UserRole } from '../../users/enums/user-role.enum';

export class SignupDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(100, { message: 'First name must not exceed 100 characters' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
  lastName: string;

  @IsEnum(UserRole, { message: 'Invalid user role' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Newsletter name must not exceed 200 characters' })
  newsletterName?: string;
}
