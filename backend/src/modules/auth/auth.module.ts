import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        forwardRef(() => UsersModule),
        JwtModule.register({
            secret: 'your-secret-key', // Nên đặt trong env
            signOptions: { expiresIn: '24h' },
        }),
    ],
    providers: [AuthService],
    exports: [AuthService, JwtModule],
})
export class AuthModule { } 