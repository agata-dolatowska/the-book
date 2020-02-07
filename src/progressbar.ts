// import { tableOfContents, displayedPage } from "./index";
// import BookData from "./bookdata";

export default class ReadingProgressBar {
  //   tableOfContentsData: {
  //     bookId: string;
  //     bookIdNum: number;
  //     bookNameLong: string;
  //     chapters: {
  //       id: number;
  //     }[];
  //   }[] = [];
  //   private amountOfChapters: number = 0;
  //   private currentChapterNumber: number = 0;
  //   private bookData: BookData;
  //   constructor(tableOfContentsData: BookData) {
  //     // this.tableOfContentsData = tableOfContentsData;
  //   }
  //   private init = (() => {
  //     this.render();
  //     // this.countAmountOfChapters();
  //   })();
  //   // private countAmountOfChapters() {
  //   //   tableOfContents.getBibleData().then(bibleContent => {
  //   //     this.tableOfContentsData = bibleContent;
  //   //     for (let x of bibleContent) {
  //   //       this.amountOfChapters += x.chapters.length;
  //   //     }
  //   //   });
  //   //   // console.log(this.tableOfContentsData);
  //   // }
  //   countCurrentChapterNumber() {
  //     this.currentChapterNumber = 0;
  //     for (let x = 0; x < this.tableOfContentsData.length; x++) {
  //       for (let y = 0; y < this.tableOfContentsData[x].chapters.length; y++) {
  //         if (
  //           x == displayedPage.currentVerse.bookId &&
  //           y == displayedPage.currentVerse.chapterId
  //         ) {
  //           x = this.tableOfContentsData.length - 1;
  //           y =
  //             this.tableOfContentsData[this.tableOfContentsData.length - 1]
  //               .chapters.length - 1;
  //         } else {
  //           this.currentChapterNumber += 1;
  //         }
  //       }
  //     }
  //     this.setProgressBarWidth();
  //   }
  //   private setProgressBarWidth() {
  //     const progressBar: HTMLElement = document.querySelector(".progress-bar");
  //     const witdh: string = (
  //       (this.currentChapterNumber / this.amountOfChapters) *
  //       100
  //     ).toFixed();
  //     progressBar.style.setProperty("--progressBarWidth", witdh + "%");
  //   }
  //   private render() {
  //     const html: string = `
  //         <div class="progress-bar-container">
  //             <div class="progress-bar"></div>
  //         </div>`;
  //     document.querySelector(".page-nav").insertAdjacentHTML("afterbegin", html);
  //   }
}
