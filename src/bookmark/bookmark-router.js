const express = require("express");
const uuid = require("uuid/v4");
const logger = require("../logger");
const bookmarkRouter = express.Router();
const bodyParser = express.json();
const bookmarks = require("../store");
const BASE_URL=process.env.BASE_URL
bookmarkRouter
.route("/bookmarks")
.get((req, res) => {
  res.json(bookmarks);
})
.post(bodyParser,(req,res)=>{
    const {title, url, desc, rating}=req.body;
    console.log(req.body)
    if(!title){
        logger.error(`Title is required`);
      return res.status(400).send("Invalid data");
    }
    if(!url){
        logger.error(`url is required`);
        return res.status(400).send("Invalid data"); 
    }
   if(!desc){
    logger.error(`Description is required`);
      return res.status(400).send("Invalid data");
   }
   if (!rating){
    logger.error(`Rating is required`);
    return res.status(400).send("Invalid data");
   }
   const id= uuid();
   const bookmark= {
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
bookmarkRouter.route("/bookmarks/:id").get((req, res) => {
  const { id } = req.params;
  const bookmark = bookmarks.find(bm => bm.id == id);

  if (!bookmark) {
    logger.error(`bookmark with id ${id} not found.`);
    return res.status(404).send("Bookmark Not Found");
  }
  res.json(bookmark);
});
module.exports = bookmarkRouter;