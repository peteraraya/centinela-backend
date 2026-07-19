import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import express from 'express';

const server = express();

export const createNestServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  // Habilitar CORS
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

  await app.init();
  return app;
};

createNestServer(server)
  .then(() => console.log('Nest Ready on Vercel'))
  .catch((err) => console.error('Nest broken on Vercel', err));

export default server;
