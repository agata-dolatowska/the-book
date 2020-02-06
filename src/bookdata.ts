export default class BookData {
  private apiUrl: string = "https://api.scripture.api.bible/v1/bibles";
  private apiKey: string;
  private bibleLang: string = "1c9761e0230da6e0-01";

  constructor(configKey: string) {
    this.apiKey = configKey;
  }

  // async getAllBooksData(): Promise<JSON> {
  //   const allBooksData: Response = await fetch(
  //     `${this.apiUrl}/${this.bibleLang}/books`,
  //     {
  //       headers: {
  //         "api-key": this.apiKey
  //       }
  //     }
  //   );
  //   return allBooksData.json();
  // }

  // async getBooksChaptersData(bookId: string): Promise<JSON> {
  //   const booksChaptersData: Response = await fetch(
  //     `${this.apiUrl}/${this.bibleLang}/books/${bookId}/chapters`,
  //     {
  //       headers: {
  //         "api-key": this.apiKey
  //       }
  //     }
  //   );
  //   return booksChaptersData.json();
  // }

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
    const bibleContents: Response = await fetch(
      `${this.apiUrl}/${this.bibleLang}/books?include-chapters=true`,
      {
        headers: {
          "api-key": this.apiKey
        }
      }
    );

    return bibleContents.json();
  }
}
