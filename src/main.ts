import cors from 'cors';
import helmet from 'helmet';

import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: ['log', 'error', 'warn', 'debug'],
  });

  // Security layer
  app.use(helmet()); // Express middeware to set various HTTP headers for app security
  app.use(cors());

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Pre-controller layer
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have any decorators in the DTO
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
      transform: true,
    }),
  );
  // Post-controller layer
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port') ?? 3000;

  // Swagger (API DOCS)
  if (config.get<string>('app.nodeEnv') !== 'production') {
    const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
    const docConfig = new DocumentBuilder()
      .setTitle('Chat API')
      .setDescription('Example Chat API (send, edit, delete, reply)')
      .setVersion('0.0.1')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, docConfig);
    SwaggerModule.setup('/docs', app, document);
  }

  await app.listen(port);
  console.log(`🚀 Chat API running on http://localhost:${port}`);
}
void bootstrap();
