import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { FirebaseAdminService } from '../shared/services/firebase-admin.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly firebaseAdmin: FirebaseAdminService) { }

    @Post('register')
    async register(@Body() body: { email: string; password: string }) {
        try {
            const userRecord = await this.firebaseAdmin.createUser(
                body.email,
                body.password
            );
            const customToken = await this.firebaseAdmin.generateSignInToken(userRecord.uid);

            return {
                user: userRecord,
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

            // Tạo custom token cho user
            const customToken = await this.firebaseAdmin.generateSignInToken(userRecord.uid);

            return {
                user: {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    emailVerified: userRecord.emailVerified,
                    displayName: userRecord.displayName,
                    photoURL: userRecord.photoURL,
                },
                token: customToken,
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid email or password');
        }
    }

    @Post('verify-token')
    async verifyToken(@Body() body: { token: string }) {
        try {
            const decodedToken = await this.firebaseAdmin.verifyToken(body.token);
            return decodedToken;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
} 