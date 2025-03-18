import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private authService: AuthService,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        // Kiểm tra username đã tồn tại chưa
        const existingUser = await this.usersRepository.findOne({
            where: { username: createUserDto.username }
        });

        if (existingUser) {
            throw new ConflictException('Username đã tồn tại');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });
        return this.usersRepository.save(user);
    }

    async validateUser(loginDto: LoginDto): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { username: loginDto.username }
        });

        if (!user) {
            throw new UnauthorizedException('Username hoặc mật khẩu không đúng');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Username hoặc mật khẩu không đúng');
        }

        return user;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto);
        const { password, ...userData } = user;
        const token = this.authService.generateToken(user);

        return {
            user: userData,
            ...token
        };
    }
}