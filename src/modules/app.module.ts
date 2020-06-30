import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { MangaController } from '../controllers/manga.controller';
import { ScrapperService } from '../services/scrapper.service';
import { CsvService } from '../services/csv.service';
import { LoggerModule } from './logger.module';
import { MangaService } from '../services/manga.service';

@Module({
  imports: [LoggerModule],
  controllers: [AppController, MangaController],
  providers: [AppService, ScrapperService, CsvService, MangaService],
})
export class AppModule {}
