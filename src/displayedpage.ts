import Verse from "./verse";
import BookData from "./bookdata";

export default class DisplayedPage {
  private readingDirection: string = "forward";
  private pageSize: number;
  private textContainer: HTMLElement;
  private bookData: BookData;
  private mustClearPage: boolean = true;
  private bibleEnd: boolean = false;

  versesList: {
    bookId: number;
    chapterId: number;
    text: string;
  }[] = [];

  tableOfContentsData: {
    bookId: string;
    bookIdNum: number;
    bookNameLong: string;
    chapters: {
      id: string;
      number: number;
    }[];
  }[] = [];

  currentVerse: Verse;
  beginVerse: Verse = { bookId: 0, chapterId: 0, text: "" };
  endVerse: Verse = { bookId: 0, chapterId: 0, text: "" };

  constructor(bookdata: BookData) {
    this.bookData = bookdata;
  }

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
    //koniec biblii 65, 22
    this.currentVerse = {
      bookId:
        localStorage.getItem("bookId") === null
          ? 0
          : parseInt(localStorage.getItem("bookId")),
      chapterId:
        localStorage.getItem("chapterId") === null
          ? 2
          : parseInt(localStorage.getItem("chapterId")),
      text: ""
    };
  }

  setBeginningVerseText() {
    this.currentVerse.text =
      localStorage.getItem("verseText") === null
        ? ""
        : localStorage.getItem("verseText");
  }

  async firstTextsRender() {
    const tableOfContentsRes = await this.bookData.getAllBooksNamesWithChapters();
    await this.convertTableOfContents(tableOfContentsRes);

    const chapterRes = await this.bookData.getChapterData(
      this.tableOfContentsData[this.currentVerse.bookId].chapters[
        this.currentVerse.chapterId
      ].id
    );
    this.getChapterVerses(chapterRes);

    this.setBeginningVerseText();
    this.fillPage();
  }

  async convertTableOfContents(res: JSON) {
    const bibleDataStr = JSON.stringify(res);
    const bibleDataArr = JSON.parse(bibleDataStr);

    if (this.tableOfContentsData.length == 0) {
      for (let x = 0; x < bibleDataArr.data.length; x++) {
        this.tableOfContentsData.push({
          bookIdNum: x,
          bookId: bibleDataArr.data[x].id,
          bookNameLong: bibleDataArr.data[x].nameLong,
          chapters: bibleDataArr.data[x].chapters
        });
      }
    }
  }

  getChapterVerses(chapterJSONData: JSON) {
    const chapterDataStr = JSON.stringify(chapterJSONData);
    const chapterDataArr = JSON.parse(chapterDataStr);
    const chapterData = chapterDataArr.data;

    const newChapterText: string[] = chapterData.content.split("</p>");
    let newChapter: {
      bookId: number;
      chapterId: number;
      text: string;
    }[] = [];

    if (chapterData.number != "intro") {
      newChapter.push({
        bookId: this.currentVerse.bookId,
        chapterId: parseInt(chapterData.number),
        text: `<h2>${chapterData.reference}</h2>`
      });
    }

    for (let i = 0; i < newChapterText.length - 1; i++) {
      newChapter.push({
        bookId: this.currentVerse.bookId,
        chapterId:
          chapterData.number == "intro" ? 0 : parseInt(chapterData.number),
        text: newChapterText[i] + "</p>"
      });
      if (chapterData.number == "intro") {
        let bookTitle: string = newChapter[0].text.replace(
          '<p class="mt1">',
          "<h1>"
        );
        bookTitle = bookTitle.replace("</p>", "</h1>");
        newChapter[0].text = bookTitle;
      }
    }
    if (this.readingDirection == "forward") {
      this.versesList.push(...newChapter);
    } else {
      this.versesList.unshift(...newChapter);
    }
  }

  private setFirstVerseOnPage() {
    if (this.versesList.length > 1) {
      this.beginVerse.bookId = this.currentVerse.bookId;
      this.beginVerse.chapterId = this.currentVerse.chapterId;
      this.beginVerse.text = this.currentVerse.text;

      // localStorage.setItem("bookId", this.beginVerse.bookId.toString());
      // localStorage.setItem("chapterId", this.beginVerse.chapterId.toString());
      // localStorage.setItem("verseText", this.currentVerse.text);
    }
  }

  private setLastVerseOnPage() {
    this.endVerse.bookId = this.currentVerse.bookId;
    this.endVerse.chapterId = this.currentVerse.chapterId;
    this.endVerse.text = this.currentVerse.text;
  }

  fillPage() {
    if (this.mustClearPage) {
      this.textContainer.innerHTML = "";
    }
    let currentId = this.findBeginningVerseId();
    const currentIdCopy = currentId;

    for (currentId; this.textHeight() < this.pageSize; currentId++) {
      this.currentVerse = {
        bookId: this.versesList[currentId].bookId,
        chapterId: this.versesList[currentId].chapterId,
        text: this.versesList[currentId].text
      };

      if (currentIdCopy == currentId && !this.textContainer.hasChildNodes()) {
        this.setFirstVerseOnPage();
      }

      if (this.reachedChapterEnd()) {
        this.currentVerse.chapterId++;
        this.addNewVerses();
        this.textContainer.insertAdjacentHTML(
          "beforeend",
          `${this.versesList[currentId].text}`
        );
        break;
      }

      if (this.reachedBookEnd()) {
        this.currentVerse.bookId++;
        this.currentVerse.chapterId = 0;
        this.addNewVerses();
        break;
      }

      if (this.reachedBibleEnd()) {
        this.bibleEnd = true;
        break;
      }

      if (this.readingDirection == "forward") {
        this.textContainer.insertAdjacentHTML(
          "beforeend",
          `${this.versesList[currentId].text}`
        );
      } else {
        this.textContainer.insertAdjacentHTML(
          "afterbegin",
          `${this.versesList[currentId].text}`
        );
      }
    }

    if (this.textHeight() > this.pageSize) {
      this.removeExcessText();
    }

    if (this.readingDirection == "forward") {
      this.setLastVerseOnPage();
    } else {
      this.setFirstVerseOnPage();
    }
    // console.log("begin ", this.beginVerse);
    // console.log("end ", this.endVerse);
  }

  fillPageReverse() {
    if (this.mustClearPage) {
      this.textContainer.innerHTML = "";
    }

    let currentId = this.findBeginningVerseId();
    const currentIdCopy = currentId;
    console.log(">>>>>>>>>");
    console.log("begin back ", this.beginVerse);
    console.log("end back ", this.endVerse);

    for (currentId; this.textHeight() < this.pageSize; currentId--) {
      if (currentId != -1) {
        this.currentVerse = {
          bookId: this.versesList[currentId].bookId,
          chapterId: this.versesList[currentId].chapterId,
          text: this.versesList[currentId].text
        };

        if (currentIdCopy == currentId && !this.textContainer.hasChildNodes()) {
          this.setLastVerseOnPage();
        }
      }

      if (this.reachedChapterBeginning()) {
        console.log("początek rozdziału ;-;");
        this.currentVerse.chapterId--;
        this.addNewVerses();
        break;
      }
      // if (this.reachedChapterEnd()) {
      //   this.currentVerse.chapterId++;
      //   this.addNewVerses();
      //   this.textContainer.insertAdjacentHTML(
      //     "beforeend",
      //     `${this.versesList[currentId].text}`
      //   );
      //   break;
      // }

      // if (this.reachedBookEnd()) {
      //   this.currentVerse.bookId++;
      //   this.currentVerse.chapterId = 0;
      //   this.addNewVerses();
      //   break;
      // }

      // if (this.reachedBibleEnd()) {
      //   this.bibleEnd = true;
      //   break;
      // }
      // console.log(this.currentVerse);
      if (this.readingDirection == "forward") {
        this.textContainer.insertAdjacentHTML(
          "beforeend",
          `${this.versesList[currentId].text}`
        );
      } else {
        this.textContainer.insertAdjacentHTML(
          "afterbegin",
          `${this.versesList[currentId].text}`
        );
      }
    }

    if (this.textHeight() > this.pageSize) {
      this.removeExcessText();
    }

    //    if (currentIdCopy == currentId && !this.textContainer.hasChildNodes()) {
    if (!this.textContainer.hasChildNodes()) {
      this.setFirstVerseOnPage();
    }
    // console.log(">>>>>>>>>");
    // console.log("begin back ", this.beginVerse);
    // console.log("end back ", this.endVerse);
  }

  private findBeginningVerseId(): number {
    let startVerseId = 0;
    if (this.endVerse.text != "" && this.readingDirection == "forward") {
      startVerseId =
        this.versesList.findIndex(x => x.text == this.endVerse.text) + 1;
    }
    if (this.beginVerse.text != "" && this.readingDirection == "backward") {
      startVerseId =
        this.versesList.findIndex(x => x.text == this.beginVerse.text) - 1;
    }
    return startVerseId;
  }

  async addNewVerses() {
    const chapterRes = await this.bookData.getChapterData(
      this.tableOfContentsData[this.currentVerse.bookId].chapters[
        this.currentVerse.chapterId
      ].id
    );
    this.getChapterVerses(chapterRes);
    this.mustClearPage = false;
    if (this.readingDirection == "forward") {
      this.fillPage();
    } else {
      this.fillPageReverse();
    }
  }

  private reachedChapterBeginning(): boolean {
    if (
      this.readingDirection == "backward" &&
      this.beginVerse.text == this.versesList[0].text
      // &&
      // this.currentVerse.bookId != 0 && this.currentVerse.chapterId != 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  private reachedChapterEnd(): boolean {
    if (
      this.readingDirection == "forward" &&
      this.currentVerse.text ==
        this.versesList[this.versesList.length - 1].text &&
      this.currentVerse.chapterId !=
        this.tableOfContentsData[this.currentVerse.bookId].chapters[
          this.tableOfContentsData[this.currentVerse.bookId].chapters.length - 1
        ].number
    ) {
      return true;
    } else {
      return false;
    }
  }

  private reachedBookEnd(): boolean {
    const currentChapterVerses = this.versesList.filter(
      x => x.chapterId == this.currentVerse.chapterId
    );

    if (
      this.readingDirection == "forward" &&
      currentChapterVerses[currentChapterVerses.length - 1].text ==
        this.currentVerse.text &&
      this.currentVerse.chapterId ==
        this.tableOfContentsData[this.currentVerse.bookId].chapters.length -
          1 &&
      this.currentVerse.chapterId !=
        this.tableOfContentsData[this.tableOfContentsData.length - 1].chapters
          .length -
          1
    ) {
      return true;
    } else {
      return false;
    }
  }

  private reachedBibleEnd(): boolean {
    const currentChapterVerses = this.versesList.filter(
      x => x.chapterId == this.currentVerse.chapterId
    );
    if (
      this.readingDirection == "forward" &&
      currentChapterVerses[currentChapterVerses.length - 1].text ==
        this.currentVerse.text &&
      this.currentVerse.chapterId ==
        this.tableOfContentsData[this.tableOfContentsData.length - 1].chapters
          .length -
          1
    ) {
      return true;
    } else {
      return false;
    }
  }

  private nextPage() {
    if (!this.bibleEnd) {
      this.readingDirection = "forward";
      this.mustClearPage = true;
      this.fillPage();
    }
  }

  private previousPage() {
    this.bibleEnd = false;
    // if(!this.bibleBegin){
    this.readingDirection = "backward";
    this.mustClearPage = true;
    this.fillPageReverse();
    //}
  }

  private removeExcessText() {
    if (this.readingDirection == "forward") {
      this.textContainer.removeChild(this.textContainer.lastChild);

      const newCurrentVerse = this.textContainer.children[
        this.textContainer.childNodes.length - 1
      ].outerHTML;
      this.currentVerse = {
        bookId: this.versesList.find(x => x.text == newCurrentVerse).bookId,
        chapterId: this.versesList.find(x => x.text == newCurrentVerse)
          .chapterId,
        text: newCurrentVerse
      };
    } else {
      this.textContainer.removeChild(this.textContainer.firstChild);
      const newCurrentVerse = this.textContainer.children[0].outerHTML;
      this.currentVerse = {
        bookId: this.versesList.find(x => x.text == newCurrentVerse).bookId,
        chapterId: this.versesList.find(x => x.text == newCurrentVerse)
          .chapterId,
        text: newCurrentVerse
      };
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
    document.querySelector("body").insertAdjacentHTML("beforeend", html);

    document
      .querySelector(".previous")
      .addEventListener("click", () => this.previousPage());
    document
      .querySelector(".next")
      .addEventListener("click", () => this.nextPage());

    this.setPageSize();

    this.textContainer = document.querySelector(".page-text");

    this.setCurrentVerse();
    this.firstTextsRender();
  }
}
