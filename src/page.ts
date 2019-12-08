import { config } from ".././config";

export default class Page {
  apiUrl: string = "https://api.scripture.api.bible/v1/bibles";
  bibleLang: string = "1c9761e0230da6e0-01";
  constructor() {
    this.render();
    this.getChapter();
  }

  async getChapter() {
    const getChapter = await fetch(`${this.apiUrl}/${this.bibleLang}/books`, {
      headers: {
        "api-key": config.bibleApiKey
      }
    });
    const chapterRes = await getChapter.json();
    const chapterName = chapterRes.data[0].id;

    const getChapterId = await fetch(
      `${this.apiUrl}/${this.bibleLang}/books/${chapterName}/chapters`,
      {
        headers: {
          "api-key": config.bibleApiKey
        }
      }
    );
    const chapterIdRes = await getChapterId.json();
    const chapterId = `${chapterIdRes.data[0].id}`;
    this.getPage(chapterId);
  }

  async getPage(chapterId: string) {
    const res = await fetch(
      `${this.apiUrl}/${this.bibleLang}/chapters/${chapterId}`,
      {
        headers: {
          "api-key": config.bibleApiKey
        }
      }
    );
    const jsonRes = await res.json();
    document
      .querySelector(".page")
      .insertAdjacentHTML("afterbegin", JSON.stringify(jsonRes.data.content));
  }

  render() {
    const html: string = `
        <div class='page'>
        </div>
        <button>Previous</button>
        <button>Next</button>
        `;
    document.querySelector("body").insertAdjacentHTML("afterbegin", html);
  }
}
