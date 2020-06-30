import ChapterModel from "./chapter.model";

export class MangaModel {
    urlBase64!: string;
    cover!: string;
    title!: string;
    images?: string[];
    nextChapter?: ChapterModel;

    constructor(urlBase64: string, cover: string, title: string, images = undefined, nextChapter = undefined) {
        this.urlBase64 = urlBase64;
        this.cover = cover;
        this.title = title;
        this.images = images;
        this.nextChapter = nextChapter;
    }
}