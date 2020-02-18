import "./css/style.scss";
import { config } from "../config";
import BookData from "./bookdata";
import DisplayedPage from "./displayedpage";
import TableOfContents from "./tableofcontents";
import ReadingProgressBar from "./progressBar";
import TableOfContentsData from "./tableOfContentsData";

const bookData = new BookData(config.bibleApiKey);
const tableOfContentsData = new TableOfContentsData();
let displayedPage = new DisplayedPage(bookData);
let tableOfContents = new TableOfContents(
  bookData,
  tableOfContentsData,
  displayedPage
);
let readingProgressBar = new ReadingProgressBar(
  bookData,
  tableOfContentsData,
  displayedPage
);

displayedPage.render();
readingProgressBar.render();
tableOfContents.render();
