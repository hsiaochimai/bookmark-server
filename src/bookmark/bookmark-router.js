const express = require("express");
const uuid = require("uuid/v4");
const logger = require("../logger");
const bookmarkRouter = express.Router();
const bodyParser = express.json();
const xss = require("xss");
// const BASE_URL = process.env.BASE_URL
const DB_URL = process.env.DB_URL;

const { isWebUri } = require("valid-url");
const BookmarksService = require("./bookmarks-service");
const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url_link: xss(bookmark.url_link),
  descript: xss(bookmark.descript),
  rating: Number(bookmark.rating)
});

bookmarkRouter
  .route("/bookmarks")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    BookmarksService.getAllBookmarks(knexInstance)
    
      .then(bookmarks => {
        console.log(bookmarks)
        res.json(bookmarks.map(serializeBookmark));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { title, url_link, descript, rating } = req.body;
    const newBookmark = { title, url_link, descript, rating };
    for (const [key, value] of Object.entries(newBookmark)) {
      if (value === null) {
        logger.error(`Missing '${key}' in request body`);
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
      if (!isWebUri(url_link)) {
        logger.error(`url is invalid`);
        return res.status(400).send("url is invalid");
      }
      if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
        logger.error(`'${rating}'is invalid`);
        return res.status(400).send("Rating must be a number between 1 and 5");
      }
    }
    BookmarksService.insertBookmarks(req.app.get("db"), newBookmark)
      .then(bookmark => {
        logger.info(`bookmark with id ${bookmark.id} created`)
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(serializeBookmark(bookmark));
      })
      .catch(next)
  });
bookmarkRouter
  .route("/bookmarks/:id")
  .all((req, res, next) => {

    BookmarksService.getById(req.app.get("db"), req.params.id)
      .then(bookmark => {
        if (!bookmark) {
          return res.status(404).json({
            error: { message: `bookmark doesn't exist` }
          });
        }
        res.bookmark = bookmark;
          next();
      })
      .catch(next)
  })
    .get((req, res, next)=>{
      res.json(serializeBookmark(res.bookmark))
    })  
    
  .delete((req, res, next) => {
    
    BookmarksService.deleteBookmarks(req.app.get('db'), req.params.id)
    .then(()=>{
      logger.info(`Bookmark with id ${req.params.id} deleted.`)
      res
      .status(204).end();
      
      
    })
    .catch(next);
  })

module.exports = bookmarkRouter;
