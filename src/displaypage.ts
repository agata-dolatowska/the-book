import { bookData } from "./index";

export default class DisplayPage {
  readingDirection: string = "forward";
  pageSize: number;
  textContainer: HTMLElement;

  booksIdsList: string[];
  booksChaptersIdsList: string[];
  versesList: {
    bookId: number;
    chapterId: number;
    verseId: number;
    text: string;
  }[] = [];
  currentVerse: { [key: string]: number } = {
    bookId:
      localStorage.getItem("bookId") === null
        ? 0
        : parseInt(localStorage.getItem("bookId")),
    chapterId:
      localStorage.getItem("chapterId") === null
        ? 0
        : parseInt(localStorage.getItem("chapterId")),
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

  init = (async () => {
    this.render();
    document
      .querySelector(".previous")
      .addEventListener("click", () => this.previousPage());
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
    this.getAllBooksIds(await bookData.getAllBooksData());

    this.getAllChaptersIds(
      await bookData.getBooksChaptersData(
        this.booksIdsList[this.currentVerse.bookId]
      )
    );
    this.getChapterVerses(
      await bookData.getChapterData(
        this.booksChaptersIdsList[this.currentVerse.chapterId]
      )
    );
    this.currentVerse.verseId =
      localStorage.getItem("verseText") === null
        ? -1
        : this.versesList.findIndex(
            x => x.text == localStorage.getItem("verseText")
          ) - 1;
    await this.fillPage();
  })();

  getAllBooksIds(allBooksData: any) {
    this.booksIdsList = allBooksData.data.map((el: any) => el.id);
  }

  getAllChaptersIds(allBooksChaptersData: any) {
    this.booksChaptersIdsList = allBooksChaptersData.data.map(
      (el: any) => el.id
    );
  }

  getChapterVerses(chapterData: any) {
    let newChapterText: string[] = chapterData.data.content.split("</p>");
    let newChapter: {
      bookId: number;
      chapterId: number;
      verseId: number;
      text: string;
    }[] = [];

    if (chapterData.data.number != "intro") {
      newChapter.push({
        bookId: this.currentVerse.bookId,
        chapterId: this.currentVerse.chapterId,
        verseId: this.versesList.length,
        text: `<h2>${chapterData.data.reference}</h2>`
      });
    }
    for (let i = 0; i < newChapterText.length - 1; i++)
      newChapter.push({
        bookId: this.currentVerse.bookId,
        chapterId: this.currentVerse.chapterId,
        verseId: i + this.versesList.length + 1,
        text: newChapterText[i] + "</p>"
      });
    if (chapterData.data.number == "intro") {
      let bookTitle: string = newChapter[0].text.replace(
        '<p class="mt1">',
        "<h1>"
      );
      bookTitle = bookTitle.replace("</p>", "</h1>");
      newChapter[0].text = bookTitle;
    }
    this.versesList.push(...newChapter);
  }

  setFirstVerseOnPage() {
    let kupa = 0;
    if (this.readingDirection == "forward") {
      kupa = 1;
    }
    if (this.versesList.length > 1) {
      this.beginVerse.bookId = this.versesList[
        this.currentVerse.verseId + kupa
      ].bookId;
      this.beginVerse.chapterId = this.versesList[
        this.currentVerse.verseId + kupa
      ].chapterId;
      this.beginVerse.verseId = this.versesList[
        this.currentVerse.verseId + kupa
      ].verseId;
    } else {
      this.beginVerse.bookId = 0;
      this.beginVerse.chapterId = 0;
      this.beginVerse.verseId = 0;
    }
    localStorage.setItem("bookId", this.currentVerse.bookId.toString());
    localStorage.setItem("chapterId", this.currentVerse.chapterId.toString());
    if (this.currentVerse.verseId > 0) {
      localStorage.setItem(
        "verseText",
        this.versesList[this.currentVerse.verseId + kupa].text
      );
    }
  }

  setLastVerseOnPage() {
    // this.endVerse.bookId = this.currentVerse.bookId;
    // this.endVerse.chapterId = this.currentVerse.chapterId;
    // this.endVerse.verseId = this.currentVerse.verseId;
    let kupa = 0;
    if (this.readingDirection == "backward") {
      kupa = -1;
    }
    this.endVerse.bookId = this.versesList[
      this.currentVerse.verseId + kupa
    ].bookId;
    this.endVerse.chapterId = this.versesList[
      this.currentVerse.verseId + kupa
    ].chapterId;
    this.endVerse.verseId = this.versesList[
      this.currentVerse.verseId + kupa
    ].verseId;
  }

  nextPage() {
    this.readingDirection = "forward";
    this.currentVerse = this.endVerse;
    this.fillPage();
  }

  previousPage() {
    this.readingDirection = "backward";
    this.currentVerse = this.beginVerse;
    this.fillPage();
  }

  async fillPage() {
    if (this.canFillPage()) {
      this.textContainer.innerHTML = "";
      if (this.readingDirection == "forward") {
        this.setFirstVerseOnPage();
      } else {
        this.setLastVerseOnPage();
      }
    }

    while (this.canFillPage() == true && this.textHeight() < this.pageSize) {
      if (this.reachedChapterBeginning() == true) {
      }

      if (this.reachedChapterEnd() == true) {
        this.currentVerse.chapterId += 1;
        this.getChapterVerses(
          await bookData.getChapterData(
            this.booksChaptersIdsList[this.currentVerse.chapterId]
          )
        );
      }

      if (this.reachedBookEnd() == true) {
        this.currentVerse.bookId += 1;
        this.currentVerse.chapterId = 0;
        this.getAllChaptersIds(
          await bookData.getBooksChaptersData(
            this.booksIdsList[this.currentVerse.bookId]
          )
        );
        this.getChapterVerses(
          await bookData.getChapterData(
            this.booksChaptersIdsList[this.currentVerse.chapterId]
          )
        );
      }

      this.addTextToHtml();
    }
    if (this.textHeight() > this.pageSize) {
      this.removeExcessText();
    }

    if (this.readingDirection == "forward") {
      this.setLastVerseOnPage();
    } else {
      this.setFirstVerseOnPage();
    }
  }

  reachedChapterEnd(): boolean {
    if (
      this.readingDirection == "forward" &&
      this.currentVerse.verseId == this.versesList.length - 1 &&
      this.currentVerse.chapterId < this.booksChaptersIdsList.length - 1
    ) {
      return true;
    } else {
      return false;
    }
  }

  reachedChapterBeginning(): boolean {
    if (this.readingDirection == "backward") {
      return true;
    } else {
      return false;
    }
  }

  reachedBookEnd(): boolean {
    if (
      this.readingDirection == "forward" &&
      this.currentVerse.verseId == this.versesList.length - 1 &&
      this.currentVerse.chapterId == this.booksChaptersIdsList.length - 1 &&
      this.currentVerse.bookId < this.booksIdsList.length - 1
    ) {
      return true;
    } else {
      return false;
    }
  }

  canFillPage(): boolean {
    if (this.readingDirection == "forward") {
      if (
        this.currentVerse.verseId <= this.versesList.length - 1 &&
        this.currentVerse.chapterId <= this.booksChaptersIdsList.length - 1 &&
        this.currentVerse.bookId <= this.booksIdsList.length - 1
      ) {
        return true;
      } else {
        return false;
      }
    }
    if (this.readingDirection == "backward") {
      if (this.currentVerse.verseId > 0) {
        return true;
      } else {
        return false;
      }
    }
  }

  addTextToHtml() {
    if (this.readingDirection == "forward") {
      this.currentVerse.verseId += 1;
      this.textContainer.insertAdjacentHTML(
        "beforeend",
        `${this.versesList[this.currentVerse.verseId].text}`
      );
    } else {
      this.currentVerse.verseId -= 1;
      this.textContainer.insertAdjacentHTML(
        "afterbegin",
        `${this.versesList[this.currentVerse.verseId].text}`
      );
    }
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
