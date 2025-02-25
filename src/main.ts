import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express'; // Add this import
import * as path from 'path'; // Change to this import style for consistency
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.get(HttpAdapterHost);

  const config = new DocumentBuilder()
    .setTitle('Job Management API')
    .setDescription('The API for managing job applications')
    .setVersion('1.0')
    .addTag('auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document);

  app.enableCors({
    origin: ['http://192.168.9.182:4200', 'http://localhost:4200'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  const resumesPath = path.join(__dirname, '..', '..', 'data', 'resumes');

  app.use(
    '/uploads/resumes',
    express.static(resumesPath, {
      setHeaders: (res) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('X-Content-Type-Options', 'nosniff');
      },
    }),
  );


  
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(4000);
}
bootstrap();
