import { bookData } from "./index";
import { readingProgressBar } from "./index";

export default class DisplayPage {
  private readingDirection: string = "forward";
  private pageSize: number;
  private textContainer: HTMLElement;
  private chapterLength: number;

  booksIdsList: string[];
  booksChaptersIdsList: string[];
  versesList: {
    bookId: number;
    chapterId: number;
    verseId: number;
    text: string;
  }[] = [];
  currentVerse: { [key: string]: number } = {
    bookId: 0,
    chapterId: 0,
    verseId: 0
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

  private init = (async () => {
    this.render();
    document
      .querySelector(".previous")
      .addEventListener("click", () => this.previousPage());
    document
      .querySelector(".next")
      .addEventListener("click", () => this.nextPage());

    this.setPageSize();

    this.textContainer = document.querySelector(".page-text");

    this.setCurrentVerse();
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
    this.findBeginningVerseId();
    await this.fillPage();
  })();

  private setPageSize() {
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
  }

  private setCurrentVerse() {
    this.currentVerse = {
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
  }

  findBeginningVerseId() {
    this.currentVerse.verseId =
      localStorage.getItem("verseText") === null
        ? -1
        : this.versesList.findIndex(
            x => x.text == localStorage.getItem("verseText")
          );
    // ) - 1;
  }

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
    if (this.readingDirection == "forward") {
      this.versesList.push(...newChapter);
    } else {
      this.chapterLength = newChapter.length;
      this.versesList.unshift(...newChapter);
    }
  }

  limitVersesList() {
    const uniqueChapters: number[] = Array.from(
      new Set(this.versesList.map(x => x.chapterId))
    );
    //to 2 zmienić potem kupa
    if (uniqueChapters.length == 2) {
      this.deleteChapter(uniqueChapters);
    }
  }

  deleteChapter(uniqueChapters: number[]) {
    //kupa
    // console.log(uniqueChapters[uniqueChapters.length - 1]);
    // console.log(this.currentVerse.chapterId);
    if (
      uniqueChapters[uniqueChapters.length - 1] == this.currentVerse.chapterId
    ) {
      const chapterVerses = this.versesList.filter(
        x => x.chapterId == uniqueChapters[0]
      );
      this.versesList.splice(0, chapterVerses.length);
    }

    // if (uniqueChapters[0] == this.currentVerse.chapterId) {
    //   const chapterVerses = this.versesList.filter(
    //     x => x.chapterId == uniqueChapters.length - 1
    //   );
    //   this.versesList.splice(
    //     this.versesList.length - 1 - chapterVerses.length - 1,
    //     chapterVerses.length
    //   );
    // }
  }

  private setFirstVerseOnPage() {
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

    localStorage.setItem("bookId", this.beginVerse.bookId.toString());
    localStorage.setItem("chapterId", this.beginVerse.chapterId.toString());
    if (this.beginVerse.verseId > 0) {
      localStorage.setItem(
        "verseText",
        this.versesList[this.beginVerse.verseId].text
      );
    }
  }

  private setLastVerseOnPage() {
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

  private nextPage() {
    this.readingDirection = "forward";
    this.currentVerse = this.endVerse;
    this.fillPage();
  }

  private previousPage() {
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
    while (this.canFillPage() && this.textHeight() < this.pageSize) {
      if (this.reachedChapterBeginning()) {
        console.log("początek rozdziałuuuu");
        this.currentVerse.chapterId = this.beginVerse.chapterId - 1;
        this.getChapterVerses(
          await bookData.getChapterData(
            this.booksChaptersIdsList[this.currentVerse.chapterId]
          )
        );
        this.currentVerse.verseId += this.chapterLength - 1;
      }

      if (this.reachedChapterEnd()) {
        // this.currentVerse.chapterId += 1;
        this.getChapterVerses(
          await bookData.getChapterData(
            this.booksChaptersIdsList[this.currentVerse.chapterId + 1]
          )
        );
      }

      if (this.reachedBookBeginning()) {
        console.log("początek księgi ELO!");
      }

      if (this.reachedBookEnd()) {
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
      // this.limitVersesList();
    }

    if (this.textHeight() > this.pageSize) {
      this.removeExcessText();
    }

    if (this.readingDirection == "forward") {
      this.setLastVerseOnPage();
    } else {
      this.setFirstVerseOnPage();
    }
    readingProgressBar.countCurrentChapterNumber();
  }

  private reachedChapterEnd(): boolean {
    const lastVerseId = this.versesList[this.versesList.length - 1].chapterId;
    const firstVerseIdOfCurrentChapter = this.versesList.find(
      x => x.chapterId == lastVerseId
    ).verseId;
    // console.log(firstVerseIdOfCurrentChapter);
    // console.log(this.currentVerse.verseId);
    if (
      this.readingDirection == "forward" &&
      this.currentVerse.verseId == this.versesList.length - 1 &&
      this.currentVerse.chapterId < this.booksChaptersIdsList.length - 1

      // this.readingDirection == "forward" &&
      // this.currentVerse.verseId == firstVerseIdOfCurrentChapter &&
      // this.currentVerse.chapterId < this.booksChaptersIdsList.length - 1
    ) {
      return true;
    } else {
      return false;
    }
  }

  private reachedChapterBeginning(): boolean {
    if (
      this.readingDirection == "backward" &&
      // this.beginVerse.verseId <= 1 &&
      this.beginVerse.verseId == 0 &&
      this.beginVerse.chapterId > 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  private reachedBookBeginning(): boolean {
    if (this.readingDirection == "backward" && this.beginVerse.chapterId == 0) {
      return true;
    } else {
      return false;
    }
  }

  private reachedBookEnd(): boolean {
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

  private canFillPage(): boolean {
    if (this.readingDirection == "forward") {
      if (
        // this.currentVerse.verseId <= this.versesList.length - 1 &&
        // this.currentVerse.chapterId <= this.booksChaptersIdsList.length - 1 &&
        // this.currentVerse.bookId <= this.booksIdsList.length - 1
        this.currentVerse.verseId == this.versesList.length - 1 &&
        this.currentVerse.chapterId == this.booksChaptersIdsList.length - 1 &&
        this.currentVerse.bookId == this.booksIdsList.length - 1
      ) {
        return false;
      } else {
        return true;
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

  private addTextToHtml() {
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

  private removeExcessText() {
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

  private textHeight(): number {
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

  private render() {
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
