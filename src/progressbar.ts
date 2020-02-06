import { tableOfContents, displayedPage } from "./index";

export default class ReadingProgressBar {
  bibleContents: {
    bookId: string;
    bookIdNum: number;
    bookNameLong: string;
    chapters: {
      id: number;
    }[];
  }[] = [];

  private amountOfChapters: number = 0;
  private currentChapterNumber: number = 0;

  private init = (() => {
    this.render();
    // this.countAmountOfChapters();
  })();

  // private countAmountOfChapters() {
  //   tableOfContents.getBibleData().then(bibleContent => {
  //     this.bibleContents = bibleContent;
  //     for (let x of bibleContent) {
  //       this.amountOfChapters += x.chapters.length;
  //     }
  //   });
  //   // console.log(this.bibleContents);
  // }

  countCurrentChapterNumber() {
    this.currentChapterNumber = 0;

    for (let x = 0; x < this.bibleContents.length; x++) {
      for (let y = 0; y < this.bibleContents[x].chapters.length; y++) {
        if (
          x == displayedPage.currentVerse.bookId &&
          y == displayedPage.currentVerse.chapterId
        ) {
          x = this.bibleContents.length - 1;
          y =
            this.bibleContents[this.bibleContents.length - 1].chapters.length -
            1;
        } else {
          this.currentChapterNumber += 1;
        }
      }
    }
    this.setProgressBarWidth();
  }

  private setProgressBarWidth() {
    const progressBar: HTMLElement = document.querySelector(".progress-bar");
    const witdh: string = (
      (this.currentChapterNumber / this.amountOfChapters) *
      100
    ).toFixed();
    progressBar.style.setProperty("--progressBarWidth", witdh + "%");
  }

  private render() {
    const html: string = `
        <div class="progress-bar-container">
            <div class="progress-bar"></div>
        </div>`;
    document.querySelector(".page-nav").insertAdjacentHTML("afterbegin", html);
  }
}
