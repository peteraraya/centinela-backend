import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para que el frontend (React) pueda consumir la API
  // En producción, es recomendable cambiar el '*' por la URL específica del frontend (ej: 'http://localhost:5173')
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
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
