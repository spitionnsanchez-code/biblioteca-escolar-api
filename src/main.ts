import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Biblioteca Escolar API')
    .setDescription('API for managing a school library system')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentication')
    .addTag('Members')
    .addTag('Books')
    .addTag('Categories')
    .addTag('Loans')
    .addTag('Notifications')
    .addTag('Reports')
    .addTag('Reservations')
    .addTag('Fines')
    .addTag('Roles')
    .addTag('Users')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
