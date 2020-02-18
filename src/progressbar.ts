import BookData from "./bookdata";
import TableOfContentsData from "./tableOfContentsData";
import DisplayedPage from "./displayedpage";

export default class ReadingProgressBar {
  private tableOfContentsData: TableOfContentsData;
  private bookData: BookData;
  private displayedPage: DisplayedPage;
  private amountOfChapters: number = 0;
  private currentChapterNumber: number = 0;

  constructor(
    bookData: BookData,
    tableOfContentsData: TableOfContentsData,
    displayedPage: DisplayedPage
  ) {
    this.bookData = bookData;
    this.tableOfContentsData = tableOfContentsData;
    this.displayedPage = displayedPage;
  }

  private async countAmountOfChapters() {
    const tableOfContentsRes = await this.bookData.getAllBooksNamesWithChapters();
    await this.tableOfContentsData.convertTableOfContents(tableOfContentsRes);

    for (let x of this.tableOfContentsData.tableOfContentsData) {
      this.amountOfChapters += x.chapters.length;
    }
  }

  countCurrentChapterNumber() {
    this.currentChapterNumber = 0;
    for (
      let x = 0;
      x < this.tableOfContentsData.tableOfContentsData.length;
      x++
    ) {
      for (
        let y = 0;
        y < this.tableOfContentsData.tableOfContentsData[x].chapters.length;
        y++
      ) {
        if (
          x == this.displayedPage.currentVerse.bookId &&
          y == this.displayedPage.currentVerse.chapterId
        ) {
          x = this.tableOfContentsData.tableOfContentsData.length - 1;
          y =
            this.tableOfContentsData.tableOfContentsData[
              this.tableOfContentsData.tableOfContentsData.length - 1
            ].chapters.length - 1;
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

  async render() {
    const html: string = `
          <div class="progress-bar-container">
              <div class="progress-bar"></div>
          </div>`;
    document.querySelector(".page-nav").insertAdjacentHTML("afterbegin", html);

    await this.countAmountOfChapters();
    this.countCurrentChapterNumber();
  }
}
