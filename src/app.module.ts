import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { MangaController } from './controllers/manga.controller';

@Module({
  imports: [],
  controllers: [AppController, MangaController],
  providers: [AppService],
})
export class AppModule {}
