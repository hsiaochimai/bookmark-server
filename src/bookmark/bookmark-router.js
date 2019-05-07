const express = require("express");
const uuid = require("uuid/v4");
const logger = require("../logger");
const bookmarkRouter = express.Router();
const bodyParser = express.json();
// const BASE_URL = process.env.BASE_URL
const DB_URL=process.env.DB_URL

const { isWebUri } = require('valid-url')
const BookmarksService= require ('./bookmarks-service')
bookmarkRouter
  .route("/bookmarks")
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
  BookmarksService.getAllBookmarks(knexInstance)
  .then(bookmarks=>{
    res.json(bookmarks)
  })
  .catch(next)
})
  .post(bodyParser, (req, res) => {
    const { title, url, desc, rating } = req.body;
    console.log(req.body)
    if (!title) {
      logger.error(`Title is required`);
      return res.status(400).send("Invalid data");
    }
    if (!url || !isWebUri(url)) {
      logger.error(`url is invalid or missing`);
      return res.status(400).send("Invalid data");
    }
    if (!desc) {
      logger.error(`Description is required`);
      return res.status(400).send("Invalid data");
    }
    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      logger.error(`'${rating}'is invalid`);
      return res.status(400).send("Invalid data");
    }
    const id = uuid();
    const bookmark = {
      id,
      title,
      url,
      desc,
      rating
    };
    bookmarks.push(bookmark)
    logger.info(`bookmark with id ${id} created`);

    res
      .status(201)
      .location(`${BASE_URL}bookmarks/${id}`)
      .json(bookmark);
  })
bookmarkRouter
  .route("/bookmarks/:id")
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
     BookmarksService.getById(knexInstance, req.params.id)
       .then(bookmark => {
        if (!bookmark) {
                  return res.status(404).json({
                     error: { message: `bookmark doesn't exist` }
                   })
                 }
         res.json(bookmark)
       })
       .catch(next)
   })
  .delete((req, res) => {
    const { id } = req.params;
    const bmIndex = bookmarks.findIndex(item => item.id === id)
    if (bmIndex === -1) {
      logger.error(`bookmark with id ${id} not found.`);
      return res.status(404).send('You can not delete a card that does not exist')
    }
    bookmarks.splice(bmIndex, 1)
    logger.info(`bookmark with id ${id} deleted`);
    return res.status(204).send()
  })
module.exports = bookmarkRouter;
