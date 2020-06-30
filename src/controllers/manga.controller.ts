import { Controller, Get, Param } from '@nestjs/common';
import ChapterModel from '../models/chapter.model';
import { MangaModel } from '../models/manga.model';
import { MangaService } from '../services/manga.service';

@Controller('manga')
export class MangaController {
  constructor(private mangaService: MangaService) {}

  @Get(':mangaUrlBase64')
  getManga(@Param('mangaUrlBase64') mangaUrlBase64: string): Promise<MangaModel> {
    return this.mangaService.getManga(mangaUrlBase64);
  }

  @Get(':mangaUrlBase64/chapter')
  getChapter(@Param('mangaUrlBase64') mangaUrlBase64: string): Promise<ChapterModel> {
    return this.mangaService.getChapter(mangaUrlBase64);
  }

  @Get(':mangaUrlBase64/chapter/next')
  getNextChapter(@Param('mangaUrlBase64') mangaUrlBase64: string): Promise<ChapterModel> {
    return this.mangaService.getNextChapter(mangaUrlBase64);
  }

  @Get(':mangaUrlBase64/chapter/next/is-available')
  isNextChapterAvailable(@Param('mangaUrlBase64') mangaUrlBase64: string): Promise<MangaModel> {
    return this.mangaService.isMangaNextChapterAvailable(mangaUrlBase64);
  }
}