import { Controller, Get, Param } from '@nestjs/common';
import ChapterModel from '../models/ChapterModel';
import { MangaModel } from '../models/MangaModel';

@Controller('manga')
export class MangaController {

  @Get(':mangaUrlBase64')
  getManga(@Param('mangaUrlBase64') mangaUrlBase64: string): MangaModel {
    return new MangaModel(mangaUrlBase64, 'testcover', 'testtitle');
  }

  @Get(':mangaUrlBase64/chapter')
  getChapter(@Param('mangaUrlBase64') mangaUrlBase64: string): ChapterModel {
    return new ChapterModel(mangaUrlBase64, 'testcover', 'testtitle', []);
  }

  @Get(':mangaUrlBase64/chapter/next')
  getNextChapter(@Param('mangaUrlBase64') mangaUrlBase64: string): ChapterModel {
    return new ChapterModel(mangaUrlBase64, 'testcover', 'testtitle', []);
  }

  @Get(':mangaUrlBase64/chapter/is-available')
  isNextChapterAvailable(@Param('mangaUrlBase64') mangaUrlBase64: string): boolean {
    return true;
  }
}