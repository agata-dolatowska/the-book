import { bookData } from "./index";
import { page } from "./index";

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

  private init = (async () => {
    this.getBibleData();
    this.render();

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
  })();

  async getBibleData() {
    await this.saveBibleData(await bookData.getAllBooksNamesWithChapters());
    return this.bibleContents;
  }

  private async saveBibleData(bookContents: JSON) {
    let bibleDataStr = JSON.stringify(bookContents);
    let bibleDataArr = JSON.parse(bibleDataStr);
    if (this.bibleContents.length == 0) {
      for (let x = 0; x < bibleDataArr.data.length; x++) {
        this.bibleContents.push({
          bookIdNum: x,
          bookId: bibleDataArr.data[x].id,
          bookNameLong: bibleDataArr.data[x].nameLong,
          chapters: bibleDataArr.data[x].chapters
        });
      }
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

  private setVisibility() {
    document.querySelector(".table-of-contents").classList.toggle("hidden");
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
    this.bookNameInput.value = clickedElement.innerText;
    this.findBook();
  }

  private findChapter() {
    this.bookAutocomplete.innerHTML = "";
    const foundBook = this.bibleContents.find(
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
      this.setVisibility();
      page.fillPage();
    }
  }

  private render() {
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
  }
}
