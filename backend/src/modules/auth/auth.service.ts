import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { FirebaseAdminService } from '../../shared/services/firebase-admin.service';

interface CreateUserDto {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly firebaseAdmin: FirebaseAdminService,
  ) {}

  async createUser(userData: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async validateToken(token: string): Promise<User> {
    try {
      const decodedToken = await this.firebaseAdmin.verifyToken(token);

      let user = await this.userRepository.findOne({
        where: { uid: decodedToken.uid },
      });

      if (!user) {
        // Create new user if not exists
        const firebaseUser = await this.firebaseAdmin.getUserByEmail(
          decodedToken.email || '',
        );

        user = await this.createUser({
          uid: decodedToken.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUser(uid: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { uid } });
  }
}
