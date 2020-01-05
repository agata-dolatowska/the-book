import "./css/style.scss";
import { config } from "../config";
import BookData from "./bookdata";
import DisplayPage from "./displaypage";

export const bookData = new BookData(config.bibleApiKey);
const page = new DisplayPage();
