import { tableOfContents } from "./index";

export default class ReadingProgressBar {
  bibleContents: {
    bookId: string;
    bookIdNum: number;
    bookNameLong: string;
    chapters: {
      id: number;
    }[];
  }[] = [];
  constructor(
    bookContent: {
      bookId: string;
      bookIdNum: number;
      bookNameLong: string;
      chapters: {
        id: number;
      }[];
    }[]
  ) {
    this.bibleContents = bookContent;
  }
  init = (() => {
    this.render();
    this.countAmountOfChapters();
  })();

  countAmountOfChapters() {
    console.log("heloł :3");
    console.log(tableOfContents.bibleContents[0]);
    // console.log(this.bibleContents);
  }

  render() {
    const html: string = `
        <div class="progress-bar-container">
            <div class="progress-bar"></div>
        </div>`;
    document.querySelector(".page-nav").insertAdjacentHTML("afterbegin", html);
  }
}
