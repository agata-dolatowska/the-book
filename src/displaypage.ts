import { bookData } from "./index";
import { readingProgressBar } from "./index";

export default class DisplayPage {
  private readingDirection: string = "forward";
  private pageSize: number;
  private textContainer: HTMLElement;

  booksIdsList: string[];
  booksChaptersIdsList: string[];

  versesList: {
    bookId: number;
    chapterId: number;
    text: string;
  }[] = [];

  currentVersesList: {
    bookId: number;
    chapterId: number;
    text: string;
  }[] = [];

  currentVerse: {
    bookId: number;
    chapterId: number;
    text: string;
  };
  beginVerse: {
    bookId: number;
    chapterId: number;
    text: string;
  } = { bookId: 0, chapterId: 0, text: "" };
  endVerse: {
    bookId: number;
    chapterId: number;
    text: string;
  } = { bookId: 0, chapterId: 0, text: "" };

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
    this.findBeginningVerseText();
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
    //koniec biblii 65, 22
    this.currentVerse = {
      bookId:
        localStorage.getItem("bookId") === null
          ? 0
          : parseInt(localStorage.getItem("bookId")),
      chapterId:
        localStorage.getItem("chapterId") === null
          ? 3
          : parseInt(localStorage.getItem("chapterId")),
      text: ""
    };
  }

  findBeginningVerseText() {
    this.currentVerse.text =
      localStorage.getItem("verseText") === null
        ? ""
        : localStorage.getItem("verseText");
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
      text: string;
    }[] = [];

    if (chapterData.data.number != "intro") {
      newChapter.push({
        bookId: this.currentVerse.bookId,
        chapterId: parseInt(chapterData.data.number),
        text: `<h2>${chapterData.data.reference}</h2>`
      });
    }
    for (let i = 0; i < newChapterText.length - 1; i++)
      newChapter.push({
        bookId: this.currentVerse.bookId,
        chapterId:
          chapterData.data.number == "intro"
            ? 0
            : parseInt(chapterData.data.number),
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
    }

    this.findBeginningVerse();

    if (this.readingDirection == "forward") {
      this.setFirstVerseOnPage();
    } else {
      this.setLastVerseOnPage();
    }

    for (let x of this.currentVersesList) {
      this.currentVerse = {
        bookId: x.bookId,
        chapterId: x.chapterId,
        text: x.text
      };
      if (this.textHeight() < this.pageSize) {
        // if (this.reachedChapterBeginning()) {
        // this.currentVerse.chapterId = this.beginVerse.chapterId - 1;
        // this.getChapterVerses(
        //   await bookData.getChapterData(
        //     this.booksChaptersIdsList[this.currentVerse.chapterId]
        //   )
        // );
        // this.currentVerse.text += this.chapterLength - 1;

        // }

        if (this.reachedChapterEnd()) {
          this.getChapterVerses(
            await bookData.getChapterData(
              this.booksChaptersIdsList[this.currentVerse.chapterId + 1]
            )
          );
          this.currentVersesList = this.versesList;
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
          this.currentVersesList = this.versesList;
        }

        if ((this.readingDirection = "forward")) {
          this.textContainer.insertAdjacentHTML("beforeend", `${x.text}`);
        } else {
          this.textContainer.insertAdjacentHTML("afterbegin", `${x.text}`);
        }
      } else {
        break;
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
    console.log(this.beginVerse);
    console.log(this.endVerse);
    console.log(">>>>>>>>>>>>>>>>>>>>>");
    // readingProgressBar.countCurrentChapterNumber();
  }

  private findBeginningVerse() {
    this.currentVersesList = this.versesList;

    if (this.readingDirection == "forward") {
      let beginningVerseId: number = 0;

      if (this.endVerse.text != "") {
        beginningVerseId =
          this.currentVersesList.findIndex(x => x.text === this.endVerse.text) +
          1;
        this.currentVersesList = this.currentVersesList.slice(
          beginningVerseId,
          this.currentVersesList.length - 1
        );
      }
    } else {
      let beginningVerseId: number = 0;

      if (this.endVerse.text != "") {
        beginningVerseId = this.versesList.findIndex(
          x => x.text === this.beginVerse.text
        );
        this.currentVersesList = this.currentVersesList
          .splice(0, beginningVerseId + 1)
          .reverse();
        console.log(this.currentVersesList);
      }
    }
  }

  private reachedChapterBeginning(): boolean {
    if (
      this.readingDirection == "backward"
      //&&
      // this.checkIfFirstVerseInChapter()
    ) {
      return true;
    } else {
      return false;
    }
  }

  private reachedChapterEnd(): boolean {
    if (
      this.readingDirection == "forward" &&
      this.checkIfLastVerseInChapter() &&
      this.currentVerse.chapterId < this.booksChaptersIdsList.length - 1
    ) {
      return true;
    } else {
      return false;
    }
  }

  private reachedBookEnd(): boolean {
    if (
      this.readingDirection == "forward" &&
      this.checkIfLastVerseInChapter() &&
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
        !this.checkIfLastVerseInChapter() &&
        this.currentVerse.chapterId <= this.booksChaptersIdsList.length - 1 &&
        this.currentVerse.bookId <= this.booksIdsList.length - 1
      ) {
        return true;
      } else {
        return false;
      }
    }

    if (this.readingDirection == "backward") {
      //   if (this.currentVerse.text > 0) {
      return true;
      //   } else {
      //     return false;
      //   }
    }
  }

  checkIfFirstVerseInChapter(): boolean {
    const currentChapter = this.versesList.filter(
      x => x.chapterId == this.currentVerse.chapterId
    );
    if (currentChapter[0].text == this.beginVerse.text) {
      return true;
    } else {
      return false;
    }
  }

  checkIfLastVerseInChapter(): boolean {
    const currentChapter = this.versesList.filter(
      x => x.chapterId == this.currentVerse.chapterId
    );

    if (
      currentChapter[currentChapter.length - 1].text == this.currentVerse.text
    ) {
      return true;
    } else {
      return false;
    }
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
      this.currentVerse.text += 1;
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
