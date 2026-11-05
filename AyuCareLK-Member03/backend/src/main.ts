import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpErrorFilter } from './common/http-exception.filter';
import type { AppEnv } from './config/env';

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<AppEnv, true>);
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.enableCors({ origin: config.get('FRONTEND_ORIGINS', { infer: true }).split(','), methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, forbidUnknownValues: true, exceptionFactory: (errors) => new BadRequestException(errors.map((error) => Object.values(error.constraints ?? {}).join(', '))) }));
  app.useGlobalFilters(new HttpErrorFilter());
  if (config.get('NODE_ENV', { infer: true }) !== 'production') {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('AyuCare LK API').setVersion('1.0').addBearerAuth().build());
    SwaggerModule.setup(config.get('SWAGGER_PATH', { infer: true }), app, document, { useGlobalPrefix: false });
  }
  await app.listen(config.get('PORT', { infer: true }));
}

if (require.main === module) void bootstrap();
