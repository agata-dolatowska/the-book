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
  firstText: string;
  readingDirection: string = "forward";
  textsOnPage: number;
  constructor() {
    this.render();
    this.getAllBookNames();
    document
      .querySelector(".previous")
      .addEventListener("click", () => this.previousPage());
    document
      .querySelector(".next")
      .addEventListener("click", () => this.nextPage());
  }

  previousPage() {
    if (
      document.querySelector(".page-text").firstChild.textContent !=
      this.firstText
    ) {
      document.querySelector(".page-text").innerHTML = "";
      this.readingDirection = "backward";
      this.textsOnPage = document.querySelector(".page-text").children.length;
      this.fillPageReverse();
    }
  }

  nextPage() {
    if (
      !(
        this.currentBook == this.booksList.length - 1 &&
        this.currentChapter == this.chaptersList.length - 1 &&
        this.currentVerse == this.versesList.length
      )
    ) {
      document.querySelector(".page-text").innerHTML = "";
      this.readingDirection = "forward";
      this.fillPage();
    }
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
      let bookTitle: string = this.versesList[0].replace(
        '<p class="mt1">',
        "<h1>"
      );
      bookTitle.replace("</p>", "</h1>");
      if (this.currentChapter == 0) {
        this.firstText = bookTitle.replace("<h1>", "");
      }
      bookTitle = `${bookTitle}`;
      this.versesList[0] = bookTitle;
    } else {
      this.versesList.unshift(`<h2>${chapterRes.data.reference}</h2>`);
    }
    if (this.readingDirection == "forward") {
      this.currentVerse = 0;
      this.fillPage();
    } else {
      this.currentVerse = this.versesList.length - 1;
      this.fillPageReverse();
    }
  }

  fillPage() {
    console.log(this.currentVerse);
    while (
      document.querySelector(".page-text").clientHeight <
        document.querySelector(".page").clientHeight &&
      this.currentVerse <= this.versesList.length - 1 &&
      this.currentChapter <= this.chaptersList.length - 1 &&
      this.currentBook <= this.booksList.length - 1
    ) {
      document
        .querySelector(".page-text")
        .insertAdjacentHTML(
          "beforeend",
          `${this.versesList[this.currentVerse]}`
        );
      this.currentVerse += 1;
      if (
        this.currentVerse == this.versesList.length - 1 &&
        this.currentChapter < this.chaptersList.length - 1
      ) {
        this.currentChapter += 1;
        this.getChapter();
      }

      if (
        this.currentVerse == this.versesList.length - 1 &&
        this.currentChapter == this.chaptersList.length - 1 &&
        this.currentBook < this.booksList.length - 1
      ) {
        this.currentBook += 1;
        this.currentChapter = 0;
        this.getAllChapters();
      }
    }
    if (
      document.querySelector(".page-text").clientHeight >
      document.querySelector(".page").clientHeight
    ) {
      document
        .querySelector(".page-text")
        .removeChild(document.querySelector(".page-text").lastChild);
      if (this.currentVerse > 0) {
        this.currentVerse -= 1;
      }
    }
    console.log(this.currentVerse);
    console.log(">>>>>>>>>");
  }

  fillPageReverse() {
    while (
      document.querySelector(".page-text").clientHeight <
        document.querySelector(".page").clientHeight &&
      this.currentVerse >= 0 &&
      this.currentChapter >= 0 &&
      this.currentBook >= 0
    ) {
      this.currentVerse -= 1;
      // if (
      //   // this.currentVerse == 0 && this.currentChapter!=0
      //   this.currentVerse - this.textsOnPage == 0 &&
      //   document.querySelector(".page-text").firstChild.textContent !=
      //     this.firstText
      // ) {
      //   console.log("dawaj rozdział");
      //   this.currentChapter -= 1;
      //   this.textsOnPage = document.querySelector(".page-text").children.length;
      //   this.getChapter();
      // }

      document
        .querySelector(".page-text")
        .insertAdjacentHTML(
          "afterbegin",
          `${this.versesList[this.currentVerse - this.textsOnPage]}`
        );

      // if (
      //   document.querySelector(".page-text").clientHeight >
      //   document.querySelector(".page").clientHeight
      // ) {
      //   console.log("większe");
      //   document
      //     .querySelector(".page-text")
      //     .removeChild(document.querySelector(".page-text").firstChild);
      //   this.currentVerse += 1;
      // }
      this.textsOnPage = document.querySelector(".page-text").children.length;
    }
  }

  render() {
    const html: string = `
        <div class='page'>
          <div class='page-text'></div>
        </div>
        <button class='previous'>Previous</button>
        <button class='next'>Next</button>
        `;
    document.querySelector("body").insertAdjacentHTML("afterbegin", html);
  }
}
