import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }

    generateToken(user: User) {
        const payload = {
            sub: user.id,
            username: user.username
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
} 