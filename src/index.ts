import "./css/style.scss";
import { config } from "../config";
import BookData from "./bookdata";
import DisplayedPage from "./displayedpage";
import TableOfContents from "./tableofcontents";
import ReadingProgressBar from "./progressBar";

const bookData = new BookData(config.bibleApiKey);
let tableOfContents = new TableOfContents();
let displayedPage = new DisplayedPage(bookData);
// export const readingProgressBar = new ReadingProgressBar(bookData);
