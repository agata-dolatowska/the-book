import Verse from "./verse";
import BookData from "./bookdata";

export default class DisplayedPage {
  private readingDirection: string = "forward";
  private pageSize: number;
  private textContainer: HTMLElement;
  private bookData: BookData;

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
    }[];
  }[] = [];
  // currentVersesList: {
  //   bookId: number;
  //   chapterId: number;
  //   text: string;
  // }[] = [];

  currentVerse: Verse;
  beginVerse: Verse = { bookId: 0, chapterId: 0, text: "" };
  endVerse: Verse = { bookId: 0, chapterId: 0, text: "" };

  eloszka: number = 0;
  constructor(kupa: BookData) {
    this.bookData = kupa;
    this.eloszka = 8;
  }

  private init = (() => {
    this.render();
    // document
    //   .querySelector(".previous")
    //   .addEventListener("click", () => this.previousPage());
    // document
    //   .querySelector(".next")
    //   .addEventListener("click", () => this.nextPage());

    this.setPageSize();

    this.textContainer = document.querySelector(".page-text");

    this.setCurrentVerse();

    this.getTableOfContentsData();
    // this.setBibleContents();
    // console.log(this.tableOfContentsData[this.currentVerse.bookId]);
    // this.getChapterVerses(
    //   await bookData.getChapterData(
    //     // this.tableOfContentsData[this.currentVerse.bookId].chapters[this.currentVerse.chapterId]
    //   )
    // );
    this.findBeginningVerseText();
    //await this.fillPage();
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

  getTableOfContentsData() {
    console.log(this.bookData);
    console.log(this.eloszka);
    // this.bookData.getAllBooksNamesWithChapters();
    // console.log(kupa);
    // private setBibleContents() {
    // tableOfContents.getBibleData().then(
    //   x => (this.tableOfContentsData = x)
    // async bibleContent => {
    // this.getChapterVerses(
    //   await bookData.getChapterData(
    //     bibleContent[this.currentVerse.bookId].chapters[
    //       this.currentVerse.chapterId
    //     ].id
    //   )
    // );
    // });
    // );
    // console.log(this.tableOfContentsData);
  }

  getChapterVerses(chapterJSONData: JSON) {
    const chapterDataStr = JSON.stringify(chapterJSONData);
    const chapterDataArr = JSON.parse(chapterDataStr);
    const chapterData = chapterDataArr.data;

    let newChapterText: string[] = chapterData.content.split("</p>");
    let newChapter: {
      bookId: number;
      chapterId: number;
      text: string;
    }[] = [];

    this.addChapterTitle(chapterData);

    for (let i = 0; i < newChapterText.length - 1; i++)
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
    if (this.readingDirection == "forward") {
      this.versesList.push(...newChapter);
    } else {
      this.versesList.unshift(...newChapter);
    }
    // console.log(this.versesList);
  }

  addChapterTitle(chapterData: []) {
    // if (chapterData.number != "intro") {
    //   newChapter.push({
    //     bookId: this.currentVerse.bookId,
    //     chapterId: parseInt(chapterData.number),
    //     text: `<h2>${chapterData.reference}</h2>`
    //   });
    // }
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
        <div class='page'>
          <div class='page-text'></div>
        </div>
        <nav class='page-nav'>
        <button class='previous change-page-btn'>&larr;</button>
        <button class='next change-page-btn'>&rarr;</button>
        </nav>`;
    document.querySelector("main").insertAdjacentHTML("beforeend", html);
  }
}
