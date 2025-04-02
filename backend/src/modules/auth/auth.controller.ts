import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { FirebaseAdminService } from '../../shared/services/firebase-admin.service';
import * as process from 'node:process';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly firebaseAdmin: FirebaseAdminService,
  ) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    try {
      const userRecord = await this.firebaseAdmin.createUser(
        body.email,
        body.password,
      );
      const customToken = await this.firebaseAdmin.generateSignInToken(
        userRecord.uid,
      );

      // Tạo user trong database
      await this.authService.createUser({
        uid: userRecord.uid,
        email: userRecord.email || '',
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
      });

      return {
        user: {
          uid: userRecord.uid,
          email: userRecord.email || '',
          emailVerified: userRecord.emailVerified,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
        },
        token: customToken,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      // Xác thực user với Firebase
      const userRecord = await this.firebaseAdmin.getUserByEmail(body.email);

      // Trả về thông tin user
      return {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          emailVerified: userRecord.emailVerified,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          isAdmin: userRecord.email === process.env.ADMIN_EMAIL,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  @Post('verify-token')
  async verifyToken(@Request() req) {
    try {
      // Lấy token từ Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException('No token provided');
      }

      const [bearer, token] = authHeader.split(' ');
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException('Invalid token format');
      }

      const decodedToken = await this.firebaseAdmin.verifyToken(token);
      decodedToken.is_admin = process.env.ADMIN_EMAIL === decodedToken.email;
      return { decodedToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Post('refresh-token')
  @UseGuards(AuthGuard)
  async refreshToken(@Request() req) {
    try {
      const newToken = await this.firebaseAdmin.generateSignInToken(
        req.user.uid,
      );
      return { token: newToken };
    } catch (error) {
      throw new UnauthorizedException('Failed to refresh token');
    }
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@Request() req) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Request() req) {
    // Có thể thêm logic logout ở đây nếu cần
    return { message: 'Logged out successfully' };
  }
}
