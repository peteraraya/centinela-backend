import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // Seguridad: Añadir headers HTTP recomendados
  app.use(helmet());

  // Seguridad: Validar automáticamente los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Seguridad: Prevenir ataques de contaminación de parámetros HTTP (HPP OWASP)
  app.use(hpp());

  // Optimización: Comprimir las respuestas con Gzip
  app.use(compression());

  // CORS Restrictivo
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['https://red-centinela.vercel.app', 'http://localhost:5173'];

  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Emergencias Chile')
    .setDescription(
      'Documentación oficial de la API para el monitoreo de emergencias a nivel nacional (SENAPRED, CONAF, SEC, Bomberos).',
    )
    .setVersion('1.0')
    .addTag('incidents', 'Endpoints relacionados con incidentes y emergencias')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Emergencias API - Documentación',
    customfavIcon: 'https://swagger.io/_nuxt/icon.196x196.ab759c.png',
  });

  const portStr = process.env.PORT || '3000';
  const port = parseInt(portStr.trim(), 10) || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
