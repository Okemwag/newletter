import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
  ) {}

  async register(signupDto: SignupDto): Promise<{ user: User; tokens: any }> {
    const { email, password, firstName, lastName, role, newsletterName } =
      signupDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      newsletterName,
    });

    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword as User, tokens };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; tokens: any }> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword as User, tokens };
  }

  async refreshTokens(refreshToken: string): Promise<any> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken);

      // Find refresh token in database
      const tokenHash = await this.hashPassword(refreshToken);
      const storedToken = await this.refreshTokenRepository.findOne({
        where: { userId: payload.sub },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if token is expired
      if (new Date() > storedToken.expiresAt) {
        await this.refreshTokenRepository.remove(storedToken);
        throw new UnauthorizedException('Refresh token expired');
      }

      // Find user
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // Remove all refresh tokens for user
    await this.refreshTokenRepository.delete({ userId });
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return user;
  }

  private async generateTokens(user: User): Promise<any> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate access token
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRATION || '1h',
    });

    // Generate refresh token
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    // Store refresh token hash in database
    await this.storeRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRATION || '1h',
    };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    // Remove old refresh tokens for this user
    await this.refreshTokenRepository.delete({ userId });

    // Hash the refresh token
    const tokenHash = await this.hashPassword(refreshToken);

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

    // Create and save new refresh token
    const refreshTokenEntity = this.refreshTokenRepository.create({
      tokenHash,
      userId,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  private async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
