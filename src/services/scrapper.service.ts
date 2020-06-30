import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MangaModel } from '../models/manga.model';
import { CsvService } from './csv.service';
import { AppLogger } from './app.logger';
import ChapterModel from '../models/chapter.model';
import { SelectorCollectionModel } from '../models/selector.collection.model';


@Injectable()
export class ScrapperService {
  constructor(private csvService: CsvService, private logger: AppLogger) {
    this.logger.setContext('ScrapperService');
  }

  private browser;
  private selectors: SelectorCollectionModel;

  async getMangaFromUrl(url) {
    const page = await this.getNewPage();
    await this.goToChapter(url, page);
    const manga = await this.getTitleAndCoverFromPage(page);
    await page.close();
    const mangaWithEncodedUrl = manga
      ? { urlBase64: Buffer.from(url).toString('base64'), ...manga }
      : undefined;
    this.logger
      .appendMethod(this.getMangaFromUrl)
      .debug(`\n${JSON.stringify(mangaWithEncodedUrl, null, 4)}`);
    return mangaWithEncodedUrl;
  }

  async getSelectors() {
    if (!this.selectors) {
      this.selectors = new SelectorCollectionModel();
      this.selectors.coverSelectors = await this.csvService.getSelectorsFromCSVFile('cover');
      this.selectors.imagesSelectors = await this.csvService.getSelectorsFromCSVFile('images');
      this.selectors.nextChapterSelectors = await this.csvService.getSelectorsFromCSVFile('next-chapter');
      this.selectors.titleSelectors = await this.csvService.getSelectorsFromCSVFile('title');
      this.logger.appendMethod(this.getSelectors).debug(`selectors loaded: \n${JSON.stringify(this.selectors, null, 4)}`);
    }
    return this.selectors;
  }

  private async getTitleAndCoverFromPage(page): Promise<MangaModel | undefined> {
    if (!page) {
      return;
    }
    const selectors = await this.getSelectors();
    const result = await page.evaluate((selectors) => {
      let title = selectors.titleSelectors
        .map(selector => eval(selector))
        .find(content => content !== undefined) || '';
      let cover = selectors.coverSelectors
        .map(selector => eval(selector))
        .find(content => content !== undefined) || '';
      return cover || title ? { cover: cover, title: title } : undefined;
    }, selectors);

    this.logger.appendMethod(this.getTitleAndCoverFromPage).debug(`\n${JSON.stringify(result, null, 4)}`);
    return result;
  }

  async getChapterImages(page): Promise<ChapterModel> {
    this.logger.appendMethod(this.getChapterImages).debug('running');
    const selectors = await this.getSelectors();

    const response = await page.evaluate(async (selectors, corsProxyUrl) => {
      if (!selectors) {
        return { error: 'selectors input is empty' };
      }
      if (!corsProxyUrl) {
        return { error: 'corsProxyUrl input is empty' };
      }
      try {
        const images = [];
        images.push(
          ...selectors.imagesSelectors
            .map(selector => eval(selector))
            .find(content => content !== undefined && content.length > 0)
            .toArray()
            .map(({ currentSrc }) => currentSrc),
        );

        async function getDataUri(targetUrl) {
          return await new Promise(function(resolve, reject) {
            let request = new XMLHttpRequest();
            request.onload = function() {
              if (request.status >= 200 && request.status < 400) {
                let reader = new FileReader();
                reader.onloadend = function() {
                  return resolve(reader.result.toString());
                };
                reader.readAsDataURL(request.response);
              } else {
                console.log('There was an error retrieving the image', request);
                return reject('There was an error retrieving the image' + request);
              }
            };
            request.onerror = () => reject(request.statusText);
            request.open('GET', corsProxyUrl + targetUrl);
            request.responseType = 'blob';
            request.send();
          });
        }

        async function getBase64Images(images) {
          const base64Images = [];
          for (let i = 0; i < images.length; i++) {
            await getDataUri(images[i]).then(base64Image => base64Images.push(base64Image));
          }
          return base64Images;
        }

        async function convertChapterImagesToBase64(chapter) {
          const base64Images = await getBase64Images(chapter.images);
          console.log('convert: ', chapter.images.toString());
          return { ...chapter, images: base64Images };
        }

        async function isRestrictedByCORS() {
          return await new Promise(function(resolve, _) {
            let xhr = new XMLHttpRequest();
            if ('withCredentials' in xhr) {
              xhr.open('GET', images[0], true);
            }
            xhr.send();
            xhr.onloadend = function() {
              resolve(false);
            };
            xhr.onerror = function() {
              resolve(true);
            };
          });
        }

        const restricted = await isRestrictedByCORS;

        if (restricted) {
          return await convertChapterImagesToBase64({
            images: images,
          });
        } else {
          return {
            images: images,
          };
        }
      } catch (err) {
        return {
          error: err
            ? JSON.stringify(err, null, 4) :
            'An unknown error occurred during chapter images scrapping process',
        };
      }
    }, selectors, process.env.CORS_ANYWHERE_URL);
    if (!response || response.error !== undefined) {
      throw new HttpException(
        response ? response.error : `unknown error, image scrapping failure`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logger
      .appendMethod(this.getChapterImages)
      .debug('nb images loaded: \n' + JSON.stringify(
        { ...response, images: 'nb images: ' + response.images.length },
        null,
        4),
      );
    return response;
  }

  async scrapChapter(page): Promise<ChapterModel> {
    await this.autoScroll(page);
    const coverAndTitle = await this.getTitleAndCoverFromPage(page);
    const images = await this.getChapterImages(page);
    if (!coverAndTitle || !images) {
      throw new HttpException(`not found`, HttpStatus.NOT_FOUND);
    }
    return { ...coverAndTitle, ...images };
  }

  async hasNextChapter(url): Promise<MangaModel> {
    this.logger.appendMethod(this.hasNextChapter).debug('running');
    const page = await this.getNewPage();
    await this.goToChapter(url, page);
    const nextChapterUrl = await this.goToNextChapter(page);
    const manga = await this.getTitleAndCoverFromPage(page);
    await page.close();
    const nextChapterMetadata = { ...manga, urlBase64: Buffer.from(nextChapterUrl).toString('base64') };
    this.logger.appendMethod(this.hasNextChapter).debug('result\n' + JSON.stringify(nextChapterMetadata, null, 4));
    return nextChapterMetadata;
  }

  async getChapterFromUrl(url): Promise<ChapterModel> {
    this.logger
      .appendMethod(this.getChapterFromUrl)
      .debug('running');
    const page = await this.getNewPage();
    await this.goToChapter(url, page);
    const chapter = await this.scrapChapter(page);
    await page.close();
    const chapterWithEncodedUrl = { urlBase64: Buffer.from(url).toString('base64'), ...chapter };
    this.logger
      .appendMethod(this.getChapterFromUrl)
      .debug('result:\n' +
        JSON.stringify(
          { ...chapterWithEncodedUrl, images: [`size: ${chapter.images.length}`] },
          null,
          4,
        ),
      );
    return chapterWithEncodedUrl;
  }

  async getNextChapterFromUrl(url): Promise<ChapterModel> {
    this.logger
      .appendMethod(this.getNextChapterFromUrl)
      .debug('running');
    const page = await this.getNewPage();
    await this.goToChapter(url, page);
    await this.goToNextChapter(page);
    const chapter = await this.scrapChapter(page);
    await page.close();
    const nextChapter = { urlBase64: Buffer.from(url).toString('base64'), ...chapter };
    this.logger
      .appendMethod(this.getNextChapterFromUrl)
      .debug('result:\n' + JSON.stringify({ ...nextChapter, images: [`size: ${chapter.images.length}`] }, null, 4));
    return nextChapter;
  }

  async getNextChapterUrl(page): Promise<string> {
    this.logger.appendMethod(this.getNextChapterUrl).debug('running');

    const selectors = await this.getSelectors();
    const nextChapterUrl = await page.evaluate((selectors) => {
      const nextChapterLink = selectors.nextChapterSelectors
        .map(selector => eval(selector))
        .find(content => content !== undefined && content.href !== undefined);
      return nextChapterLink && nextChapterLink.href ? nextChapterLink.href : undefined;
    }, selectors);

    if (!nextChapterUrl) {
      throw new HttpException('no chapter available', HttpStatus.NOT_FOUND);
    }
    this.logger.appendMethod(this.getNextChapterUrl).debug('result: ' + nextChapterUrl);
    return nextChapterUrl;
  }

  async goToNextChapter(page): Promise<string> {
    const url = await this.getNextChapterUrl(page);
    this.logger.appendMethod(this.goToNextChapter).debug(url);
    await page.goto(url);
    return url;
  }

  async autoScroll(page) {
    this.logger.appendMethod(this.autoScroll).debug('scroll to bottom');
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        let distance = 300;
        let timer = setInterval(() => {
          let scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    this.logger.appendMethod(this.autoScroll).debug('scroll done');
  }

  async goToChapter(url, page) {
    this.logger.appendMethod(this.goToChapter).debug(url);
    await page.goto(url);
  }

  private async getNewPage() {
    if (this.browser === undefined) {
      const puppeteer = require('puppeteer');
      this.browser = await puppeteer.launch();
    }
    return await this.browser.newPage();
  }
}
