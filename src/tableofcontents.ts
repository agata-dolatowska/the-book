import TableOfContentsData from "./tableOfContentsData";
import BookData from "./bookdata";
import DisplayedPage from "./displayedpage";

export default class TableOfContents {
  tableOfContentsData: TableOfContentsData;
  bookData: BookData;
  displayedPage: DisplayedPage;

  private bookNameInput: HTMLInputElement;
  private bookAutocomplete: HTMLElement;
  private chapterNumberInput: HTMLInputElement;
  private changeChapterButton: HTMLElement;
  private chapterLength: number;
  private bookId: number;

  constructor(
    bookData: BookData,
    tableOfContentsData: TableOfContentsData,
    displayedPage: DisplayedPage
  ) {
    this.tableOfContentsData = tableOfContentsData;
    this.bookData = bookData;
    this.displayedPage = displayedPage;
  }

  async getBibleData() {
    const tableOfContentsRes = await this.bookData.getAllBooksNamesWithChapters();
    await this.tableOfContentsData.convertTableOfContents(tableOfContentsRes);
  }

  private findBook() {
    this.bookAutocomplete.innerHTML = "";
    if (this.bookNameInput.value != "") {
      const html = this.showBookNames();
      let bookExist = this.tableOfContentsData.tableOfContentsData.filter(
        x =>
          x.bookNameLong.toLowerCase() == this.bookNameInput.value.toLowerCase()
      );
      if (bookExist.length > 0) {
        this.bookAutocomplete.innerHTML = "";
        this.bookId = bookExist[0].bookIdNum;
        this.findChapter();
      } else {
        this.bookId = null;
        this.bookAutocomplete.insertAdjacentHTML("afterbegin", html);
        document.querySelector(".chapter-length").innerHTML = "";
      }
    }
  }

  private setVisibility() {
    document.querySelector(".table-of-contents").classList.toggle("hidden");
  }

  private showBookNames(): string {
    let foundBooks = this.tableOfContentsData.tableOfContentsData.filter(book =>
      book.bookNameLong
        .toLowerCase()
        .includes(this.bookNameInput.value.toLowerCase())
    );
    let html: string = "";
    if (foundBooks.length > 0) {
      for (let book of foundBooks) {
        html += `<p>${book.bookNameLong}</p>`;
      }
    }
    return html;
  }

  private setBookNameFromAutocomplete(e: MouseEvent) {
    this.chapterNumberInput.focus();
    const clickedElement = e.target as HTMLElement;
    this.bookNameInput.value = clickedElement.innerText;
    this.findBook();
  }

  private findChapter() {
    this.bookAutocomplete.innerHTML = "";
    const foundBook = this.tableOfContentsData.tableOfContentsData.find(
      x =>
        x.bookNameLong.toLowerCase() == this.bookNameInput.value.toLowerCase()
    );
    if (foundBook) {
      this.chapterLength = foundBook.chapters.length - 1;
      this.chapterNumberInput.setAttribute(
        "max",
        this.chapterLength.toString()
      );
      document.querySelector(
        ".chapter-length"
      ).innerHTML = `/${this.chapterLength.toString()}`;
    }
  }

  private async changeChapter(e: MouseEvent) {
    e.preventDefault();
    const chapterNumber = parseInt(this.chapterNumberInput.value);
    if (
      chapterNumber >= 0 &&
      chapterNumber < this.chapterLength &&
      this.bookNameInput.value != ""
    ) {
      this.displayedPage.currentVerse.bookId = this.bookId;
      this.displayedPage.currentVerse.chapterId = chapterNumber;

      this.displayedPage.versesList = [];

      const chapterRes = await this.bookData.getChapterData(
        this.tableOfContentsData.tableOfContentsData[
          this.displayedPage.currentVerse.bookId
        ].chapters[this.displayedPage.currentVerse.chapterId].id
      );
      this.displayedPage.getChapterVerses(chapterRes);
      this.setVisibility();
      this.displayedPage.fillPage();
    }
  }

  async render() {
    const html: string = `
    <div class="menu">
    <button class='show-table-of-contents button'>Go to...</button>
    <div class='table-of-contents hidden'>
    <form class='table-of-contents__form'>
      <div class='book-name'>
        <label for="book-name-input">Go to book</label>
        <div class='autocomplete-container'>
          <input id="book-name-input" class='book-name-input table-of-contents__input' type="text" placeholder="book name" autocomplete="off" required>
          <div class="book-name-autocomplete"></div>
        </div>
      </div>
      <div class='chapter-number'>
        <label for="chapter-number-input">Chapter number</label>
        <input id="chapter-number-input" class='chapter-number-input table-of-contents__input' type="number" placeholder="chapter number" min=0 step=1 required>
        <span class="chapter-length"></span>
      </div>
      <button class="change-chapter-button button">Change chapter</button>
    </form>
    </div>
    </div>`;
    document.querySelector("main").insertAdjacentHTML("afterbegin", html);

    await this.getBibleData();

    document
      .querySelector(".show-table-of-contents")
      .addEventListener("click", () => this.setVisibility());
    this.bookNameInput = document.querySelector(".book-name-input");
    this.bookNameInput.addEventListener("input", () => this.findBook());

    this.bookAutocomplete = document.querySelector(".book-name-autocomplete");
    this.bookAutocomplete.addEventListener("click", e =>
      this.setBookNameFromAutocomplete(e)
    );
    this.chapterNumberInput = document.querySelector(".chapter-number-input");
    this.changeChapterButton = document.querySelector(".change-chapter-button");
    this.changeChapterButton.addEventListener("click", e =>
      this.changeChapter(e)
    );
  }
}
