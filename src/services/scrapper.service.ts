import { Injectable } from '@nestjs/common';

@Injectable()
export class ScrapperService {

  getManga(mangaUrlBase64: string) {
    return Promise.resolve(undefined);
  }

  getChapter(mangaUrlBase64: string) {
    return Promise.resolve(undefined);
  }

  getNextChapter(mangaUrlBase64: string) {
    return Promise.resolve(undefined);
  }

  isMangaNextChapterAvailable(mangaUrlBase64: string) {
    return false;
  }
}