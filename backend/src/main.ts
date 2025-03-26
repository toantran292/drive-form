import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các properties không được định nghĩa trong DTO
      transform: true, // Tự động transform types
      forbidNonWhitelisted: true, // Throw error nếu có properties không được whitelist
      transformOptions: {
        enableImplicitConversion: true, // Cho phép implicit type conversion
      },
    }),
  );

  // Cấu hình CORS
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://ct240.toantran292.net'] // Domain production
        : ['http://localhost:3000'], // Domain development (Next.js mặc định)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true, // Cho phép gửi cookies
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  });

  // Prefix global cho tất cả routes
  // app.setGlobalPrefix('api');

  // Lấy port từ configuration
  const port = configService.get('port') || 3001;
  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
