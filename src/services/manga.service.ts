import { Injectable } from '@nestjs/common';
import { MangaModel } from '../models/manga.model';
import ChapterModel from '../models/chapter.model';
import { ScrapperService } from './scrapper.service';

@Injectable()
export class MangaService {

  constructor(private scrapperService: ScrapperService) {}

  private atob = (b64Encoded: string) => {
    return Buffer.from(b64Encoded, 'base64').toString();
  }

  async getManga(mangaUrlBase64: string): Promise<MangaModel> {
    const url = this.atob(mangaUrlBase64);
    return await this.scrapperService.getMangaFromUrl(url);
  }

  async getChapter(mangaUrlBase64: string): Promise<ChapterModel> {
    return await this.scrapperService.getChapterFromUrl(this.atob(mangaUrlBase64));
  }

  async getNextChapter(mangaUrlBase64: string): Promise<ChapterModel> {
    return await this.scrapperService.getNextChapterFromUrl(this.atob(mangaUrlBase64));
  }

  async isMangaNextChapterAvailable(mangaUrlBase64: string): Promise<MangaModel> {
    return await this.scrapperService.hasNextChapter(this.atob(mangaUrlBase64));
  }
}