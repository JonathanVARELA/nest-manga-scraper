export default class ChapterModel {
    urlBase64!: string;
    cover!: string;
    title!: string;
    images!: string[];

    constructor(urlBase64: string, cover: string, title: string, images: string[]) {
        this.urlBase64 = urlBase64;
        this.cover = cover;
        this.title = title;
        this.images = images;
    }
}