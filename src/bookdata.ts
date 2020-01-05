export default class BookData {
  private apiUrl: string = "https://api.scripture.api.bible/v1/bibles";
  private apiKey: string;
  private bibleLang: string = "1c9761e0230da6e0-01";

  constructor(configKey: string) {
    this.apiKey = configKey;
  }

  async getAllBooksData(): Promise<any> {
    const allBooksData = await fetch(`${this.apiUrl}/${this.bibleLang}/books`, {
      headers: {
        "api-key": this.apiKey
      }
    });
    return allBooksData.json();
  }

  async getBooksChaptersData(
    currentBook: number,
    booksIdsList: string[]
  ): Promise<any> {
    const booksChaptersData: any = await fetch(
      `${this.apiUrl}/${this.bibleLang}/books/${booksIdsList[currentBook]}/chapters`,
      {
        headers: {
          "api-key": this.apiKey
        }
      }
    );
    return booksChaptersData.json();
  }

  async getChapterData(
    currentChapter: number,
    booksChaptersIdsList: string[]
  ): Promise<any> {
    const chapterVerses: any = await fetch(
      `${this.apiUrl}/${this.bibleLang}/chapters/${booksChaptersIdsList[currentChapter]}`,
      {
        headers: {
          "api-key": this.apiKey
        }
      }
    );
    return chapterVerses.json();
  }
}
