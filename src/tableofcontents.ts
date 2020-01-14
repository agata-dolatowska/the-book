import { bookData } from "./index";
import { page } from "./index";
import ReadingProgressBar from "./progressbar";

export default class TableOfContents {
  bibleContents: {
    bookId: string;
    bookIdNum: number;
    bookNameLong: string;
    chapters: {
      id: number;
    }[];
  }[] = [];
  private bookNameInput: HTMLInputElement;
  private bookAutocomplete: HTMLElement;
  private chapterNumberInput: HTMLInputElement;
  private changeChapterButton: HTMLElement;
  private chapterLength: number;
  private bookId: number;

  constructor() {
    // this.getBibleData(await bookData.getAllBooksNamesWithChapters());
  }
  private init = (async () => {
    // new ReadingProgressBar(this.bibleContents);
    this.render();
    this.bookNameInput = document.querySelector(".book-name-input");
    this.bookNameInput.addEventListener("input", () => this.findBook());

    this.bookAutocomplete = document.querySelector(".book-name-autocomplete");
    this.bookAutocomplete.addEventListener("click", e =>
      this.setBookNameFromAutocomplete(e)
    );

    this.chapterNumberInput = document.querySelector(".chapter-number-input");

    this.changeChapterButton = document.querySelector(".change-chapter");
    this.changeChapterButton.addEventListener("click", e =>
      this.changeChapter(e)
    );
  })();

  async getBibleData(bookContents: JSON) {
    let kupa = JSON.stringify(bookContents);
    let gunwo = JSON.parse(kupa);
    let laxa = gunwo.data;

    for (let x = 0; x < laxa.length; x++) {
      this.bibleContents.push({
        bookIdNum: x,
        bookId: laxa[x].id,
        bookNameLong: laxa[x].nameLong,
        chapters: laxa[x].chapters
      });
    }
  }

  private findBook() {
    this.bookAutocomplete.innerHTML = "";
    if (this.bookNameInput.value != "") {
      const html = this.showBookNames();
      let bookExist = this.bibleContents.filter(
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

  private showBookNames(): string {
    let foundBooks = this.bibleContents.filter(book =>
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
    this.bookNameInput.value = clickedElement.innerHTML;
    this.findBook();
  }

  private findChapter() {
    this.bookAutocomplete.innerHTML = "";
    const foundBook = this.bibleContents.find(
      x =>
        x.bookNameLong.toLowerCase() == this.bookNameInput.value.toLowerCase()
    );
    if (foundBook) {
      this.chapterLength = foundBook.chapters.length;
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
      page.currentVerse.bookId = this.bookId;
      page.currentVerse.chapterId = chapterNumber;
      page.currentVerse.verseId = 0;
      page.versesList = [];
      page.getAllChaptersIds(
        await bookData.getBooksChaptersData(
          page.booksIdsList[page.currentVerse.bookId]
        )
      );
      page.getChapterVerses(
        await bookData.getChapterData(
          page.booksChaptersIdsList[page.currentVerse.chapterId]
        )
      );
      page.fillPage();
    }
  }

  private render() {
    const html: string = `
    <div class='table-of-contents'>
    <form class='chapter-form'>
      <div class='book-name'>
      <label for="book-name-input">Go to book</label>
        <input id="book-name-input" class='book-name-input' type="text" placeholder="book name" autocomplete="off" required>
        <div class="book-name-autocomplete"></div>
      </div>
      <label for="chapter-number-input">Chapter number</label>
      <input id="chapter-number-input" class='chapter-number-input' type="number" placeholder="chapter number" min=0 step=1 required>
      <span class="chapter-length"></span>
      <button class="change-chapter">Change chapter</button>
    </form>
    </div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", html);
  }
}
