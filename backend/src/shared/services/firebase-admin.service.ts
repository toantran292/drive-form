import { Injectable } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Injectable()
export class FirebaseAdminService {
    constructor(
        private readonly firebaseService: FirebaseService
    ) { }

    async verifyToken(token: string) {
        try {
            const decodedToken = await this.firebaseService.auth.verifyIdToken(token);
            return decodedToken;
        } catch (error) {
            console.error('Token verification error:', error);
            throw error;
        }
    }

    async createSessionCookie(idToken: string, expiresIn = 60 * 60 * 24 * 5 * 1000) {
        try {
            const sessionCookie = await this.firebaseService.auth.createSessionCookie(idToken, {
                expiresIn, // 5 days by default
            });
            return sessionCookie;
        } catch (error) {
            console.error('Session cookie creation error:', error);
            throw error;
        }
    }

    async generateSignInToken(uid: string) {
        try {
            const customToken = await this.firebaseService.auth.createCustomToken(uid);
            return customToken;
        } catch (error) {
            console.error('Custom token generation error:', error);
            throw error;
        }
    }

    async createUser(email: string, password: string) {
        try {
            return await this.firebaseService.auth.createUser({
                email,
                password,
            });
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    }

    async getUserByEmail(email: string) {
        try {
            return await this.firebaseService.auth.getUserByEmail(email);
        } catch (error) {
            console.error('Get user error:', error);
            throw error;
        }
    }
} 