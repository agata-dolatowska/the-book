import "./css/style.scss";
import { config } from "../config";
import BookData from "./bookdata";
import DisplayPage from "./displaypage";
import TableOfContents from "./tableofcontents";
import ReadingProgressBar from "./progressBar";

export const bookData = new BookData(config.bibleApiKey);
export const page = new DisplayPage();
export const tableOfContents = new TableOfContents();
export const readingProgressBar = new ReadingProgressBar();
