import { Controller, Get, Param } from '@nestjs/common';
import ChapterModel from '../models/ChapterModel';
import { MangaModel } from '../models/MangaModel';
import { ScrapperService } from '../services/scrapper.service';

@Controller('manga')
export class MangaController {
  constructor(private scrapperService: ScrapperService) {}

  @Get(':mangaUrlBase64')
  getManga(@Param('mangaUrlBase64') mangaUrlBase64: string): Promise<MangaModel> {
    return this.scrapperService.getManga(mangaUrlBase64);
  }

  @Get(':mangaUrlBase64/chapter')
  getChapter(@Param('mangaUrlBase64') mangaUrlBase64: string): Promise<ChapterModel> {
    return this.scrapperService.getChapter(mangaUrlBase64);
  }

  @Get(':mangaUrlBase64/chapter/next')
  getNextChapter(@Param('mangaUrlBase64') mangaUrlBase64: string): Promise<ChapterModel> {
    return this.scrapperService.getNextChapter(mangaUrlBase64);
  }

  @Get(':mangaUrlBase64/chapter/is-available')
  isNextChapterAvailable(@Param('mangaUrlBase64') mangaUrlBase64: string): boolean {
    return this.scrapperService.isMangaNextChapterAvailable(mangaUrlBase64);
  }
}