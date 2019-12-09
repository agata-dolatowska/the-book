import { config } from ".././config";

export default class Page {
  apiUrl: string = "https://api.scripture.api.bible/v1/bibles";
  bibleLang: string = "1c9761e0230da6e0-01";
  chaptersList: string[];
  currentChapter: number = 0;
  versesList: string[];
  currentVerse: number = 0;
  constructor() {
    this.render();
    this.getAllChaptersNames();
  }

  async getAllChaptersNames() {
    const getChapter = await fetch(`${this.apiUrl}/${this.bibleLang}/books`, {
      headers: {
        "api-key": config.bibleApiKey
      }
    });
    const chapterRes = await getChapter.json();
    this.chaptersList = chapterRes.data.map((el: any) => el.id);
    this.getAllVersesIdsFromChapter();
  }

  async getAllVersesIdsFromChapter() {
    const getChapterId = await fetch(
      `${this.apiUrl}/${this.bibleLang}/books/${
        this.chaptersList[this.currentChapter]
      }/chapters`,
      {
        headers: {
          "api-key": config.bibleApiKey
        }
      }
    );
    const chapterIdRes = await getChapterId.json();
    this.versesList = chapterIdRes.data.map((el: any) => el.id);
    this.getVerseText(this.versesList[this.currentVerse]);
  }

  async getVerseText(verseId: string) {
    const res = await fetch(
      `${this.apiUrl}/${this.bibleLang}/chapters/${verseId}`,
      {
        headers: {
          "api-key": config.bibleApiKey
        }
      }
    );
    const jsonRes = await res.json();
    document
      .querySelector(".page-text")
      .insertAdjacentHTML("beforeend", JSON.stringify(jsonRes.data.content));
    this.fillPage();
  }

  fillPage() {
    if (
      document.querySelector(".page-text").clientHeight <
      document.querySelector(".page").clientHeight - 50
    ) {
      // this.currentVerse += 1;
      console.log(this.currentVerse);
      this.getVerseText(this.versesList[this.currentVerse]);
    }
  }

  render() {
    const html: string = `
        <div class='page'>
          <div class='page-text'></div>
        </div>
        <button>Previous</button>
        <button>Next</button>
        `;
    document.querySelector("body").insertAdjacentHTML("afterbegin", html);
  }
}
