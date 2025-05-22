import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PORT, ORIGIN } from './constants/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ORIGIN,
    credentials: true,
  });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(PORT);
  return `Application is running on port ${PORT}`;
}

bootstrap().then(console.log).catch(console.error);

process.on('exit', (code) => {
  process.exit(code);
});

process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err);
  // process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection', err);
  // process.exit(0);
});
