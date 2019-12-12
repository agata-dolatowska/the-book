import { config } from ".././config";

export default class Page {
  apiUrl: string = "https://api.scripture.api.bible/v1/bibles";
  bibleLang: string = "1c9761e0230da6e0-01";
  booksList: string[];
  currentBook: number = 0;
  chaptersList: string[];
  currentChapter: number = 0;
  versesList: string[];
  currentVerse: number = 0;
  constructor() {
    this.render();
    this.getAllBookNames();
  }

  async getAllBookNames() {
    const getBook: any = await fetch(`${this.apiUrl}/${this.bibleLang}/books`, {
      headers: {
        "api-key": config.bibleApiKey
      }
    });
    const bookRes: any = await getBook.json();
    this.booksList = bookRes.data.map((el: any) => el.id);
    this.getAllChapters();
  }

  async getAllChapters() {
    const getChapterId: any = await fetch(
      `${this.apiUrl}/${this.bibleLang}/books/${
        this.booksList[this.currentBook]
      }/chapters`,
      {
        headers: {
          "api-key": config.bibleApiKey
        }
      }
    );
    const chapterIdRes: any = await getChapterId.json();
    this.chaptersList = chapterIdRes.data.map((el: any) => el.id);
    this.getChapter();
  }

  async getChapter() {
    const getChapterData: any = await fetch(
      `${this.apiUrl}/${this.bibleLang}/chapters/${
        this.chaptersList[this.currentChapter]
      }`,
      {
        headers: {
          "api-key": config.bibleApiKey
        }
      }
    );
    const chapterRes: any = await getChapterData.json();
    this.versesList = chapterRes.data.content.split("</p>");
    if (chapterRes.data.number == "intro") {
      let bookTitle: string = this.versesList[0].replace('p class="mt1"', "h1");
      bookTitle += "</h1>";
      this.versesList[0] = bookTitle;
    } else {
      this.versesList.unshift(`<h2>${chapterRes.data.reference}</h2>`);
    }
    this.currentVerse = 0;
    this.fillPage();
  }

  fillPage() {
    while (
      document.querySelector(".page-text").clientHeight <
        document.querySelector(".page").clientHeight &&
      this.currentVerse <= this.versesList.length - 1
    ) {
      document
        .querySelector(".page-text")
        .insertAdjacentHTML(
          "beforeend",
          `${this.versesList[this.currentVerse]}</p>`
        );
      this.currentVerse += 1;

      if (this.currentVerse == this.versesList.length - 1) {
        this.currentChapter += 1;
        this.getChapter();
      }
    }
    if (
      document.querySelector(".page-text").clientHeight >
      document.querySelector(".page").clientHeight
    ) {
      document
        .querySelector(".page-text")
        .removeChild(document.querySelector(".page-text").lastChild);
      this.currentVerse -= 1;
    }
  }

  render() {
    const html: string = `
        <div class='page'>
          <div class='page-text'></div>
        </div>
        <button>Previous</button>
        <button>Next</button>
        `;
    document.querySelector("body").insertAdjacentHTML("afterbegin", html);
  }
}
