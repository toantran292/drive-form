import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { User } from './entities/user.entity';
import { DriveItem } from './entities/drive-item.entity';
import { Form, FormResponse } from './entities/form.entity';
import { MulterModule } from '@nestjs/platform-express';
import { DriveModule } from './modules/drive/drive.module';
import { SharedModule } from './shared/shared.module';
import { Category, Project } from './entities/project.entity';
import { Phase } from './entities/phase.entity';
import { ProjectModule } from './modules/project/project.module';
import { PhaseModule } from './modules/phase/phase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          User,
          DriveItem,
          Form,
          FormResponse,
          Project,
          Phase,
          Category,
        ],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
    AuthModule,
    DriveModule,
    SharedModule,
    ProjectModule,
    PhaseModule,
  ],
})
export class AppModule {}
