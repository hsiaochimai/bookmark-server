const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const { makeBookmarksArray } = require("./bookmarks.fixture");
const { API_TOKEN } = process.env;

let db;
const testBookmarks = makeBookmarksArray()
const insertBookmarks = () => {
  return db
    .into('bookmarks')
    .insert(testBookmarks)
}

describe.only("Bookmarks Endpoints", function () {

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set("db", db);
  });
  after("disconnect from db", () => db.destroy());
  before("clean the table", () => db("bookmarks").truncate());
  afterEach("cleanup", () => db("bookmarks").truncate());

  describe(`GET /bookmarks`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/bookmarks")
          .set('Authorization', `Bearer ${API_TOKEN}`)
          .expect(200, []);
      });
    });
    context('Given there are bookmarks in the database', () => {
      beforeEach('insert bookmarks', insertBookmarks)
      it('GET /bookmarks responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${API_TOKEN}`)
          .expect(200, testBookmarks)
      })
    })
  });
  describe(`GET /bookmarks/:id `, (done) => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmarkId = 123456;
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set("Authorization", `Bearer ${API_TOKEN}`)
          .expect(404, { error: { message: `bookmark doesn't exist` } });
      });
    });
    context("Given there are bookmarks in the database", () => {
      const testBookmarks = makeBookmarksArray();
      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });
      it(" responds with 200 and the specified bookmark", () => {
        const bookmarkId = 2;
        const expectedBookmarks = testBookmarks[bookmarkId - 1];
         supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set("Authorization", `Bearer ${API_TOKEN}`)
          .expect(200, expectedBookmarks)
          
      });
    });
  });
});
