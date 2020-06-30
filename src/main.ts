import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as helmet from 'helmet';

if (process.env.MODE !== 'prod') {
  require('dotenv').config();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.WHITE_LIST);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
    next();
  });
  await app
    .listen(5000);
}
bootstrap();
