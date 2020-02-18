export default class TableOfContentsData {
  tableOfContentsData: {
    bookId: string;
    bookIdNum: number;
    bookNameLong: string;
    chapters: {
      id: string;
      number: number;
    }[];
  }[] = [];

  async convertTableOfContents(res: JSON) {
    const bibleDataStr = JSON.stringify(res);
    const bibleDataArr = JSON.parse(bibleDataStr);

    if (this.tableOfContentsData.length == 0) {
      for (let x = 0; x < bibleDataArr.data.length; x++) {
        this.tableOfContentsData.push({
          bookIdNum: x,
          bookId: bibleDataArr.data[x].id,
          bookNameLong: bibleDataArr.data[x].nameLong,
          chapters: bibleDataArr.data[x].chapters
        });
      }
    }
  }
}
