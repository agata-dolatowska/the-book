export default class BookData {
  private apiUrl: string = "https://api.scripture.api.bible/v1/bibles";
  private apiKey: string;
  private bibleLang: string = "1c9761e0230da6e0-01";
  private tableOfContentsCache: JSON;

  constructor(configKey: string) {
    this.apiKey = configKey;
  }

  async getChapterData(chapterId: string): Promise<JSON> {
    const chapterVerses: Response = await fetch(
      `${this.apiUrl}/${this.bibleLang}/chapters/${chapterId}`,
      {
        headers: {
          "api-key": this.apiKey
        }
      }
    );
    return chapterVerses.json();
  }

  async getAllBooksNamesWithChapters(): Promise<JSON> {
    if (this.tableOfContentsCache == undefined) {
      this.tableOfContentsCache = await fetch(
        `${this.apiUrl}/${this.bibleLang}/books?include-chapters=true`,
        {
          headers: {
            "api-key": this.apiKey
          }
        }
      ).then(res => res.json());
    }
    return this.tableOfContentsCache;
  }
}
