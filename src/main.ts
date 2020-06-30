import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as helmet from 'helmet';

if (process.env.MODE !== 'prod') {
  require('dotenv').config();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  await app.listen(5000);
}
bootstrap();
