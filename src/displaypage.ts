import { bookData } from "./index";

export default class DisplayPage {
  readingDirection: string = "forward";
  pageSize: number;
  textContainer: HTMLElement;

  booksIdsList: string[];
  booksChaptersIdsList: string[];
  versesList: string[];

  // currentBook: number = 0;
  // 49
  currentChapter: number = 0;
  // currentVerse: number = 0;

  currentVerse: { [key: string]: number } = {
    bookId: 0,
    chapterId: 0,
    verseId: -1
  };
  beginVerse: { [key: string]: number } = {
    bookId: 0,
    chapterId: 0,
    verseId: 0
  };
  endVerse: { [key: string]: number } = {
    bookId: 0,
    chapterId: 0,
    verseId: 0
  };

  constructor() {
    this.render();
    document
      .querySelector(".previous")
      .addEventListener("click", () => this.fillPageReverse());
    document
      .querySelector(".next")
      .addEventListener("click", () => this.nextPage());
    this.pageSize =
      document.querySelector(".page").clientHeight -
      parseInt(
        window
          .getComputedStyle(document.querySelector(".page"), null)
          .getPropertyValue("padding-top")
      ) -
      parseInt(
        window
          .getComputedStyle(document.querySelector(".page"), null)
          .getPropertyValue("padding-bottom")
      );
    this.textContainer = document.querySelector(".page-text");
    this.init();
  }

  async init() {
    this.getAllBooksIds(await bookData.getAllBooksData());

    this.getAllChaptersIds(
      await bookData.getBooksChaptersData(
        this.currentVerse.bookId,
        this.booksIdsList
      )
    );
    this.getChapterVerses(
      await bookData.getChapterData(
        this.currentChapter,
        this.booksChaptersIdsList
      )
    );
    await this.fillPage();
  }

  getAllBooksIds(allBooksData: any) {
    this.booksIdsList = allBooksData.data.map((el: any) => el.id);
  }

  getAllChaptersIds(allBooksChaptersData: any) {
    this.booksChaptersIdsList = allBooksChaptersData.data.map(
      (el: any) => el.id
    );
    // this.booksChaptersNamesList = chapterIdRes.data.map(
    //   (el: any) => el.reference
    // );
  }

  getChapterVerses(chapterData: any) {
    this.versesList = chapterData.data.content.split("</p>");
    if (chapterData.data.number == "intro") {
      let bookTitle: string = this.versesList[0].replace(
        '<p class="mt1">',
        "<h1>"
      );

      bookTitle.replace("</p>", "</h1>");

      this.versesList[0] = bookTitle;
    } else {
      this.versesList.unshift(`<h2>${chapterData.data.reference}</h2>`);
    }
    if (this.readingDirection == "forward") {
      this.currentVerse.verseId = 0;
    } else {
      this.currentVerse.verseId = this.versesList.length - 1;
    }
  }

  setFirstVerseOnPage() {
    this.beginVerse.bookId = this.currentVerse.bookId;
    this.beginVerse.chapterId = this.currentChapter;
    this.beginVerse.verseId = this.currentVerse.verseId;
  }

  setLastVerseOnPage() {
    this.endVerse.bookId = this.currentVerse.bookId;
    this.endVerse.chapterId = this.currentChapter;
    this.endVerse.verseId = this.currentVerse.verseId;
  }

  async fillPage() {
    this.textContainer.innerHTML = "";
    this.setFirstVerseOnPage();
    while (this.canFillPage() == true) {
      if (
        this.currentVerse.verseId == this.versesList.length - 1 &&
        this.currentChapter < this.booksChaptersIdsList.length - 1
      ) {
        this.currentChapter += 1;
        this.getChapterVerses(
          await bookData.getChapterData(
            this.currentChapter,
            this.booksChaptersIdsList
          )
        );
      }

      if (
        this.currentVerse.verseId == this.versesList.length - 1 &&
        this.currentChapter == this.booksChaptersIdsList.length - 1 &&
        this.currentVerse.bookId < this.booksIdsList.length - 1
      ) {
        this.currentVerse.bookId += 1;
        this.currentChapter = 0;
        this.getAllChaptersIds(
          await bookData.getBooksChaptersData(
            this.currentVerse.bookId,
            this.booksIdsList
          )
        );
        this.getChapterVerses(
          await bookData.getChapterData(
            this.currentChapter,
            this.booksChaptersIdsList
          )
        );
      }
      this.addTextToHtml();
    }
    if (this.textHeight() > this.pageSize) {
      this.removeExcessText();
    }
    this.setLastVerseOnPage();

    console.log(
      `begin book - ${this.beginVerse.bookId} chapter - ${this.beginVerse.chapterId} verse - ${this.beginVerse.verseId}`
    );
    console.log(
      `end book - ${this.endVerse.bookId} chapter - ${this.endVerse.chapterId} verse - ${this.endVerse.verseId}`
    );
    console.log(
      `current book - ${this.currentVerse.bookId} chapter - ${this.currentVerse.chapterId} verse - ${this.currentVerse.verseId}`
    );
  }

  nextPage() {
    this.readingDirection = "forward";
    this.fillPage();
  }

  async fillPageReverse() {
    if (this.canFillPageReverse() == true) {
      this.textContainer.innerHTML = "";
      this.setLastVerseOnPage();
      this.currentVerse.verseId = this.beginVerse.verseId;
      console.log("halo :3");
    }

    while (
      this.canFillPageReverse() == true &&
      this.textHeight() < this.pageSize
    ) {
      console.log("reverse >>>>>>>>>>>>>");
      console.log("begin " + this.beginVerse.verseId);
      console.log("current " + this.currentVerse.verseId);
      console.log("end " + this.endVerse.verseId);

      this.addTextToHTMLReverse();
    }
    if (this.textHeight() > this.pageSize) {
      this.removeExcessText();
      this.currentVerse.verseId++;
    }
    this.setFirstVerseOnPage();
  }

  canFillPage(): boolean {
    if (
      this.textHeight() < this.pageSize &&
      this.currentVerse.verseId <= this.versesList.length - 1 &&
      this.currentChapter <= this.booksChaptersIdsList.length - 1 &&
      this.currentVerse.bookId <= this.booksIdsList.length - 1
    ) {
      return true;
    } else {
      return false;
    }
  }

  textHeight(): number {
    if (this.textContainer.hasChildNodes()) {
      const textNodes: HTMLElement[] = Array.from(
        document.querySelectorAll(".page-text >*")
      );
      const textTopMargins: number[] = textNodes.map(x =>
        parseInt(window.getComputedStyle(x).marginTop.replace("px", ""))
      );
      const textBottomMargins: number[] = textNodes.map(x =>
        parseInt(window.getComputedStyle(x).marginBottom.replace("px", ""))
      );
      const textHeights: number[] = textNodes.map(x =>
        parseInt(window.getComputedStyle(x).height.replace("px", ""))
      );
      const allTextHeights: number[] = [
        ...textBottomMargins,
        ...textTopMargins,
        ...textHeights
      ];
      if (allTextHeights.length > 0) {
        const pageTextHeight = allTextHeights.reduce((x, y) => x + y);
        return pageTextHeight;
      }
    } else {
      return 0;
    }
  }

  addTextToHtml() {
    this.textContainer.insertAdjacentHTML(
      "beforeend",
      `${this.versesList[this.currentVerse.verseId]}`
    );
    this.currentVerse.verseId += 1;
  }

  canFillPageReverse(): boolean {
    if (
      this.currentVerse.verseId >= 0 &&
      this.currentVerse.chapterId >= 0 &&
      this.currentVerse.bookId >= 0
      // !(
      //   this.beginVerse.verseId == 0 &&
      //   this.beginVerse.chapterId == 0 &&
      //   this.beginVerse.bookId == 0
      // )
    ) {
      return true;
    } else {
      return false;
    }
  }

  addTextToHTMLReverse() {
    // console.log(this.beginVerse.verseId);

    this.currentVerse.verseId -= 1;
    this.textContainer.insertAdjacentHTML(
      "afterbegin",
      `${this.versesList[this.currentVerse.verseId]}`
    );
  }

  removeExcessText() {
    if (this.readingDirection == "forward") {
      this.textContainer.removeChild(this.textContainer.lastChild);
      if (this.currentVerse.verseId > 0) {
        this.currentVerse.verseId -= 1;
      }
    } else {
      this.textContainer.removeChild(this.textContainer.firstChild);
      this.currentVerse.verseId += 1;
    }
  }

  render() {
    const html: string = `
    <main class='container'>
        <div class='page'>
          <div class='page-text'></div>
        </div>
        <nav class='page-nav'>
        <button class='previous change-page-btn'>&larr;</button>
        <button class='next change-page-btn'>&rarr;</button>
        </nav>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", html);
  }
}
