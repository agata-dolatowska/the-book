import "./css/style.scss";
import { config } from "../config";
import BookData from "./bookdata";
import DisplayedPage from "./displayedpage";
import TableOfContents from "./tableofcontents";
import ReadingProgressBar from "./progressBar";

export const bookData = new BookData(config.bibleApiKey);
export const tableOfContents = new TableOfContents();
export const displayedPage = new DisplayedPage();
export const readingProgressBar = new ReadingProgressBar();
